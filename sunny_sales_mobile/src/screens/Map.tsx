import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import api from '../services/api';

export default function MapScreen() {
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/sellers/active').then(({ data }) => setSellers(data));
  }, []);

  return (
    <MapView style={{ flex: 1 }}>
      {sellers.map(s => (
        <Marker
          key={s.id}
          coordinate={{ latitude: s.lat, longitude: s.lng }}
          title={s.name}
          description={s.product}
        />
      ))}
    </MapView>
  );
}
