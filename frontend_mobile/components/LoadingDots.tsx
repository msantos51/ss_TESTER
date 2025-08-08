// (em português) Indicador simples de carregamento com três pontos.
import { View, Text } from 'react-native';

export default function LoadingDots() {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      <Text>•</Text><Text>•</Text><Text>•</Text>
    </View>
  );
}
