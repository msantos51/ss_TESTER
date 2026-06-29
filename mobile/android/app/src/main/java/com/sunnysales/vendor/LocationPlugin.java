package com.sunnysales.vendor;

import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LocationTracker", permissions = {
        android.Manifest.permission.ACCESS_FINE_LOCATION,
        android.Manifest.permission.ACCESS_COARSE_LOCATION,
        android.Manifest.permission.ACCESS_BACKGROUND_LOCATION
})
public class LocationPlugin extends Plugin {

    @PluginMethod
    public void startTracking(PluginCall call) {
        requestPermissions(call);
    }

    @Override
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.handleRequestPermissionsResult(requestCode, permissions, grantResults);
        PluginCall savedCall = getSavedCall();
        if (savedCall == null) {
            return;
        }

        if (getPermissionState("ACCESS_FINE_LOCATION") == PermissionState.GRANTED) {
            startLocationTracking(savedCall);
        } else {
            savedCall.reject("Permissão de localização negada");
        }
    }

    private void startLocationTracking(PluginCall call) {
        LocationForegroundService.setLocationListener((lat, lng) -> {
            JSObject data = new JSObject();
            data.put("lat", lat);
            data.put("lng", lng);
            notifyListeners("locationUpdate", data);
        });

        Intent intent = new Intent(getContext(), LocationForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopTracking(PluginCall call) {
        Intent intent = new Intent(getContext(), LocationForegroundService.class);
        getContext().stopService(intent);
        call.resolve();
    }
}
