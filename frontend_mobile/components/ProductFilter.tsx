// (em português) Componente de filtro por produto com "chips" simples.
import { View, Text, Pressable } from 'react-native';

type Props = {
  products: string[];
  selected: string[];
  onToggle: (product: string) => void;
};

export default function ProductFilter({ products, selected, onToggle }: Props) {
  return (
    <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {products.map(p => {
        const active = selected.includes(p);
        return (
          <Pressable
            key={p}
            onPress={() => onToggle(p)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? '#ffd700' : '#eee' }}
          >
            <Text style={{ fontWeight: '500' }}>{p}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
