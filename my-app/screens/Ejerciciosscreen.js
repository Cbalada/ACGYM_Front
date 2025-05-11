import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { API_CONFIG } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import precargaEjercicio from '../assets/precarga_ejercicio.png';



const EjercicioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { diaId } = route.params;

  const [Ejercicios, setEjercicios] = useState([]);
  const [notas, setNotas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEjercicios = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/ejercicios/dia/${diaId}`);

        if (!response.ok) throw new Error('Error al obtener ejercicios');

        const data = await response.json();

        // Agregar las URLs de imágenes a cada ejercicio
        const ejerciciosConImagenes = await Promise.all(
          data.map(async (ejercicio) => {
            // const imageUrl = `${API_CONFIG.BASE_URL}/upload/${ejercicio.id}.jpg`;
            const bucketName = 'gim-image';
            const imageUrl = `https://storage.googleapis.com/${bucketName}/uploads/${ejercicio.id}.jpg`;
            return { ...ejercicio, imageUrl };
          })
        );

        setEjercicios(ejerciciosConImagenes);

        // Cargar notas
        const notasData = {};
        await Promise.all(
          ejerciciosConImagenes.map(async (ejercicio) => {
            try {
              const notasResponse = await fetch(`${API_CONFIG.BASE_URL}/notas/ejercicio/${ejercicio.id}`);
              if (notasResponse.ok) {
                const notasJson = await notasResponse.json();
                notasData[ejercicio.id] = notasJson.length > 0 ? notasJson[0] : { serie: '-', repeticiones: '-', kilos: '-' };
              }
            } catch (error) {
              console.error(`Error al obtener notas para ejercicio ${ejercicio.id}:`, error);
            }
          })
        );

        setNotas(notasData);
      } catch (error) {
        console.error('Error en fetchEjercicios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEjercicios();
  }, []);

  const CardEjercicio = ({ item, nota, navigation }) => {
    const [imageError, setImageError] = useState(false);
  
    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Image
            source={
              imageError || !item.imageUrl
                ? require('../assets/precarga_ejercicio.png')
                : { uri: item.imageUrl }
            }
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>
  
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Mustraejercicio', { 
            nota, 
            nombre: item.nombre, 
            imageUrl: item.imageUrl,
            idEjercicio: item.id
          })}>
            <Text style={styles.rutinaText}>{item.nombre}</Text>
          </TouchableOpacity>
  
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{nota.serie} Series</Text>
            <Text style={styles.infoText}> | </Text>
            <Text style={styles.infoText}>{nota.repeticion} Repeticiones</Text>
            <Text style={styles.infoText}> | </Text>
            <Text style={styles.infoText}>{nota.kilo} Kilos</Text>
          </View>
        </View>
      </View>
    );
  };
  

  const renderEjercicio = ({ item }) => {
    const nota = notas[item.id] || { id: item.id, serie: '-', repeticiones: '-', kilos: '-' };
    return <CardEjercicio item={item} nota={nota} navigation={navigation} />;
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1}}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Ejercicios</Text>
      </View>
      <FlatList
        data={Ejercicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEjercicio}
        contentContainerStyle={{ paddingBottom: 30 }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden', // Para asegurarse de que la imagen respete el borderRadius
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
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

export default EjercicioScreen;
