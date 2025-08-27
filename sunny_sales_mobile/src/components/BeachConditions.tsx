import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';

import { Picker } from '@react-native-picker/picker';

import * as Location from 'expo-location';

// Widget "Condições de Praia" para mobile
export default function BeachConditions() {

  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [beaches, setBeaches] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização negada.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});

      setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      setError(null);
    } catch (e) {
      setError('Erro ao obter localização.');
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {

    if (!userCoords) return;
    const fetchBeaches = async () => {
      try {
        const overpass = `https://overpass-api.de/api/interpreter?data=[out:json];(node(around:25000,${userCoords.latitude},${userCoords.longitude})[natural=beach];way(around:25000,${userCoords.latitude},${userCoords.longitude})[natural=beach];relation(around:25000,${userCoords.latitude},${userCoords.longitude})[natural=beach];);out center;`;
        const res = await fetch(overpass);
        const data = await res.json();
        const list = data.elements
          ?.filter((e: any) => e.tags?.name && (e.lat || e.center))
          .map((e: any) => ({
            id: e.id,
            name: e.tags.name,
            latitude: e.lat || e.center.lat,
            longitude: e.lon || e.center.lon,
          })) || [];
        const withCurrent = [
          { id: 'current', name: 'Localização atual', latitude: userCoords.latitude, longitude: userCoords.longitude },
          ...list,
        ];
        setBeaches(withCurrent);
        setSelected(withCurrent[0]);
      } catch {
        const fallback = { id: 'current', name: 'Localização atual', latitude: userCoords.latitude, longitude: userCoords.longitude };
        setBeaches([fallback]);
        setSelected(fallback);
      }
    };
    fetchBeaches();
  }, [userCoords]);

  useEffect(() => {
    if (!selected) return;
    const fetchData = async () => {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${selected.latitude}&longitude=${selected.longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto`;

        const wRes = await fetch(weatherUrl);
        const wData = await wRes.json();
        setWeather({
          temperature: wData.current?.temperature_2m,
          wind: wData.current?.wind_speed_10m,
          humidity: wData.current?.relative_humidity_2m,
          uvMax: wData.daily?.uv_index_max?.[0],
          timezone: wData.timezone,
        });
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

  }, [selected]);


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
        <Button title="Tentar novamente" onPress={requestLocation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {beaches.length > 0 && (
        <Picker
          selectedValue={selected?.id}
          onValueChange={(val) => {
            setLoading(true);
            setError(null);
            const b = beaches.find((b) => String(b.id) === String(val));
            setSelected(b);
          }}
        >
          {beaches.map((b) => (
            <Picker.Item label={b.name} value={b.id} key={b.id} />
          ))}
        </Picker>
      )}

      <View style={styles.block}>
        <Text>Temperatura: {weather.temperature}°C</Text>
        <Text>Vento: {weather.wind} km/h</Text>
        <Text>Humidade: {weather.humidity}%</Text>
        <Text>UV máx: {weather.uvMax}</Text>
      </View>
      <Text style={styles.warning}>
        Estimativa para uso recreativo; não usar para navegação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignSelf: 'stretch',
  },
  block: {
    marginBottom: 8,
  },
  warning: {
    fontSize: 12,
    color: '#555',
  },
});
