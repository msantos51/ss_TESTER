// (em português) Aviso para orientar permissões de localização.
import { View, Text } from 'react-native';

export default function LocateHint() {
  return (
    <View style={{ padding: 12, backgroundColor: '#fff3cd', borderColor: '#ffeeba', borderWidth: 1, borderRadius: 8 }}>
      <Text style={{ color: '#856404' }}>Ativa a localização nas definições do dispositivo para veres vendedores próximos.</Text>
    </View>
  );
}
