// Componente reutilizavel para escolher classificacao em estrelas
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function StarRatingInput({ rating = 0, onChange }) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={[styles.star, i <= rating ? styles.filled : styles.empty]}>
            {i <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  star: {
    fontSize: 32,
    marginHorizontal: 4,
  },
  filled: {
    color: '#FFD700',
  },
  empty: {
    color: '#ccc',
  },
});
