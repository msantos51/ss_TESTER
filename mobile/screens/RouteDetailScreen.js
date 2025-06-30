// Tela que exibe detalhes de um trajeto
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme';
import LeafletMap from '../LeafletMap';
import BackButton from '../BackButton';

export default function RouteDetailScreen({ route }) {
  // r
  const r = route.params.route;
  // polyline
  const polyline = r.points.map((p) => [p.lat, p.lng]);
  // start
  const start = new Date(r.start_time);
  // end
  const end = r.end_time ? new Date(r.end_time) : null;
  // durationMin
  const durationMin = end ? Math.round((end - start) / 60000) : 0;
  // initial
  const initial = polyline.length
    ? { latitude: polyline[0][0], longitude: polyline[0][1] }
    : { latitude: 0, longitude: 0 };
  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      <LeafletMap initialPosition={initial} polyline={polyline} />
      <View style={styles.info}>
        <Text>Início: {start.toLocaleString()}</Text>
        {end && <Text>Fim: {end.toLocaleString()}</Text>}
        <Text>Duração: {durationMin} min</Text>
        <Text>Distância: {(r.distance_m / 1000).toFixed(2)} km</Text>
      </View>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  info: { padding: 16 },
  back: { position: 'absolute', top: 16, left: 16, zIndex: 1 },
});
