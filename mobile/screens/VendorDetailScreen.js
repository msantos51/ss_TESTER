// Tela com detalhes do vendedor
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import StarRatingInput from '../StarRatingInput';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import { isFavorite, addFavorite, removeFavorite } from '../favoritesService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import t from '../i18n';
import { getSeenStories, markStoriesSeen } from '../storyViewService';

export default function VendorDetailScreen({ route }) {
  const { vendor } = route.params;
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [stories, setStories] = useState([]);
  const [storyIndex, setStoryIndex] = useState(null);
  const [hasUnseen, setHasUnseen] = useState(false);

  // loadReviews
  const loadReviews = async () => {
    try {
      // resp
      const resp = await axios.get(`${BASE_URL}/vendors/${vendor.id}/reviews`);
      setReviews(resp.data);
    } catch (e) {
      console.log('Erro ao buscar reviews:', e);
    }
  };

  // loadStories
  const loadStories = async () => {
    try {
      // resp
      const resp = await axios.get(`${BASE_URL}/vendors/${vendor.id}/stories`);
      setStories(resp.data);
      // seen
      const seen = await getSeenStories();
      // unseen
      const unseen = resp.data.some((s) => !seen.includes(s.id));
      setHasUnseen(unseen);
    } catch (e) {
      console.log('Erro ao buscar stories:', e);
    }
  };

  useEffect(() => {
    loadReviews();
    isFavorite(vendor.id).then(setFavorite);
    loadStories();
  }, []);

// submitReview
const submitReview = async () => {
  try {
    // 1️⃣ Vai buscar o token ao AsyncStorage
    const token = await AsyncStorage.getItem('clientToken');

    // 2️⃣ Mostra no log o token e os dados enviados
    console.log("🚀 Token usado na review:", token);
    console.log("🚀 Dados enviados na review:", { rating, comment });

    if (!token) {
      Alert.alert(
        'Inicie sessão',
        'É necessário iniciar sessão para avaliar um vendedor.'
      );
      return;
    }

    // 3️⃣ Faz o pedido POST com o token no header
    await axios.post(
      `${BASE_URL}/vendors/${vendor.id}/reviews`,
      {
        rating: rating,
        comment: comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 4️⃣ Limpa os campos e atualiza as reviews
    setRating(0);
    setComment('');
    loadReviews();

    console.log("✅ Review enviada com sucesso!");

  } catch (e) {
    console.error('❌ Erro ao enviar review:', e.response?.data || e.message);
  }
};


  // baseUrl
  const baseUrl = BASE_URL.replace(/\/$/, '');
  // photoUri
  const photoUri = vendor.profile_photo
    ? `${baseUrl}/${vendor.profile_photo}`
    : null;

  // openStories
  const openStories = (index = 0) => {
    if (!stories.length) return;
    setStoryIndex(index);
  };

  // closeStories
  const closeStories = async () => {
    setStoryIndex(null);
    await markStoriesSeen(stories.map((s) => s.id));
    setHasUnseen(false);
  };

  return (
    <View style={styles.container}>
      {photoUri && (
        <TouchableOpacity onPress={() => openStories(0)}>
          <Image
            source={{ uri: photoUri }}
            style={[styles.photo, hasUnseen && styles.storyRing]}
          />
        </TouchableOpacity>
      )}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{vendor.name || 'Vendedor'}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={favorite ? t('removeFavorite') : t('addFavorite')}
          onPress={async () => {
            // token
            const token = await AsyncStorage.getItem('clientToken');
            if (!token) {
              Alert.alert(
                'Inicie sessão',
                'É necessário iniciar sessão para adicionar favoritos.'
              );
              return;
            }
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

      {stories.length > 0 && (
        <>
          <FlatList
            data={stories}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            style={styles.storyList}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => openStories(index)}>
                <Image
                  source={{ uri: `${baseUrl}/${item.media_url}` }}
                  style={styles.storyThumb}
                />
              </TouchableOpacity>
            )}
          />
          <Modal
            visible={storyIndex !== null}
            transparent
            onRequestClose={closeStories}
          >
            <TouchableOpacity
              style={styles.modalBg}
              onPress={() => {
                if (storyIndex < stories.length - 1) {
                  setStoryIndex(storyIndex + 1);
                } else {
                  closeStories();
                }
              }}
            >
              {storyIndex !== null && (
                <Image
                  source={{ uri: `${baseUrl}/${stories[storyIndex].media_url}` }}
                  style={styles.fullStory}
                />
              )}
            </TouchableOpacity>
          </Modal>
        </>
      )}

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
        <Text>Enviar</Text>
      </Button>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  photo: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 16 },
  storyRing: {
    borderWidth: 3,
    borderColor: '#9b5de5',
  },
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
  storyList: { marginBottom: 12 },
  storyThumb: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullStory: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
});
