import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Home({ navigation }: any) {
  return (
    <View>
      <Text>Home</Text>
      <Button title="Mapa" onPress={() => navigation.navigate('Map')} />
    </View>
  );
}
