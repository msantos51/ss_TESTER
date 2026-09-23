package com.sunnysales.vendor;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LocationForegroundService extends Service {

    private static final String CHANNEL_ID = "location_channel";
    private static final int NOTIFICATION_ID = 1;

    // (em português) Canal e id separados para o aviso de partilha desligada por
    // inatividade. O canal do serviço é de importância baixa de propósito (a
    // notificação permanente não deve tocar de cada vez); este aviso, esse, tem
    // de chegar ao vendedor mesmo com o telemóvel no bolso.
    private static final String ALERT_CHANNEL_ID = "location_alert_channel";
    private static final int ALERT_NOTIFICATION_ID = 2;

    // (em português) Onde ficam guardados os dados de que o envio nativo precisa
    // (URL da API, id do vendedor e token). São persistidos porque, com
    // START_STICKY, o Android pode matar e relançar o serviço com um `Intent`
    // nulo — sem estes dados guardados o serviço voltava a correr, mas mudo,
    // incapaz de enviar a posição para o servidor.
    static final String PREFS_NAME = "location_service";
    static final String KEY_BASE_URL = "base_url";
    static final String KEY_VENDOR_ID = "vendor_id";
    static final String KEY_TOKEN = "token";

    public static final String EXTRA_BASE_URL = "baseUrl";
    public static final String EXTRA_VENDOR_ID = "vendorId";
    public static final String EXTRA_TOKEN = "token";

    // Distância mínima (m) entre leituras para serem aceites como movimento real,
    // e precisão máxima (m) aceitável — leituras piores são ruído e descartadas,
    // evitando que o pin "mexa" estando o vendedor parado.
    //
    // O tecto de precisão é generoso de propósito: num telemóvel na mão, na
    // praia, o GPS anda muitas vezes nos 20–40 m e um tecto de 15 m descartava
    // todas as leituras — o pin nunca chegava a mexer no mapa do banhista. O
    // que trava o tremer é o filtro de distância abaixo, que cresce com a
    // incerteza da própria leitura.
    private static final float MIN_UPDATE_DISTANCE_METERS = 8f;
    private static final float MAX_ACCEPTABLE_ACCURACY_METERS = 50f;

    // (em português) Parado, o filtro de distância acima deixava o pin preso no
    // primeiro fix aceite — muitas vezes o pior, tirado com o GPS ainda a
    // aquecer — até o vendedor andar tanto quanto o erro desse fix. Agora uma
    // leitura claramente mais precisa (raio de erro a esta fração do anterior,
    // e pelo menos uns metros melhor) substitui a anterior mesmo sem movimento.
    private static final float ACCURACY_IMPROVEMENT_RATIO = 0.6f;
    private static final float MIN_ACCURACY_GAIN_METERS = 3f;

    // Leituras mais velhas do que isto (o Fused às vezes entrega a última que
    // tem em cache) mostram onde o vendedor ESTEVE, não onde está.
    private static final long MAX_LOCATION_AGE_MS = 20 * 1000L;

    // (em português) Quanto tempo o vendedor pode ficar parado antes de a
    // partilha se desligar sozinha. Estar parado meia hora é quase sempre sinal
    // de que a partilha ficou esquecida ligada (o vendedor foi para casa com a
    // app aberta, o telemóvel ficou na mala), e um pin parado na praia é uma
    // informação errada para o banhista e uma exposição desnecessária da
    // posição do vendedor. É o mesmo filtro de movimento real usado acima que
    // conta o tempo: leituras que são só ruído de GPS não contam como andar.
    private static final long INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000L;
    // De quanto em quanto tempo se verifica o relógio da inatividade.
    private static final long INACTIVITY_CHECK_INTERVAL_MS = 60 * 1000L;

    private FusedLocationProviderClient fusedClient;
    private LocationCallback locationCallback;
    private PowerManager.WakeLock wakeLock;
    private Location lastAcceptedLocation;
    private long lastMovementAt;
    private Handler handler;
    private static final long WAKELOCK_RENEW_INTERVAL = 55 * 60 * 1000L;

    // (em português) O envio para o servidor passou a ser feito aqui, no serviço
    // nativo, em vez de ser delegado ao JavaScript da WebView. A WebView é
    // congelada pelo Android quando a app vai para segundo plano ou o ecrã
    // bloqueia, e era isso que fazia o pin do vendedor deixar de se mover no
    // mapa dos banhistas passado algum tempo. O serviço em primeiro plano, esse,
    // continua vivo e por isso continua a enviar a posição.
    private ExecutorService uploadExecutor;
    private String baseUrl;
    private String vendorId;
    private String authToken;

    public interface LocationListener {
        void onLocationUpdate(double lat, double lng);

        // (em português) Avisa o ecrã do mapa de que a partilha foi desligada
        // pelo próprio serviço (inatividade), para o botão voltar a "Partilhar"
        // sem o vendedor ter de fechar e abrir a app.
        void onSharingStopped(String reason);
    }

    private static LocationListener listener;

    public static void setLocationListener(LocationListener l) {
        listener = l;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        fusedClient = LocationServices.getFusedLocationProviderClient(this);
        handler = new Handler(Looper.getMainLooper());
        uploadExecutor = Executors.newSingleThreadExecutor();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        loadUploadConfig(intent);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Sunny Sales")
                .setContentText("A partilhar localização…")
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        // Nova partilha: o aviso da partilha anterior ter sido desligada já não
        // faz sentido na gaveta de notificações.
        NotificationManager alertManager = getSystemService(NotificationManager.class);
        if (alertManager != null) {
            alertManager.cancel(ALERT_NOTIFICATION_ID);
        }

        acquireWakeLock();
        scheduleWakeLockRenewal();
        startLocationUpdates();
        startInactivityWatch();
        return START_STICKY;
    }

    // (em português) Guarda os dados de envio quando o `Intent` os traz (arranque
    // pedido pela app) e volta a lê-los quando não traz (o Android relançou o
    // serviço com um `Intent` nulo). Assim o envio sobrevive a o sistema matar e
    // relançar o serviço.
    private void loadUploadConfig(Intent intent) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (intent != null && intent.hasExtra(EXTRA_VENDOR_ID)) {
            baseUrl = intent.getStringExtra(EXTRA_BASE_URL);
            vendorId = intent.getStringExtra(EXTRA_VENDOR_ID);
            authToken = intent.getStringExtra(EXTRA_TOKEN);
            prefs.edit()
                    .putString(KEY_BASE_URL, baseUrl)
                    .putString(KEY_VENDOR_ID, vendorId)
                    .putString(KEY_TOKEN, authToken)
                    .apply();
        } else {
            baseUrl = prefs.getString(KEY_BASE_URL, null);
            vendorId = prefs.getString(KEY_VENDOR_ID, null);
            authToken = prefs.getString(KEY_TOKEN, null);
        }
    }

    // (em português) Envia a posição para o servidor a partir do serviço nativo.
    // Corre fora da thread principal (a rede na thread principal rebentaria com
    // NetworkOnMainThreadException) e num executor de uma só thread, para as
    // leituras seguirem por ordem. É o mesmo pedido que o JS fazia antes, mas
    // aqui não pode ser congelado com a app em segundo plano.
    private void uploadLocation(final double lat, final double lng, final Float accuracy) {
        final String url = baseUrl;
        final String vendor = vendorId;
        final String token = authToken;
        if (url == null || vendor == null || token == null || uploadExecutor == null) {
            return;
        }
        uploadExecutor.execute(() -> {
            HttpURLConnection conn = null;
            try {
                String endpoint = url.replaceAll("/+$", "") + "/vendors/" + vendor + "/location";
                conn = (HttpURLConnection) new URL(endpoint).openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);
                conn.setDoOutput(true);
                // Sete casas decimais (~1 cm) e o raio de erro da leitura, para o
                // servidor saber distinguir um fix fino de um palpite da rede.
                String body = accuracy != null
                        ? String.format(Locale.US, "{\"lat\":%.7f,\"lng\":%.7f,\"accuracy\":%.1f}", lat, lng, accuracy)
                        : String.format(Locale.US, "{\"lat\":%.7f,\"lng\":%.7f}", lat, lng);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(body.getBytes(StandardCharsets.UTF_8));
                }
                // Ler o código drena a resposta e liberta a ligação para ser
                // reutilizada na leitura seguinte.
                conn.getResponseCode();
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }

    private void acquireWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            return;
        }
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "SunnySales:LocationWakeLock"
        );
        wakeLock.acquire(1 * 60 * 60 * 1000L);
    }

    private void scheduleWakeLockRenewal() {
        handler.postDelayed(this::renewWakeLock, WAKELOCK_RENEW_INTERVAL);
    }

    private void renewWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        acquireWakeLock();
        scheduleWakeLockRenewal();
    }

    private void startLocationUpdates() {
        // Arrancar duas vezes (o Android relança o serviço, o vendedor volta a
        // carregar em partilhar) deixaria dois pedidos ativos a duplicar cada
        // leitura, e só um deles seria cancelado ao parar.
        if (locationCallback != null) {
            fusedClient.removeLocationUpdates(locationCallback);
            locationCallback = null;
        }

        // `setMaxUpdateDelayMillis(0)` desliga o agrupamento de leituras: o
        // Android podia guardar até 30 s de posições e entregá-las de uma vez,
        // e no mapa do banhista isso via-se como um pin parado que só de vez em
        // quando dava um salto. Aqui a posição tem de sair assim que existe.
        LocationRequest request = new LocationRequest.Builder(3000)
                .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                .setMinUpdateIntervalMillis(1000)
                .setMaxUpdateDelayMillis(0)
                // Sem filtro de distância no pedido: o Fused descartava também
                // as leituras que só melhoram a precisão com o vendedor parado.
                // O filtro de ruído é feito abaixo, onde se conhece a precisão.
                .setMinUpdateDistanceMeters(0f)
                .setWaitForAccurateLocation(true)
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                Location location = result.getLastLocation();
                // Não se exige aqui o ouvinte do JS: com a app em segundo plano
                // (ou o processo relançado pelo sistema) ele pode não existir, e
                // o envio para o servidor tem de continuar mesmo assim.
                if (location == null) {
                    return;
                }
                if (location.hasAccuracy() && location.getAccuracy() > MAX_ACCEPTABLE_ACCURACY_METERS) {
                    return;
                }
                long ageMs = (SystemClock.elapsedRealtimeNanos() - location.getElapsedRealtimeNanos()) / 1_000_000L;
                if (ageMs > MAX_LOCATION_AGE_MS) {
                    return;
                }
                boolean moved = true;
                if (lastAcceptedLocation != null) {
                    // O raio de incerteza do GPS (accuracy) pode por si só explicar a
                    // distância entre duas leituras com o vendedor parado, por isso o
                    // limiar de aceitação sobe com a pior das duas precisões em vez de
                    // usar sempre um valor fixo de 8m.
                    float requiredDistance = MIN_UPDATE_DISTANCE_METERS;
                    if (location.hasAccuracy()) {
                        requiredDistance = Math.max(requiredDistance, location.getAccuracy());
                    }
                    if (lastAcceptedLocation.hasAccuracy()) {
                        requiredDistance = Math.max(requiredDistance, lastAcceptedLocation.getAccuracy());
                    }
                    if (lastAcceptedLocation.distanceTo(location) < requiredDistance) {
                        if (!isMuchMoreAccurate(location, lastAcceptedLocation)) {
                            return;
                        }
                        // Não andou: é a mesma posição, só que mais bem medida.
                        moved = false;
                    }
                }
                lastAcceptedLocation = location;
                // Só andar a sério põe o relógio da inatividade a zero; afinar a
                // precisão parado não conta como movimento.
                if (moved) {
                    lastMovementAt = System.currentTimeMillis();
                }
                // Envio para o servidor: feito aqui, no nativo, para não depender
                // da WebView (que o Android congela em segundo plano).
                uploadLocation(
                        location.getLatitude(),
                        location.getLongitude(),
                        location.hasAccuracy() ? location.getAccuracy() : null);
                // O ouvinte só atualiza o mapa local da app quando ela está à
                // frente; pode ser nulo com a app em segundo plano, e isso já não
                // impede o envio acima.
                if (listener != null) {
                    listener.onLocationUpdate(location.getLatitude(), location.getLongitude());
                }
            }
        };

        try {
            fusedClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper());
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }

    // Diz se `candidate` mede a posição claramente melhor do que `previous`.
    private static boolean isMuchMoreAccurate(Location candidate, Location previous) {
        if (!candidate.hasAccuracy() || !previous.hasAccuracy()) {
            return false;
        }
        float next = candidate.getAccuracy();
        float prev = previous.getAccuracy();
        return next <= prev * ACCURACY_IMPROVEMENT_RATIO && prev - next >= MIN_ACCURACY_GAIN_METERS;
    }

    // (em português) Relógio da inatividade. Arranca (ou reinicia) a contagem no
    // momento em que a partilha começa — sem isto, um serviço relançado pelo
    // sistema herdava `lastMovementAt = 0` e desligava a partilha logo na
    // primeira verificação.
    private void startInactivityWatch() {
        lastMovementAt = System.currentTimeMillis();
        handler.removeCallbacks(inactivityCheck);
        handler.postDelayed(inactivityCheck, INACTIVITY_CHECK_INTERVAL_MS);
    }

    private final Runnable inactivityCheck = new Runnable() {
        @Override
        public void run() {
            if (System.currentTimeMillis() - lastMovementAt >= INACTIVITY_TIMEOUT_MS) {
                stopForInactivity();
                return;
            }
            handler.postDelayed(this, INACTIVITY_CHECK_INTERVAL_MS);
        }
    };

    // Desliga a partilha por o vendedor estar parado há demasiado tempo: fecha o
    // trajeto no servidor (é isso que tira o pin do mapa dos banhistas), avisa o
    // vendedor por notificação, avisa o ecrã do mapa se a app estiver à frente e
    // mata o serviço. Voltar a partilhar exige carregar outra vez no botão — é o
    // ponto: a partilha não se retoma sozinha.
    private void stopForInactivity() {
        requestRouteStop();
        showInactivityNotification();
        // Sem os dados de envio guardados, um relançamento do sistema
        // (START_STICKY) não retoma a partilha que acabou de ser desligada.
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().clear().apply();
        if (listener != null) {
            listener.onSharingStopped("inactivity");
        }
        stopSelf();
    }

    // Fecha o trajeto no servidor, do lado nativo, porque isto acontece muitas
    // vezes com a app em segundo plano — o JavaScript da WebView está congelado
    // e não o podia fazer.
    private void requestRouteStop() {
        final String url = baseUrl;
        final String vendor = vendorId;
        final String token = authToken;
        if (url == null || vendor == null || token == null || uploadExecutor == null) {
            return;
        }
        uploadExecutor.execute(() -> {
            HttpURLConnection conn = null;
            try {
                String endpoint = url.replaceAll("/+$", "") + "/vendors/" + vendor + "/routes/stop";
                conn = (HttpURLConnection) new URL(endpoint).openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);
                conn.setFixedLengthStreamingMode(0);
                conn.setDoOutput(true);
                conn.getOutputStream().close();
                conn.getResponseCode();
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }

    private void showInactivityNotification() {
        Intent openApp = new Intent(this, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openApp, flags);

        String text = "Não te moveste nos últimos 30 minutos. Por segurança, a tua localização"
                + " deixou de ser partilhada. Carrega em partilhar para voltar a ficar visível.";
        Notification notification = new NotificationCompat.Builder(this, ALERT_CHANNEL_ID)
                .setContentTitle("Partilha de localização desligada")
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(contentIntent)
                .setAutoCancel(true)
                .build();

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.notify(ALERT_NOTIFICATION_ID, notification);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Localização",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Notificação de partilha de localização");
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);

            NotificationChannel alertChannel = new NotificationChannel(
                    ALERT_CHANNEL_ID,
                    "Avisos de partilha",
                    NotificationManager.IMPORTANCE_HIGH
            );
            alertChannel.setDescription("Avisos sobre a partilha de localização ter sido desligada");
            manager.createNotificationChannel(alertChannel);
        }
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        // Sem dados de envio guardados não há partilha ativa (foi parada pelo
        // vendedor ou desligada por inatividade): relançar o serviço deixava o
        // GPS a correr para nada.
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (prefs.getString(KEY_VENDOR_ID, null) == null) {
            return;
        }
        Intent restartIntent = new Intent(getApplicationContext(), LocationForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getApplicationContext().startForegroundService(restartIntent);
        } else {
            getApplicationContext().startService(restartIntent);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (handler != null) {
            handler.removeCallbacksAndMessages(null);
        }
        if (fusedClient != null && locationCallback != null) {
            fusedClient.removeLocationUpdates(locationCallback);
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        if (uploadExecutor != null) {
            uploadExecutor.shutdown();
            uploadExecutor = null;
        }
        // O ouvinte não é limpo aqui: com START_STICKY o Android pode matar e
        // relançar o serviço sem a app saber, e limpá-lo deixava a partilha
        // viva mas muda. Quem o limpa é o plugin, ao parar a partilha.
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
