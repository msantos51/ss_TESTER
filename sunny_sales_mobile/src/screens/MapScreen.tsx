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
  const [heading, setHeading] = useState<number | null>(null);
  const [markers, setMarkers] = useState<Record<number, VendorMarker>>({});
  const vendorInfo = useRef<Record<number, Vendor>>({});
  const webViewRef = useRef<WebView>(null);
  const shouldRecenterRef = useRef(true);
  // True enquanto o GPS fornecer curso válido; evita que a bússola substitua o GPS durante o movimento
  const gpsCourseActiveRef = useRef(false);

  /**
   * Centra o mapa na posição atual com alta precisão.
   */
  const handleLocate = async () => {
    shouldRecenterRef.current = true;
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
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

  // Tracking contínuo de localização e bússola
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;
    // Low-pass filter para suavizar o heading da bússola e reduzir jitter
    let smoothedHeading: number | null = null;
    const COMPASS_ALPHA = 0.25; // 0 = sem resposta, 1 = sem suavização
    const MAX_COMPASS_ACCURACY_DEG = 20; // ignora leituras com precisão inferior a 20°
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        return;
      }
      // Localização inicial com máxima precisão
      try {
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setRegion({ latitude: initial.coords.latitude, longitude: initial.coords.longitude });
      } catch (e) {
        console.warn('Erro na localização inicial', e);
      }
      // Tracking contínuo com alta precisão
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500,
          distanceInterval: 0.5,
        },
        (loc) => {
          setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          // Curso GPS: direção real de deslocamento (válido quando em movimento)
          if (loc.coords.heading != null && loc.coords.heading >= 0) {
            gpsCourseActiveRef.current = true;
            smoothedHeading = loc.coords.heading;
            setHeading(loc.coords.heading);
          } else {
            gpsCourseActiveRef.current = false;
          }
        }
      );
      // Bússola: usada apenas quando o GPS não fornece curso (ex: dispositivo parado)
      headingSub = await Location.watchHeadingAsync((headingData) => {
        if (gpsCourseActiveRef.current) return;
        // Rejeitar leituras com baixa qualidade (accuracy em graus)
        if (headingData.accuracy > MAX_COMPASS_ACCURACY_DEG) return;
        const raw = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
        if (raw < 0) return;
        // Interpolação angular para evitar saltos nos 0°/360°
        if (smoothedHeading === null) {
          smoothedHeading = raw;
        } else {
          let diff = raw - smoothedHeading;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          smoothedHeading = (smoothedHeading + COMPASS_ALPHA * diff + 360) % 360;
        }
        setHeading(smoothedHeading);
      });
    })();
    return () => {
      sub?.remove();
      headingSub?.remove();
    };
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

  // Enviar posição + heading para o WebView
  useEffect(() => {
    if (region && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'region',
          data: { ...region, heading, recenter: shouldRecenterRef.current },
        })
      );
      shouldRecenterRef.current = false;
    }
  }, [region, heading]);

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
          .client-pin { background: transparent !important; border: none !important; }
          .ulm { position:relative; width:50px; height:50px; display:flex; align-items:center; justify-content:center; }
          .ulm-pulse { position:absolute; width:46px; height:46px; border-radius:50%; background:rgba(25,118,210,0.22); animation:ulm-pulse 2s ease-out infinite; pointer-events:none; }
          .ulm-dot { position:relative; width:22px; height:22px; border-radius:50%; background:#1976d2; border:2.5px solid white; box-shadow:0 2px 8px rgba(25,118,210,0.55); display:flex; align-items:center; justify-content:center; z-index:1; }
          @keyframes ulm-pulse { 0%{transform:scale(0.4);opacity:1} 100%{transform:scale(1.4);opacity:0} }
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

          function getUserPinHtml(h) {
            var hasH = h != null && !isNaN(h);
            var arrow = hasH
              ? '<svg viewBox="0 0 20 20" width="12" height="12" style="transform:rotate(' + h.toFixed(1) + 'deg);display:block;flex-shrink:0;"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="white"/></svg>'
              : '';
            return '<div class="ulm"><div class="ulm-pulse"></div><div class="ulm-dot">' + arrow + '</div></div>';
          }

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

          // Android envia para window, iOS para document — ouvir ambos garante compatibilidade
          function handleMessage(event) {
            var msg = JSON.parse(event.data);
            if (msg.type === 'region') {
              var lat = msg.data.latitude;
              var lng = msg.data.longitude;
              var h = msg.data.heading;
              var icon = L.divIcon({
                className: 'client-pin',
                html: getUserPinHtml(h),
                iconSize: [50, 50],
                iconAnchor: [25, 25],
              });
              if (userMarker) {
                userMarker.setLatLng([lat, lng]);
                userMarker.setIcon(icon);
              } else {
                userMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
              }
              if (msg.data.recenter) {
                map.setView([lat, lng], 15);
              }
            } else if (msg.type === 'markers') {
              updateMarkers(msg.data);
            }
          }
          window.addEventListener('message', handleMessage);
          document.addEventListener('message', handleMessage);
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
}

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
