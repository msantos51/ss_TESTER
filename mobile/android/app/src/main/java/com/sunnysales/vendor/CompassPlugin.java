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
 *
 * O rumo é para onde o vendedor está virado: o topo do telemóvel quando está
 * deitado, a traseira quando está em pé — ver `headingDegrees`.
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
        // Os eixos são os do ecrã: com o ecrã rodado, os do sensor têm de ser
        // trocados para o topo continuar a ser o topo do que se vê.
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

        JSObject data = new JSObject();
        data.put("heading", headingDegrees(remappedMatrix));
        notifyListeners("heading", data);
    }

    /**
     * Rumo, em graus a partir do norte e no sentido dos ponteiros do relógio,
     * para onde o vendedor está virado, a partir da matriz de rotação já nos
     * eixos do ecrã.
     *
     * O `getOrientation` dá o rumo do topo do ecrã, que só serve com o
     * telemóvel deitado. Em pé — no suporte da carrinha, ou erguido à frente
     * da cara — o topo aponta para o céu e a sua projeção no chão fica quase
     * nula: meio grau de tremor do suporte chegava para ela rodar dezenas de
     * graus, e o mapa rodava sozinho com o vendedor parado. Em pé, para onde
     * ele olha é para onde aponta a traseira do telemóvel. As duas direções
     * entram aqui com o peso da inclinação: deitado conta o topo, em pé conta
     * a traseira, e pelo meio as duas apontam para o mesmo lado e somam-se —
     * sem degrau na passagem de uma para a outra.
     */
    static double headingDegrees(float[] r) {
        // Colunas da matriz: os eixos do telemóvel no referencial do mundo
        // (este, norte, cima). Y é o topo do ecrã; Z sai do ecrã para a cara,
        // por isso a traseira é -Z.
        double topEast = r[1];
        double topNorth = r[4];
        double topUp = r[7];
        // Peso do topo: o tamanho da sua projeção no chão (1 deitado, 0 em
        // pé). Peso da traseira: quanto o topo aponta para cima (o contrário).
        double flat = Math.hypot(topEast, topNorth);
        double east = flat * topEast - topUp * r[2];
        double north = flat * topNorth - topUp * r[5];
        return (Math.toDegrees(Math.atan2(east, north)) + 360.0) % 360.0;
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
