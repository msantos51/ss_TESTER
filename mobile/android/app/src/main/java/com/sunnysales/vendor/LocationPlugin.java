package com.sunnysales.vendor;

import android.Manifest;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Ponte entre o ecrã do mapa e o serviço em primeiro plano que segue o GPS.
 *
 * As permissões são pedidas pela API atual do Capacitor (@PermissionCallback).
 * A localização de fundo (ACCESS_BACKGROUND_LOCATION) NUNCA é pedida em
 * conjunto com a de primeiro plano: a partir do Android 11 o sistema descarta
 * o pedido inteiro quando as duas vêm juntas, o que deixava o vendedor sem
 * qualquer permissão — e, por isso, sem atualizações de posição. Também não é
 * necessária: um serviço em primeiro plano do tipo `location`, arrancado com a
 * app visível, continua a receber posições com o ecrã desligado.
 */
@CapacitorPlugin(
    name = "LocationTracker",
    permissions = {
        @Permission(
            alias = LocationPlugin.LOCATION,
            strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }
        ),
        @Permission(alias = LocationPlugin.COARSE_LOCATION, strings = { Manifest.permission.ACCESS_COARSE_LOCATION }),
        @Permission(alias = LocationPlugin.NOTIFICATIONS, strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class LocationPlugin extends Plugin {

    static final String LOCATION = "location";
    static final String COARSE_LOCATION = "coarseLocation";
    static final String NOTIFICATIONS = "notifications";

    @PluginMethod
    public void startTracking(PluginCall call) {
        if (hasLocationPermission()) {
            ensureNotificationPermission(call);
            return;
        }
        requestPermissionForAlias(LOCATION, call, "locationPermissionCallback");
    }

    /**
     * Só pede a localização. O pedido automático do Capacitor abrangeria todos
     * os aliases declarados — incluindo a localização de fundo, que tem de ser
     * pedida à parte.
     */
    @PluginMethod
    @Override
    public void requestPermissions(PluginCall call) {
        if (hasLocationPermission()) {
            call.resolve(permissionStates());
            return;
        }
        requestPermissionForAlias(LOCATION, call, "permissionsRequestCallback");
    }

    @PermissionCallback
    private void permissionsRequestCallback(PluginCall call) {
        call.resolve(permissionStates());
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (!hasLocationPermission()) {
            call.reject("Permissão de localização negada");
            return;
        }
        ensureNotificationPermission(call);
    }

    /**
     * A partir do Android 13 a notificação do serviço fica escondida sem
     * POST_NOTIFICATIONS. É pedida porque a notificação é o que diz ao
     * vendedor que está a partilhar, mas a recusa não trava o seguimento.
     */
    private void ensureNotificationPermission(PluginCall call) {
        if (
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            getPermissionState(NOTIFICATIONS) == PermissionState.GRANTED
        ) {
            startLocationTracking(call);
            return;
        }
        requestPermissionForAlias(NOTIFICATIONS, call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        startLocationTracking(call);
    }

    /**
     * Basta uma das duas: com "Aproximada" o Android concede apenas a grossa,
     * e o vendedor continua a poder partilhar (com menos precisão).
     */
    private boolean hasLocationPermission() {
        return (
            getPermissionState(LOCATION) == PermissionState.GRANTED ||
            getPermissionState(COARSE_LOCATION) == PermissionState.GRANTED
        );
    }

    private JSObject permissionStates() {
        JSObject result = new JSObject();
        result.put(LOCATION, stateName(hasLocationPermission() ? PermissionState.GRANTED : getPermissionState(LOCATION)));
        result.put(NOTIFICATIONS, stateName(getPermissionState(NOTIFICATIONS)));
        return result;
    }

    private String stateName(PermissionState state) {
        return (state == null ? PermissionState.PROMPT : state).toString();
    }

    private void startLocationTracking(PluginCall call) {
        LocationForegroundService.setLocationListener(new LocationForegroundService.LocationListener() {
            @Override
            public void onLocationUpdate(double lat, double lng) {
                JSObject data = new JSObject();
                data.put("lat", lat);
                data.put("lng", lng);
                notifyListeners("locationUpdate", data);
            }

            // O serviço desligou a partilha sozinho (vendedor parado há 30
            // minutos). O ecrã do mapa precisa de saber para o botão voltar a
            // "Partilhar" — o servidor já foi avisado pelo próprio serviço.
            @Override
            public void onSharingStopped(String reason) {
                JSObject data = new JSObject();
                data.put("reason", reason);
                notifyListeners("sharingStopped", data);
            }
        });

        Intent intent = new Intent(getContext(), LocationForegroundService.class);
        // Dados de que o serviço precisa para enviar a posição ele próprio, sem
        // depender do JavaScript da WebView (congelado em segundo plano).
        intent.putExtra(LocationForegroundService.EXTRA_BASE_URL, call.getString("baseUrl"));
        intent.putExtra(LocationForegroundService.EXTRA_VENDOR_ID, call.getString("vendorId"));
        intent.putExtra(LocationForegroundService.EXTRA_TOKEN, call.getString("token"));
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
        } catch (Exception e) {
            LocationForegroundService.setLocationListener(null);
            call.reject("Não foi possível iniciar o seguimento de localização", e);
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void stopTracking(PluginCall call) {
        // Apagar os dados de envio antes de parar o serviço: assim, se o sistema
        // voltar a relançá-lo (START_STICKY), ele não retoma o envio de uma
        // partilha que o vendedor já terminou.
        getContext()
            .getSharedPreferences(LocationForegroundService.PREFS_NAME, android.content.Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply();
        Intent intent = new Intent(getContext(), LocationForegroundService.class);
        getContext().stopService(intent);
        LocationForegroundService.setLocationListener(null);
        call.resolve();
    }
}
