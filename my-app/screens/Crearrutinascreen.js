import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { AntDesign, Entypo } from '@expo/vector-icons'; // Importamos iconos
import { storage } from '../utils/storage';  // Importamos storage
import CustomModal from './modalScreen';

const RoutineScreen = () => {
  const navigation = useNavigation();
  const [nombreRutina, setNombreRutina] = useState('');
  const [dias, setDias] = useState(['']);
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(true);
  const [diasValidacion, setDiasValidacion] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [idrutina, setIdrutina] = useState('');
  const [diavalidacion, setDiavalidacion] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await storage.get(STORAGE_KEYS.USER);
      setUser(storedUser);  // Guardamos el user en el estado
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const algunDiaLleno = dias.some(dia => dia.trim() !== '');
    setBotonDeshabilitado(!(nombreRutina.trim() !== '' && algunDiaLleno));
  }, [nombreRutina, dias]);

  const enviarRutina = async () => {
    try {
      const rutinaData = {
        nombre: nombreRutina,
        idUser: user,
        activa: true
      };
  
      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rutinaData),
      });
  
      if (!response.ok) throw new Error('Error al enviar la rutina');
      
      const data = await response.json();
      console.log('Rutina creada:', data);
      
      const rutinaId = data.id;
  
      for (let dia of dias) {
        if (dia.trim() !== '') {
          const DiaData = { nombre: dia, idRutina: rutinaId };
          const response_Dia = await fetch(`${API_CONFIG.BASE_URL}/dias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DiaData),
          });
  
          if (!response_Dia.ok) throw new Error('Error al enviar el día');
        }
      }
  
      // Obtener los días de la rutina
      const response3 = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${rutinaId}`);
      if (!response3.ok) throw new Error('Error al obtener los días');
  
      let data3 = await response3.json();
      data3 = data3.map(dia => ({ ...dia, ejerciciosCreados: false }));
  
      console.log("ID Rutina:", rutinaId);
      console.log("Días obtenidos:", data3);
  
      return { rutinaId, data3 };
  
    } catch (error) {
      console.error('Error al enviar la rutina:', error);
      return { rutinaId: null, data3: [] }; // Devuelve valores por defecto en caso de error
    }
  };
  
  const agregarDia = () => {
    setDias([...dias, '']);
  };

  const eliminarDia = (index) => {
    if (dias.length > 1) {
      const nuevosDias = dias.filter((_, i) => i !== index);
      setDias(nuevosDias);
    }
  };

  const manejarCambioDia = (texto, index) => {
    const nuevosDias = [...dias];
    nuevosDias[index] = texto;
    setDias(nuevosDias);
  };

  const handleModalAccept = async () => {
    const { rutinaId, data3 } = await enviarRutina();
      if (rutinaId && data3.length > 0) {
      navigation.navigate('CrearDiascreen', { idRutina: rutinaId, diasValidacion: data3 });
    } else {
      console.error("No se pudieron obtener los datos de la rutina.");
    }
  };
  
  
  

  return (
      <View style={styles.container}>
        {/* Nombre de la Rutina */}
        <Text style={styles.title}>Ingresa el nombre de tu Rutina:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la rutina"
          value={nombreRutina}
          onChangeText={setNombreRutina}
        />

        {/* Días de la Rutina */}
        <Text style={styles.title}>Ingresa el nombre de tu Día:</Text>
        
        <ScrollView style={styles.diasContainer}>
          {dias.map((dia, index) => (
            <View key={index} style={styles.diaItem}>
              <TextInput
                style={styles.inputDia}
                placeholder={`Día ${index + 1}`}
                value={dia}
                onChangeText={(texto) => manejarCambioDia(texto, index)}
              />
              {/* Botón "Agregar Día" solo en el primer input */}
              {index === 0 && (
                <TouchableOpacity style={styles.botonAgregar} onPress={agregarDia}>
                  <AntDesign name="pluscircle" size={24} color="blue" />
                </TouchableOpacity>
              )}
              {/* Botón "Eliminar Día" (excepto si hay solo un día) */}
              {dias.length > 1 && (
                <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarDia(index)}>
                  <Entypo name="minus" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Atrás</Text>
          </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, botonDeshabilitado && styles.botonDeshabilitado]}
              onPress={handleModalAccept}
              disabled={botonDeshabilitado}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>

        </View>

      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: 16,
    paddingVertical: 5,
    marginBottom: 20,
  },
  diasContainer: {
    width: '100%',
    maxHeight: 200,
  },
  diaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputDia: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: 16,
    paddingVertical: 5,
  },
  botonAgregar: {
    marginLeft: 10,
  },
  botonEliminar: {
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 20,
  },
  button: {
    backgroundColor: '#6200ea', // verde elegante
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonDeshabilitado: {
    backgroundColor: 'gray',
  },
});

export default RoutineScreen;
