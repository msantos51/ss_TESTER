// (em português) Tarefa em background para enviar localização periódica do vendedor ao backend.
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { updateLocation } from '~/services/vendor';

export const LOCATION_TASK = 'vendor-location-task';

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const { locations } = data as any;
  const last = locations?.[0];
  if (last) {
    await updateLocation(last.coords.latitude, last.coords.longitude);
  }
});

export async function startLocationSharing() {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return;

  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000,
    distanceInterval: 5,
    pausesUpdatesAutomatically: true,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Sunny Sales',
      notificationBody: 'A partilhar a tua localização.'
    }
  });
}

export async function stopLocationSharing() {
  const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (running) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
}
