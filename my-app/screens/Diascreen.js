import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from './Navbar'; 
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

const DiaScreen = () => {
  const navigation = useNavigation(); // Inicializar navegación
  const route = useRoute();
  const { rutinaId } = route.params;
  const [Dias, setDias] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${rutinaId}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }

        const data = await response.json();
        setDias(data); 
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, []);

  const renderDia = ({ item }) => (
    <View style={styles.rutinaContainer}>

      <TouchableOpacity onPress={() => navigation.navigate('Ejercicio', { diaId: item.id })}>
        <Text style={styles.rutinaText}>{item.nombre}</Text>
      </TouchableOpacity>

      <View style={styles.icons}>
        <TouchableOpacity>

          <Ionicons 
            name="chevron-forward" 
            size={30} 
            color='black'
            style={styles.arrow}
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
        <Text style={styles.title}>Días</Text>
      </View>

      <View style={styles.container}>
     
        <FlatList
          data={Dias}
          keyExtractor={(item) => item.id}
          renderItem={renderDia}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  rutinaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  rutinaText: {
    fontSize: 18,
    fontWeight: '500',
  },
  icons: {
    flexDirection: 'row',
    gap: 15, // Espaciado entre íconos
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
    flex: 1, // Ocupa todo el espacio disponible en el centro
    textAlign: 'center', // Alinea el texto en el centro
  },
  

  
});

export default DiaScreen;
