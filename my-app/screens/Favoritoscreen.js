import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

const FavoritosScreen = () => {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const fetchRutinas = async () => {
    try {
      setLoading(true);
      const user = await storage.get(STORAGE_KEYS.USER);
      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/user/${user}`);

      if (!response.ok) {
        throw new Error('Error al obtener rutinas');
      }

      const data = await response.json();
      const rutinasFavoritas = data.filter((rutina) => rutina.favorita === true);
      setRutinas(rutinasFavoritas);
    } catch (error) {
      console.error('Error en fetchRutinas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutinas();
  }, []);

  const toggleFavorita = async (item) => {
    try {
      const user = await storage.get(STORAGE_KEYS.USER);
      const nuevaRutinaData = {
        nombre: item.nombre,
        idUser: user,
        activa: true,
        favorita: !item.favorita,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaRutinaData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la rutina');
      }

      await fetchRutinas(); 
    } catch (error) {
      console.error('Error en toggleFavorita:', error);
    }
  };

  const filteredRutinas = rutinas.filter((rutina) =>
    rutina.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderFavoritos = ({ item }) => (
    <View style={styles.rutinaContainer}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Dia', { rutinaId: item.id })}
        style={{ flex: 1 }} // <- Empuja el botón al final
      >
        <Text style={styles.rutinaText}>{item.nombre}</Text>
      </TouchableOpacity>
  
      <View style={styles.icons}>
        <TouchableOpacity style={styles.button} onPress={() => toggleFavorita(item)}>
          <Image
            source={
              item.favorita
                ? require('../assets/ic--twotone-favorite.png')
                : require('../assets/ic--sharp-favorite-border.png')
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Favoritos</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)} style={styles.searchButton}>
          <Ionicons name={searchVisible ? 'close' : 'search'} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rutina favorita..."
          value={searchText}
          onChangeText={setSearchText}
        />
      )}

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : filteredRutinas.length === 0 ? (
          <Text style={styles.noFavoritos}>No tienes rutinas favoritas.</Text>
        ) : (
          <FlatList
            data={filteredRutinas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFavoritos}
            contentContainerStyle={{ paddingBottom: 35 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6200ea',
    padding: 15,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  searchButton: {
    padding: 5,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 8,
    margin: 10,
    borderRadius: 5,
    elevation: 5,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  rutinaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 5, // más margen lateral = menos ancho visible
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rutinaText: {
    fontSize: 18,
    fontWeight: '500',
  },
  icons: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0', // Opcional, por visibilidad
  },
  icon: {
    width: 24,
    height: 24,
  },
  noFavoritos: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default FavoritosScreen;
