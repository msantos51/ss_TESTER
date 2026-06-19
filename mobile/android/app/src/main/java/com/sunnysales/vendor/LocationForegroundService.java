package com.sunnysales.vendor;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

public class LocationForegroundService extends Service {

    private static final String CHANNEL_ID = "location_channel";
    private static final int NOTIFICATION_ID = 1;

    // Distância mínima (m) entre leituras para serem aceites como movimento real,
    // e precisão máxima (m) aceitável — leituras piores são ruído e descartadas,
    // evitando que o pin "mexa" estando o vendedor parado.
    private static final float MIN_UPDATE_DISTANCE_METERS = 8f;
    private static final float MAX_ACCEPTABLE_ACCURACY_METERS = 15f;

    private FusedLocationProviderClient fusedClient;
    private LocationCallback locationCallback;
    private PowerManager.WakeLock wakeLock;
    private Location lastAcceptedLocation;

    public interface LocationListener {
        void onLocationUpdate(double lat, double lng);
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
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
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

        acquireWakeLock();
        startLocationUpdates();
        return START_STICKY;
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
        wakeLock.acquire(10 * 60 * 60 * 1000L);
    }

    private void startLocationUpdates() {
        LocationRequest request = new LocationRequest.Builder(1000)
                .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                .setMinUpdateIntervalMillis(1000)
                .setMinUpdateDistanceMeters(MIN_UPDATE_DISTANCE_METERS)
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                Location location = result.getLastLocation();
                if (location == null || listener == null) {
                    return;
                }
                if (location.hasAccuracy() && location.getAccuracy() > MAX_ACCEPTABLE_ACCURACY_METERS) {
                    return;
                }
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
                        return;
                    }
                }
                lastAcceptedLocation = location;
                listener.onLocationUpdate(location.getLatitude(), location.getLongitude());
            }
        };

        try {
            fusedClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper());
        } catch (SecurityException e) {
            e.printStackTrace();
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
        }
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
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
        if (fusedClient != null && locationCallback != null) {
            fusedClient.removeLocationUpdates(locationCallback);
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        listener = null;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
