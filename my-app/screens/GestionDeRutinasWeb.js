import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import Sidebar from '../screens/SidebarScreenWeb';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Image } from 'react-native';
import { enviarActividad } from '../screens/Historial2Screen'
import ModalRutina from './ModalRutina';

const GestionDeRutinaScreenWeb = () => {
  const navigation = useNavigation();
  const [nombreRutina, setNombreRutina] = useState('');
  const [dias, setDias] = useState(['']);
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(true);
  const [diasValidacion  , setDiasValidacion] =useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);

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
    const rutinaData = {
      nombre: nombreRutina,
      idUser: user,  // Usamos el valor del user
      activa: true
    };
  
    console.log(rutinaData);
  
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rutinaData),
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar la rutina');
      }
  
      // Esperamos que la respuesta sea convertida a JSON
      const data = await response.json();
      console.log('Rutina creada exitosamente:', data);
  
      // Enviar cada día individualmente
      for (let dia of dias) {
        if (dia.trim() !== '') {
          const DiaData = {
            nombre: dia,
            idRutina: data.id,  // Usamos el id de la rutina creada
          };
  
          const response_Dia = await fetch(`${API_CONFIG.BASE_URL}/dias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(DiaData),
          });
  
          if (!response_Dia.ok) {
            throw new Error('Error al enviar el día');
          }
          console.log('Día enviado exitosamente:', dia);
        }
      }
    
        const response3 = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${data.id}`);
        if (!response3.ok) {
          throw new Error('Error al obtener rutinas');
        }
    
        let data3 = await response3.json();
    
        // Agregamos la propiedad "ejerciciosCreados: false" a cada día
        data3 = data3.map(dia => ({
          ...dia,
          ejerciciosCreados: false
        }));
        console.log(data3)
        setDiasValidacion(data3);
        enviarActividad("Creacion de Rutina");


      navigation.navigate('GestionDeDiaWeb', { idRutina: data.id,diasValidacion:data3});
    } catch (error) {
      console.error('Error al enviar la rutina:', error);
    }
   
    
  };
  
  


  // Agregar un nuevo día
  const agregarDia = () => {
    setDias([...dias, '']);
  };

  // Eliminar un día específico
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

  useEffect(() => {
    const algunDiaLleno = dias.some(dia => dia.trim() !== '');
    setBotonDeshabilitado(!(nombreRutina.trim() !== '' && algunDiaLleno));
  }, [nombreRutina, dias]);


  const handleAceptar = ({ nombreRutina, link }) => {
    // Aquí puedes manejar los datos del modal
    console.log('Rutina:', nombreRutina);
    console.log('Link:', link);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Sidebar /> */}
      <View style={styles.container}>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Image
            source={require('../assets/hoja-de-calculo.png')}
            style={styles.icon}
          />
          <Text style={styles.uploadButtonText}>Cargar hoja de cálculo</Text>
        </View>
      </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Crear Rutina</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el nombre de tu rutina:"
            value={nombreRutina}
            onChangeText={setNombreRutina}
          />
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
                {index === 0 && (
                  <TouchableOpacity style={styles.botonAgregar} onPress={agregarDia}>
                    <AntDesign name="pluscircle" size={24} color="blue" />
                  </TouchableOpacity>
                )}
                {dias.length > 1 && (
                  <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarDia(index)}>
                    <Entypo name="minus" size={24} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeWeb')}>
              <Text style={styles.buttonText}>Atrás</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} disabled={!nombreRutina} onPress={enviarRutina}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ModalRutina
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAccept={handleAceptar}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    width: '50%', 
    maxWidth: 600, 
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4B0082',
  },
  input: {
    width: '100%', 
    height: 45,
    borderBottomWidth: 1,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  diasContainer: {
    width: '100%', 
  },
  diaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputDia: {
    flex: 1,
    height: 45,
    borderBottomWidth: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  botonAgregar: {
    marginLeft: 10,
  },
  botonEliminar: {
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: 'blue', // verde elegante
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
    padding: 12,
  },
  nextButton: {
    backgroundColor: 'blue',
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
    padding: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  uploadButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  
  buttonContent: {
    flexDirection: 'row',  // Alinea los elementos en fila
    alignItems: 'center',   // Centra verticalmente la imagen y el texto
  },
  
  icon: {
    width: 20,
    height: 20,
    marginRight: 8, // Espacio entre el icono y el texto
  },
});


export default GestionDeRutinaScreenWeb;
