import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import Sidebar from '../screens/SidebarScreenWeb';
import { AntDesign } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const GestionDeDiaScreenWeb = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { idRutina } = route.params;
  const { diasValidacion } = route.params;
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(false);

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
      {/* <Sidebar /> */}
      <View style={styles.container}>
        <View style={styles.diasContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Crear Rutina - Días disponibles</Text>
          </View>

            <View style={styles.listContainer}>
              {loading ? (
                <Text>Cargando...</Text>
              ) : (
                rutinas.map((rutina, index) => (
                  <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.item, 
                    diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados && styles.disabledDay
                  ]} 
                  onPress={() => {
                    if (!diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados) {
                      navigation.navigate('GestionDeEjercicioWeb', { 
                        idDia: rutina.id, 
                        idRutina, 
                        diasValidacion 
                      });
                    }
                  }}
                  disabled={diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados} // Deshabilita si ejerciciosCreados es true
                >
                  <Text style={[
                    styles.itemText, 
                    diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados && styles.disabledText
                  ]}>
                    {rutina.nombre}
                  </Text>


                  <Text style={[
                    styles.arrow, 
                    diasValidacion.find(dia => dia.id === rutina.id)?.ejerciciosCreados && styles.disabledText
                  ]}>
                    {">"}
                  </Text>

                </TouchableOpacity>
                
                ))
              )}
            </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GestionDeRutinaWeb')}>
            <Text style={styles.buttonText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HomeWeb')}>
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
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Distribuye espacio entre elementos
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    top: 0,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4B0082',
  },
  diasContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 50, // Espacio para que no quede pegado al borde
  },
  listContainer: {
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Espaciado uniforme entre botones
    width: '100%',
    position: 'absolute',
    bottom: 20, // Pegado al borde inferior
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledDay: {
    backgroundColor: '#ddd', // Color gris para indicar que está deshabilitado
  },
  disabledText: {
    color: 'gray', // Texto en gris para mostrar que no se puede tocar
  },  
});

export default GestionDeDiaScreenWeb;
