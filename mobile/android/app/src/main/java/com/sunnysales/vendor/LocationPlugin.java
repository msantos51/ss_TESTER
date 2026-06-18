package com.sunnysales.vendor;

import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LocationTracker")
public class LocationPlugin extends Plugin {

    @PluginMethod
    public void startTracking(PluginCall call) {
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
