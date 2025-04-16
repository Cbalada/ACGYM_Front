import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

const EjercicioEstadisticaScreen = () => {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const fetchRutinasCompleto = async () => {
    try {
      setLoading(true);
      const user = await storage.get(STORAGE_KEYS.USER);
      
      const rutinasResponse = await fetch(`${API_CONFIG.BASE_URL}/rutinas/user/${user}`);
      if (!rutinasResponse.ok) throw new Error('Error al obtener rutinas');
      
      const rutinasData = await rutinasResponse.json();
      
      const rutinasConDias = await Promise.all(rutinasData.map(async (rutina) => {
        const diasResponse = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${rutina.id}`);
        if (!diasResponse.ok) throw new Error('Error al obtener días de la rutina');
        
        const diasData = await diasResponse.json();
        
        const diasConEjercicios = await Promise.all(diasData.map(async (dia) => {
          const ejerciciosResponse = await fetch(`${API_CONFIG.BASE_URL}/ejercicios/dia/${dia.id}`);
          if (!ejerciciosResponse.ok) throw new Error('Error al obtener ejercicios del día');
          
          const ejerciciosData = await ejerciciosResponse.json();
          const bucketName = 'gim-image';
          const ejerciciosConImagenes = ejerciciosData.map(ejercicio => ({
            ...ejercicio,
            // imageUrl: `${API_CONFIG.BASE_URL}/upload/${ejercicio.id}.jpg`

            imageUrl : `https://storage.googleapis.com/${bucketName}/uploads/${ejercicio.id}.jpg`
          }));

          return { ...dia, ejercicios: ejerciciosConImagenes };
        }));

        return { ...rutina, dias: diasConEjercicios };
      }));

      setRutinas(rutinasConDias);
    } catch (error) {
      console.error('Error en fetchRutinasCompleto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutinasCompleto();
  }, []);

  const renderEjercicio = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.textContainer}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MuestraEjercicioEstadistica', { 
            id: item.id, 
            nombre: item.nombre, 
            imageUrl: item.imageUrl 
          })}
        >
          <Text style={styles.rutinaText}>{item.nombre}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredEjercicios = rutinas.flatMap(rutina => rutina.dias.flatMap(dia => dia.ejercicios)).filter(ejercicio => 
    ejercicio.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Ejercicios disponibles</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)} style={styles.searchButton}>
          <Ionicons name={searchVisible ? 'close' : 'search'} size={24} color="white" />
        </TouchableOpacity>
      </View>
      {searchVisible && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicio..."
          value={searchText}
          onChangeText={setSearchText}
        />
      )}
      <View style={styles.container}>
      <FlatList
        data={filteredEjercicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEjercicio}
        contentContainerStyle={{ paddingBottom: 35 }}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10, // más margen lateral = menos ancho visible
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  rutinaText: {
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default EjercicioEstadisticaScreen;
