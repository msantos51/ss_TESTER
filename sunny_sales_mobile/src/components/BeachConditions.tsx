import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

// Widget "Condições de Praia" para mobile
export default function BeachConditions() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [tides, setTides] = useState<any[]>([]);
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
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
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
    if (!coords) return;
    const fetchData = async () => {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto`;
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${coords.latitude}&longitude=${coords.longitude}&hourly=sea_level_height&length=1&timezone=auto`;
        const [wRes, mRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(marineUrl),
        ]);
        const wData = await wRes.json();
        const mData = await mRes.json();
        setWeather({
          temperature: wData.current?.temperature_2m,
          wind: wData.current?.wind_speed_10m,
          humidity: wData.current?.relative_humidity_2m,
          uvMax: wData.daily?.uv_index_max?.[0],
          timezone: wData.timezone,
        });
        const tideEvents = calcTides(
          mData.hourly?.time || [],
          mData.hourly?.sea_level_height || []
        );
        setTides(tideEvents);
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [coords]);

  const fmt = (t: string) =>
    new Date(t).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: weather?.timezone || 'UTC',
    });

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
      <View style={styles.block}>
        <Text>Temperatura: {weather.temperature}°C</Text>
        <Text>Vento: {weather.wind} km/h</Text>
        <Text>Humidade: {weather.humidity}%</Text>
        <Text>UV máx: {weather.uvMax}</Text>
      </View>
      <View style={styles.block}>
        <Text>Marés de hoje:</Text>
        {tides.map((t) => (
          <Text key={t.time}>
            {t.type === 'high' ? 'Alta' : 'Baixa'} {fmt(t.time)}
          </Text>
        ))}
      </View>
      <Text style={styles.warning}>
        Estimativa para uso recreativo; não usar para navegação.
      </Text>
    </View>
  );
}

function calcTides(times: string[], levels: number[]) {
  const events: { type: 'high' | 'low'; time: string }[] = [];
  for (let i = 1; i < levels.length - 1; i++) {
    const prev = levels[i - 1];
    const curr = levels[i];
    const next = levels[i + 1];
    if (curr > prev && curr > next) events.push({ type: 'high', time: times[i] });
    if (curr < prev && curr < next) events.push({ type: 'low', time: times[i] });
  }
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const unique: typeof events = [];
  for (const ev of events) {
    const last = unique[unique.length - 1];
    if (!last || new Date(ev.time).getTime() - new Date(last.time).getTime() >= 60 * 60 * 1000) {
      unique.push(ev);
    }
  }
  return unique;
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
