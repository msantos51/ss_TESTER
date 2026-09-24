package com.sunnysales.vendor;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Surface;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Rumo do telemóvel lido do sensor de rotação do Android, em graus a partir do
 * norte e no sentido dos ponteiros do relógio.
 *
 * Os eventos `deviceorientation` da WebView não são de confiança: no telemóvel
 * do vendedor o mapa da app rodava ao contrário do mapa do site, com o mesmo
 * código JavaScript. Aqui o rumo sai direto do sensor, como no Google Maps.
 */
@CapacitorPlugin(name = "Compass")
public class CompassPlugin extends Plugin implements SensorEventListener {

    private static final long MIN_INTERVAL_MS = 16;

    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private boolean running = false;
    private long lastEmitMs = 0;
    private final float[] rotationMatrix = new float[9];
    private final float[] remappedMatrix = new float[9];
    private final float[] orientation = new float[3];

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager == null) return;
        rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotationSensor == null) {
            rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (sensorManager == null || rotationSensor == null) {
            call.reject("Sem sensor de rotação");
            return;
        }
        running = true;
        register();
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        running = false;
        unregister();
        call.resolve();
    }

    @Override
    protected void handleOnResume() {
        if (running) register();
    }

    @Override
    protected void handleOnPause() {
        unregister();
    }

    @Override
    protected void handleOnDestroy() {
        running = false;
        unregister();
    }

    private void register() {
        sensorManager.unregisterListener(this);
        sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_GAME);
    }

    private void unregister() {
        if (sensorManager != null) sensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        long now = System.currentTimeMillis();
        if (now - lastEmitMs < MIN_INTERVAL_MS) return;
        lastEmitMs = now;

        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);
        // O rumo é o do topo do ecrã: com o ecrã rodado, os eixos do sensor
        // têm de ser trocados para continuarem a bater com o que se vê.
        int axisX = SensorManager.AXIS_X;
        int axisY = SensorManager.AXIS_Y;
        switch (displayRotation()) {
            case Surface.ROTATION_90:
                axisX = SensorManager.AXIS_Y;
                axisY = SensorManager.AXIS_MINUS_X;
                break;
            case Surface.ROTATION_180:
                axisX = SensorManager.AXIS_MINUS_X;
                axisY = SensorManager.AXIS_MINUS_Y;
                break;
            case Surface.ROTATION_270:
                axisX = SensorManager.AXIS_MINUS_Y;
                axisY = SensorManager.AXIS_X;
                break;
            default:
                break;
        }
        SensorManager.remapCoordinateSystem(rotationMatrix, axisX, axisY, remappedMatrix);
        SensorManager.getOrientation(remappedMatrix, orientation);

        double heading = (Math.toDegrees(orientation[0]) + 360.0) % 360.0;
        JSObject data = new JSObject();
        data.put("heading", heading);
        notifyListeners("heading", data);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // O Android recalibra sozinho; não há nada a mostrar ao vendedor.
    }

    @SuppressWarnings("deprecation")
    private int displayRotation() {
        WindowManager wm = (WindowManager) getContext().getSystemService(Context.WINDOW_SERVICE);
        return wm == null ? Surface.ROTATION_0 : wm.getDefaultDisplay().getRotation();
    }
}
