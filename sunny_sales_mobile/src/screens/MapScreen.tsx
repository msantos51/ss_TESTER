import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
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

/**
 * Ecrã que mostra o mapa com a localização do utilizador
 * e dos vendedores em tempo real.
 */
export default function MapScreen() {
  // Região atual do mapa (centrada na posição do utilizador)
  const [region, setRegion] = useState<Region | null>(null);
  // Lista de vendedores com coordenadas para desenhar no mapa
  const [markers, setMarkers] = useState<Record<number, VendorMarker>>({});
  // Referência com informação base dos vendedores (foto, produto, etc.)
  const vendorInfo = useRef<Record<number, Vendor>>({});

  // Obtém permissões e localização inicial do utilizador
  useEffect(() => {
    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    };
    loadLocation();
  }, []);

  // Carrega informação estática de todos os vendedores
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

  // Liga ao WebSocket para receber posições em tempo real
  useEffect(() => {
    const wsProtocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = BASE_URL.replace(/^https?/, wsProtocol) + '/ws/locations';
    const ws = new WebSocket(wsUrl);

    // Quando chega uma nova localização
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { vendor_id, lat, lng, remove } = data;
        if (remove) {
          // Remove marcador quando vendedor fica inativo
          setMarkers((prev) => {
            const copy = { ...prev };
            delete copy[vendor_id];
            return copy;
          });
        } else {
          // Atualiza ou adiciona marcador com dados do vendedor
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

    // Fecha ligação ao desmontar o componente
    return () => ws.close();
  }, []);

  // Se ainda não temos a posição do utilizador, mostra um indicador simples
  if (!region) {
    return (
      <View style={styles.center}>
        <Text>A obter localização...</Text>
      </View>
    );
  }

  // Renderiza o mapa com a localização do utilizador e dos vendedores
  return (
    <MapView style={styles.map} initialRegion={region} showsUserLocation>
      {Object.values(markers).map((vendor) => (
        <Marker
          key={vendor.id}
          coordinate={{ latitude: vendor.latitude, longitude: vendor.longitude }}
        >
          {/* Foto do vendedor usada como ícone do marcador */}
          <Image
            source={{ uri: `${BASE_URL}/${vendor.profile_photo}` }}
            style={styles.markerImage}
          />
          {/* Informações apresentadas quando o marcador é clicado */}
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

// Estilos do ecrã
const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  callout: {
    alignItems: 'center',
  },
  product: {
    fontWeight: 'bold',
  },
  status: {
    marginTop: 4,
  },
  active: {
    color: 'green',
  },
  inactive: {
    color: 'red',
  },
});
