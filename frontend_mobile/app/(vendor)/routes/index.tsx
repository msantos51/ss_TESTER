// (em português) Lista de trajetos do vendedor (estrutura base; integrar com backend).
import { View, Text } from 'react-native';

export default function RoutesScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Os meus trajetos</Text>
    </View>
  );
}
