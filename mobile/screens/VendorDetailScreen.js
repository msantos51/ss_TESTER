// Tela com detalhes do vendedor
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import StarRatingInput from '../StarRatingInput';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import { isFavorite, addFavorite, removeFavorite } from '../favoritesService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import t from '../i18n';

export default function VendorDetailScreen({ route }) {
  const { vendor } = route.params;
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [favorite, setFavorite] = useState(false);

  const loadReviews = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/vendors/${vendor.id}/reviews`);
      setReviews(resp.data);
    } catch (e) {
      console.log('Erro ao buscar reviews:', e);
    }
  };

  useEffect(() => {
    loadReviews();
    isFavorite(vendor.id).then(setFavorite);
  }, []);

  const submitReview = async () => {
    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/reviews`, {
        rating: rating,
        comment,
      });
      setRating(0);
      setComment('');
      loadReviews();
    } catch (e) {
      console.log('Erro ao enviar review:', e);
    }
  };

  const photoUri = vendor.profile_photo
    ? `${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`
    : null;

  return (
    <View style={styles.container}>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{vendor.name || 'Vendedor'}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={favorite ? t('removeFavorite') : t('addFavorite')}
          onPress={async () => {
            if (favorite) {
              await removeFavorite(vendor.id);
            } else {
              await addFavorite(vendor.id);
            }
            setFavorite(!favorite);
          }}
        >
          <MaterialCommunityIcons
            name={favorite ? 'star' : 'star-outline'}
            size={28}
            color={theme.colors.accent}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.product}>Produto: {vendor.product}</Text>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        style={styles.reviewList}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
            {item.comment ? <Text>{item.comment}</Text> : null}
          </View>
        )}
      />

      <StarRatingInput rating={rating} onChange={setRating} />
      <TextInput
        mode="outlined"
        style={styles.input}
        label="Comentário"
        value={comment}
        onChangeText={setComment}
      />
      <Button mode="contained" onPress={submitReview}>
        Enviar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  photo: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  product: { textAlign: 'center', marginBottom: 16 },
  reviewList: { marginVertical: 8 },
  reviewItem: { paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  reviewRating: { fontWeight: 'bold' },
  input: { marginBottom: 8 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
