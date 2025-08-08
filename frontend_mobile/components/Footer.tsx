// (em português) Rodapé simples para reutilizar em várias páginas.
import { View, Text } from 'react-native';

export default function Footer() {
  return (
    <View style={{ padding: 12, alignItems: 'center' }}>
      <Text style={{ color: '#666' }}>Sunny Sales © {new Date().getFullYear()}</Text>
    </View>
  );
}
