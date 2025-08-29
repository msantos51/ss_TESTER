// app/(client)/map.tsx
// Ecrã de mapa público para clientes verem vendedores em tempo real

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../../src/services/api';
import { Vendor } from '../../src/types';

export default function PublicMap() {
  // estado com lista de vendedores vindos do backend
  const [vendors, setVendors] = useState<Vendor[]>([]);
  // lista de produtos possíveis para filtrar
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'] as const;
  // produtos selecionados no filtro
  const [selectedProducts, setSelectedProducts] = useState<string[]>([...PRODUCTS]);
  // localização atual do cliente
  const [clientPos, setClientPos] = useState<{ lat: number; lng: number } | null>(null);
  // referência para o componente do mapa
  const mapRef = useRef<MapView | null>(null);

  // obtém vendedores do backend periodicamente
  useEffect(() => {
    let interval: NodeJS.Timer;
    const fetchVendors = async () => {
      try {
        const res = await api.get<Vendor[]>('/vendors/');
        setVendors(res.data);
      } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
      }
    };
    fetchVendors();
    interval = setInterval(fetchVendors, 1000);
    return () => clearInterval(interval);
  }, []);

  // acompanha a localização do cliente e centra o mapa
  useEffect(() => {
    let subscription: Location.LocationSubscription;
    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setClientPos(coords);
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    };
    startWatching();
    return () => subscription && subscription.remove();
  }, []);

  // alterna um produto no filtro
  const toggleProduct = (p: string) => {
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  // filtra vendedores ativos com base nos produtos selecionados
  const filteredVendors = vendors.filter(
    (v) => v.current_lat && v.current_lng && selectedProducts.includes(v.product)
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {PRODUCTS.map((p) => (
          <Pressable
            key={p}
            onPress={() => toggleProduct(p)}
            style={[
              styles.filterItem,
              selectedProducts.includes(p) && styles.filterItemSelected,
            ]}
          >
            <Text>{p}</Text>
          </Pressable>
        ))}
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 38.7169,
          longitude: -9.1399,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {clientPos && (
          <Marker
            coordinate={{
              latitude: clientPos.lat,
              longitude: clientPos.lng,
            }}
            pinColor="blue"
            title="Você está aqui"
          />
        )}
        {filteredVendors.map((v) => (
          <Marker
            key={v.id}
            coordinate={{
              latitude: v.current_lat!,
              longitude: v.current_lng!,
            }}
            pinColor={v.pin_color || '#FFB6C1'}
            title={v.name}
            description={v.product}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  // container geral do ecrã
  container: { flex: 1 },
  // área com os filtros de produto
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  // estilo de cada opção de filtro
  filterItem: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  // estilo quando a opção está selecionada
  filterItemSelected: {
    backgroundColor: '#ffd700',
  },
  // área do mapa
  map: { flex: 1 },
});

