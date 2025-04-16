import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet , TextInput} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Sidebar from '../screens/SidebarScreenWeb';
import { useRoute } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditarRutinaScreenWeb = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const route = useRoute();
  const { DatoRutina } = route.params;
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState([]);
  const [ejercicios, setEjercicios] = useState({});
  const [notas, setNotas] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [nombreRutina, setNombreRutina] = useState('');

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${DatoRutina}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }
        const data = await response.json();
        setRutinas(data);
        setNombreRutina(data.nombre);
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, []);

  useEffect(() => {
    const fetchDias = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${DatoRutina}`);
        if (!response.ok) {
          throw new Error('Error al obtener dias');
        }
        const data = await response.json();
        setDias(data);
      } catch (error) {
        console.error('Error en fetchDias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDias();
  }, []);

  const fetchEjercicios = async (idDia) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/ejercicios/dia/${idDia}`);
      if (!response.ok) {
        throw new Error('Error al obtener ejercicios');
      }
      const data2 = await response.json();
      const data = data2.map((ejercicio) => ({
        ...ejercicio,
        imageUrl: `https://storage.googleapis.com/gim-image/uploads/${ejercicio.id}.jpg`,
      
      }));
      setEjercicios(prev => ({ ...prev, [idDia]: data }));
      data.forEach(ejercicio => fetchNotas(ejercicio.id));
      console.log(data)
    } catch (error) {
      console.error('Error en fetchEjercicios:', error);
    }
  };

  const fetchNotas = async (idEjercicio) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/notas/ejercicio/${idEjercicio}`);
      if (!response.ok) {
        throw new Error('Error al obtener notas');
      }
      const data = await response.json();
      setNotas(prev => ({ ...prev, [idEjercicio]: data }));
    } catch (error) {
      console.error('Error en fetchNotas:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${DatoRutina}`, {
        method: 'PATCH',  // Cambio de PUT a PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreRutina }), // Solo enviamos el nombre
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar la rutina');
      }
  
      setRutinas(prev => ({ ...prev, nombre: nombreRutina })); // Actualiza el estado local
      setIsEditing(false);
    } catch (error) {
      console.error('Error en handleSave:', error);
    }
  };
  


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Sidebar /> */}
      <View style={styles.container}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={nombreRutina}
            onChangeText={setNombreRutina}
          />
        ) : (
          <Text style={styles.title}>{rutinas.nombre}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={isEditing ? handleSave : handleEdit}>
          <Text style={styles.buttonText}>{isEditing ? 'Guardar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  safeArea: {
    flex: 1,
    flexDirection: 'row',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#3D1C56',
  },
  input: {
    fontSize: 40,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#3D1C56',
    borderBottomWidth: 1,
    borderBottomColor: '#3D1C56',
  },
  button: {
    backgroundColor: '#3D1C56',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});


export default EditarRutinaScreenWeb;
