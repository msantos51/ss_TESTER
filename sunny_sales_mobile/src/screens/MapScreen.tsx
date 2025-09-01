import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MapView, { Marker, Callout, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import api, { BASE_URL } from '../services/api';

/** Interface com os dados principais de um vendedor. */
interface Vendor {
  id: number;
  product: string;
  profile_photo: string;
  subscription_active?: boolean;
}

/** Interface para guardar informação do marcador no mapa. */
interface VendorMarker extends Vendor {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [markers, setMarkers] = useState<Record<number, VendorMarker>>({});
  const vendorInfo = useRef<Record<number, Vendor>>({});

  // Obter permissões e localização inicial
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de localização negada');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error: any) {
        console.warn('⚠️ Erro ao obter localização. Verifica se o GPS está ligado.', error.message);
      }
    };
    loadLocation();
  }, []);

  // Carregar vendedores
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const resp = await api.get('/vendors/');
        const map: Record<number, Vendor> = {};
        resp.data.forEach((v: Vendor) => {
          map[v.id] = v;
        });
        vendorInfo.current = map;
      } catch (error) {
        console.error('Erro ao carregar vendedores', error);
      }
    };
    loadVendors();
  }, []);

  // WebSocket para localização em tempo real
  useEffect(() => {
    const wsProtocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = BASE_URL.replace(/^https?/, wsProtocol) + '/ws/locations';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { vendor_id, lat, lng, remove } = data;
        if (remove) {
          setMarkers((prev) => {
            const copy = { ...prev };
            delete copy[vendor_id];
            return copy;
          });
        } else {
          const info = vendorInfo.current[vendor_id];
          if (info) {
            setMarkers((prev) => ({
              ...prev,
              [vendor_id]: {
                ...info,
                latitude: lat,
                longitude: lng,
              },
            }));
          }
        }
      } catch (err) {
        console.error('Erro na mensagem do WebSocket', err);
      }
    };

    return () => ws.close();
  }, []);

  if (!region) {
    return (
      <View style={styles.center}>
        <Text>A obter localização...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      showsUserLocation
      provider={null} // evita dependência de provider específico
      mapType="none" // 👈 remove os mapas base para mostrar apenas o OpenStreetMap
    >
      {/* Renderiza tiles do OpenStreetMap */}
      <UrlTile
        urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />

      {Object.values(markers).map((vendor) => (
        <Marker
          key={vendor.id}
          coordinate={{ latitude: vendor.latitude, longitude: vendor.longitude }}
        >
          <Image
            source={{ uri: `${BASE_URL}/${vendor.profile_photo}` }}
            style={styles.markerImage}
          />
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.product}>{vendor.product}</Text>
              <Text
                style={[
                  styles.status,
                  vendor.subscription_active ? styles.active : styles.inactive,
                ]}
              >
                {vendor.subscription_active ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markerImage: { width: 40, height: 40, borderRadius: 20 },
  callout: { alignItems: 'center' },
  product: { fontWeight: 'bold' },
  status: { marginTop: 4 },
  active: { color: 'green' },
  inactive: { color: 'red' },
});
