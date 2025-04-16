import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';


const RutinaScreen = () => {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);


  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);
        const user = await storage.get(STORAGE_KEYS.USER);
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/user/${user}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }
        const data = await response.json();
        setRutinas(data);
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, []);

  const togglePapelera = async (itemId) => {
    try {
      const user = await storage.get(STORAGE_KEYS.USER);
      const rutinaSeleccionada = rutinas.find((r) => r.id === itemId);
  
      if (!rutinaSeleccionada) {
        console.error('No se encontró la rutina con el ID:', itemId);
        return;
      }
  
      console.log('Botón presionado para:', rutinaSeleccionada.nombre);
  
      const nuevaRutinaData = {
        nombre: rutinaSeleccionada.nombre,
        idUser: user,
        activa: !rutinaSeleccionada.activa,
        favorita: rutinaSeleccionada.favorita,
      };
  
      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaRutinaData),
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar la Papelera');
      }
  
      const data = await response.json();
      console.log('Papelera actualizada exitosamente:', data);
  
      // Actualizar el estado local de rutinas
      setRutinas((prevRutinas) =>
        prevRutinas.map((r) =>
          r.id === itemId ? { ...r, activa: !r.activa } : r
        )
      );
    } catch (error) {
      console.error('Error en togglePapelera:', error);
    }
  };
  

  const toggleFavorita = async (item) => {
    
    console.log('Botón presionado para:', item.nombre);

    try {
      const user = await storage.get(STORAGE_KEYS.USER);
      const nuevaRutinaData = {
        nombre: item.nombre,
        idUser: user,
        activa: true,
        favorita: !item.favorita, // Invierte el estado actual
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

      const data = await response.json();
      console.log('Rutina actualizada exitosamente:', data);

      // Actualiza el estado de la UI sin necesidad de hacer otra petición
      setRutinas((prevRutinas) =>
        prevRutinas.map((r) => (r.id === item.id ? { ...r, favorita: !r.favorita } : r))
      );
    } catch (error) {
      console.error('Error en toggleFavorita:', error);
    }
  };

  const renderRutina = ({ item }) => (
    <View style={styles.rutinaContainer}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Dia', { rutinaId: item.id })}
        style={{ flex: 1 }} // <- Ocupar todo el espacio para empujar los íconos
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
  
        <TouchableOpacity style={styles.button} onPress={() => togglePapelera(item.id)}>
          <Image source={require('../assets/delete.png')} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
  

  const filteredRutinas = rutinas.filter(rutina => 
    rutina.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Rutinas Disponibles</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)} style={styles.searchButton}>
          <Ionicons name={searchVisible ? 'close' : 'search'} size={24} color="white" />
        </TouchableOpacity>
      </View>
      {searchVisible && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rutina..."
          value={searchText}
          onChangeText={setSearchText}
        />
      )}
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={filteredRutinas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRutina}
            contentContainerStyle={{ paddingBottom: 35 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0', // Opcional, por visibilidad
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  rutinaText: {
    fontSize: 18,
    fontWeight: '500',
  },
  icons: {
    flexDirection: 'row',
    gap: 15,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C', // Rojo de advertencia
    padding: 10,
    borderRadius: 8, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, // Sombra en Android
  },
  icon: {
    width: 24,
    height: 24,
  },
  
  deleteIcon: {
    width: 24,
    height: 24,
  },
});

export default RutinaScreen;
