import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet,ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { API_CONFIG } from '../constants/config';
import Navbar from './Navbar';
import { Ionicons } from '@expo/vector-icons';


const CrearDiasScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { idRutina } = route.params;
  const { diasValidacion } = route.params;
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  console.log(diasValidacion)

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${idRutina}`);
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

  return (
    <SafeAreaView style={styles.safeArea}>
       <View style={styles.navbar}>
          <TouchableOpacity  style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Mis Dias</Text>
          </View>
        </View>

        
      <View style={styles.container}>
        <View style={styles.daysContainer}>
          {loading ? (
           <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            rutinas.map((rutina, index) => (
              <TouchableOpacity 
              key={index} 
              style={[
                styles.dayItem, 
                diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados && styles.disabledDay
              ]} 
              onPress={() => {
                if (!diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados) {
                  navigation.navigate('Crearejercicioscreen', { 
                    idDia: rutina.id, 
                    idRutina, 
                    diasValidacion 
                  });
                }
              }}
              disabled={diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados} // Deshabilita si ejerciciosCreados es true
            >
              <Text style={[
                styles.dayText, 
                diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados && styles.disabledText
              ]}>
                {rutina.nombre}
              </Text>
              <Text style={[
                styles.arrow, 
                diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados && styles.disabledText
              ]}>
                <Ionicons 
                  name="chevron-forward" 
                  size={30} 
                  color={diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados ? 'gray' : 'black'} 
                  style={styles.arrow}
                />
              </Text>
            </TouchableOpacity>
            
            ))
          )}
        </View>
        <View style={styles.footer}>
          {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Crearrutinascreen')}>
            <Text style={styles.buttonText}>Atras</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.button}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Guardar Rutina</Text>
          </TouchableOpacity>
        </View>
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: "#fff",
  },
  daysContainer: {
    flex: 1,
  },
  dayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dayText: {
    fontSize: 18,
  },
  arrow: {
    fontSize: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingBottom: 20,
  },
  button: {
    position: 'absolute',     // Posicionamiento absoluto
    right: 5,                // A 20 unidades del borde derecho
    bottom: 30,               // Opcional: por si quieres que esté abajo también
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  
  botonDeshabilitado: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledDay: {
    backgroundColor: '#ddd', // Color gris para indicar que está deshabilitado
  },
  disabledText: {
    color: 'gray', // Texto en gris para mostrar que no se puede tocar
  },  
});

export default CrearDiasScreen;
