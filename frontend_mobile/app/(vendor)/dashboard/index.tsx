// (em português) Dashboard do vendedor com botão Ativo/Inativo e controlo de partilha de localização.
import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { setActive } from '~/services/vendor';
import { startLocationSharing, stopLocationSharing } from '~/tasks/locationTask';

export default function VendorDashboard() {
  const [active, setActiveState] = useState(false);

  useEffect(() => {
    // (em português) No futuro, podemos carregar estado do backend.
  }, []);

  async function toggleActive() {
    try {
      const next = !active;
      setActiveState(next);
      await setActive(next);
      if (next) await startLocationSharing();
      else await stopLocationSharing();
      Alert.alert('Estado', next ? 'Ativo' : 'Inativo');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o estado.');
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Painel do Vendedor</Text>
      <Pressable onPress={toggleActive} style={{ backgroundColor: active ? '#90ee90' : '#f08080', padding: 16, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>{active ? 'Parar partilha (Inativo)' : 'Iniciar partilha (Ativo)'}</Text>
      </Pressable>
    </View>
  );
}
