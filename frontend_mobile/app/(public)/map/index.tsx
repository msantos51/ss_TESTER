// (em português) Mapa público com pins de vendedores ativos e filtro por produto.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { getActiveVendors } from '~/services/vendor';
import ProductFilter from '~/components/ProductFilter';

const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'] as const;

export default function PublicMapScreen() {
  const [region, setRegion] = useState({
    latitude: 38.7,
    longitude: -9.2,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  });
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([...PRODUCTS]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        setRegion(r => ({ ...r, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      }
      const data = await getActiveVendors();
      setVendors(data || []);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region} onRegionChangeComplete={setRegion}>
        {vendors
          .filter(v => selectedProducts.includes(v.product))
          .map(v => (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.current_lat, longitude: v.current_lng }}
              title={v.name}
              description={v.product}
            >
              <Callout>
                {/* (em português) Aqui podemos mostrar foto, rating e ações (favorito) */}
              </Callout>
            </Marker>
          ))}
      </MapView>
      <ProductFilter
        products={PRODUCTS as unknown as string[]}
        selected={selectedProducts}
        onToggle={(p) =>
          setSelectedProducts(s =>
            s.includes(p) ? s.filter(x => x !== p) : [...s, p]
          )
        }
      />
    </View>
  );
}
