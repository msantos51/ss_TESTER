// Hook para enviar notificacoes quando um vendedor esta perto
import { useEffect } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function useProximityNotifications(
  vendors,
  radius = 500,
  favoriteIds = []
) {
  useEffect(() => {
    let sub;
    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const notif = await Notifications.requestPermissionsAsync();
      if (notif.status !== 'granted') return;

      sub = await Location.watchPositionAsync(
        {
          // Maior precisão para detectar proximidade com exatidão
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 50,
        },
        (loc) => {
          vendors.forEach((v) => {
            if (favoriteIds.length && !favoriteIds.includes(v.id)) return;
            if (v.current_lat != null && v.current_lng != null) {
              const dist = distanceMeters(
                loc.coords.latitude,
                loc.coords.longitude,
                v.current_lat,
                v.current_lng
              );
              if (dist <= radius) {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Vendedor próximo',
                    body: `${v.name || 'Vendedor'} está a ${Math.round(dist)}m de si`,
                  },
                  trigger: null,
                });
              }
            }
          });
        }
      );
    };
    start();
    return () => {
      sub && sub.remove();
    };
  }, [vendors, radius, favoriteIds]);
}
