// Componente de mapa baseado em Leaflet exibido em WebView
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// LeafletMap
const LeafletMap = forwardRef((props, ref) => {
  const {
    markers = [],
    initialPosition = { latitude: 38.736946, longitude: -9.142685 },
    initialZoom = 13,
    polyline = [],
  } = props;
  // webviewRef
  const webviewRef = useRef(null);

  // html
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .custom-icon .gm-pin {
            position: relative;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          .custom-icon .gm-pin img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            transform: rotate(45deg);
          }
          /* Novo estilo para pins simples (ex: cliente) */
          .gm-pin {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #0077FF;
            border: 2px solid white;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([
            ${initialPosition.latitude},
            ${initialPosition.longitude}
          ], ${initialZoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            subdomains: 'abc',
            maxZoom: 19
          }).addTo(map);
          var markers = ${JSON.stringify(markers)};
          var line = ${JSON.stringify(polyline)};
          markers.forEach(function(m) {
            var opts = {};
            if (m.iconHtml) {
opts.icon = L.divIcon({
  className: m.iconHtml.includes('img') ? 'custom-icon' : '',
  html: m.iconHtml
});

            }
            if (m.selected) {
              opts.zIndexOffset = 1000;
            }
            L.marker([m.latitude, m.longitude], opts).addTo(map).bindPopup(m.title || '');
          });
          if (line.length > 0) {
            L.polyline(line, { color: 'red' }).addTo(map);
            map.fitBounds(line);
          }
          window.setView = function(lat, lng, zoom) {
            map.setView([lat, lng], zoom || 15);
          };
        </script>
      </body>
    </html>
  `;

  useImperativeHandle(ref, () => ({
    setView: (lat, lng, zoom) => {
      if (webviewRef.current) {
        // js
        const js = `window.setView(${lat}, ${lng}, ${zoom}); true;`;
        webviewRef.current.injectJavaScript(js);
      }
    },
  }));

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      source={{ html }}
      style={StyleSheet.absoluteFill}
    />
  );
});

export default LeafletMap;
