import { useEffect } from 'react';
import * as Location from 'expo-location';
import { socket } from '../services/socket';

export function useLiveLocation(sellerId: string) {
  useEffect(() => {
    let watch: Location.LocationSubscription;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      watch = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        loc => {
          socket.emit('location', { sellerId, coords: loc.coords });
        }
      );
    }

    start();
    return () => {
      watch && watch.remove();
    };
  }, [sellerId]);
}
