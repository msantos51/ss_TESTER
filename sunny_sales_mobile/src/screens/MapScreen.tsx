import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
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
  /** Produtos disponíveis para filtragem. */
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState<string[]>([...PRODUCTS]);
  const [region, setRegion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markers, setMarkers] = useState<Record<number, VendorMarker>>({});
  const vendorInfo = useRef<Record<number, Vendor>>({});
  const webViewRef = useRef<WebView>(null);

  /**
   * Obtém a localização atual e atualiza o estado para recentrar o mapa.
   * Também envia a nova região para o WebView através do useEffect existente.
   */
  const handleLocate = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (error: any) {
      console.warn('⚠️ Não foi possível obter a localização atual.', error.message);
    }
  };

  /**
   * Alterna a presença de um produto na lista de filtragem.
   */
  const toggleProduct = (product: string) => {
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );
  };

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
        setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
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

  // Enviar localização para o WebView
  useEffect(() => {
    if (region && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: 'region', data: region })
      );
    }
  }, [region]);

  // Enviar marcadores filtrados para o WebView
  useEffect(() => {
    if (webViewRef.current) {
      const payload = Object.values(markers)
        .filter((m) => selectedProducts.includes(m.product))
        .map((m) => ({
          ...m,
          profile_photo: `${BASE_URL}/${m.profile_photo}`,
        }));
      webViewRef.current.postMessage(
        JSON.stringify({ type: 'markers', data: payload })
      );
    }
  }, [markers, selectedProducts]);

  // Conteúdo HTML com Leaflet
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .marker-img { border-radius: 20px; }
          .popup { text-align: center; }
          .active { color: green; }
          .inactive { color: red; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([0,0], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          var markers = {};
          var userMarker = null;
          function updateMarkers(data) {
            var ids = new Set();
            data.forEach(function(m){
              ids.add(m.id);
              var icon = L.icon({
                iconUrl: m.profile_photo,
                iconSize: [40,40],
                className: 'marker-img'
              });
              if (markers[m.id]) {
                markers[m.id].setLatLng([m.latitude, m.longitude]);
              } else {
                var marker = L.marker([m.latitude, m.longitude], { icon: icon }).addTo(map);
                var statusClass = m.subscription_active ? 'active' : 'inactive';
                marker.bindPopup('<div class="popup"><div>'+m.product+'</div><div class="'+statusClass+'">'+(m.subscription_active ? 'Ativo' : 'Inativo')+'</div></div>');
                markers[m.id] = marker;
              }
            });
            for (var id in markers) {
              if (!ids.has(Number(id))) {
                map.removeLayer(markers[id]);
                delete markers[id];
              }
            }
          }
          document.addEventListener('message', function(event){
            var msg = JSON.parse(event.data);
            if (msg.type === 'region') {
              map.setView([msg.data.latitude, msg.data.longitude], 15);
              if (userMarker) {
                userMarker.setLatLng([msg.data.latitude, msg.data.longitude]);
              } else {
                userMarker = L.marker([msg.data.latitude, msg.data.longitude], {
                  icon: L.divIcon({
                    className: 'client-pin',
                    html: '<div style="background:#1976d2;width:24px;height:24px;border-radius:50%;border:2px solid white"></div>'
                  })
                }).addTo(map);
              }
            } else if (msg.type === 'markers') {
              updateMarkers(msg.data);
            }
          });
        </script>
      </body>
    </html>
  `;

if (!region) {
  return (
    <View style={styles.center}>
      <Text>A obter localização...</Text>
    </View>
  );
}

return (
  <View style={styles.container}>
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: mapHtml }}
      style={styles.map}
    />
    <View style={styles.filtersContainer}>
      <Text style={styles.filterTitle}>Vendedores:</Text>
      <View style={styles.filterList}>
        {PRODUCTS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.filterButton,
              selectedProducts.includes(p) && styles.filterButtonActive,
            ]}
            onPress={() => toggleProduct(p)}
            accessibilityLabel={`Filtrar ${p}`}
          >
            <Text
              style={[
                styles.filterText,
                selectedProducts.includes(p) && styles.filterTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    <TouchableOpacity
      style={styles.locateButton}
      onPress={handleLocate}
      accessibilityLabel="Ir para a minha localização"
    >
      <Ionicons name="locate" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);
}  // ✅ aqui fecha a função MapScreen

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filtersContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 8,
  },
  filterTitle: { fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  filterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976d2',
    margin: 4,
  },
  filterButtonActive: { backgroundColor: '#1976d2' },
  filterText: { color: '#1976d2', fontSize: 12 },
  filterTextActive: { color: '#fff' },
  locateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1976d2',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

