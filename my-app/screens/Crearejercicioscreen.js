import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from './Navbar'; 
import { AntDesign } from '@expo/vector-icons'; 
import { Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { useRoute } from '@react-navigation/native';
import { API_CONFIG } from '../constants/config';
import CustomModal from './modalScreen';
import { Ionicons } from '@expo/vector-icons';

const ExerciseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { idDia } = route.params;
  const { idRutina } = route.params;
  const { diasValidacion } = route.params;
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const [exercises, setExercises] = useState([{ id: Date.now(), name: '', series: '', reps: '', imageUri: null }]);

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  const pickImage = async (index) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setExercises((prev) => prev.map((exercise, i) => (i === index ? { ...exercise, imageUri: result.assets[0].uri } : exercise)));
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', series: '', reps: '', imageUri: null }]);
  };


  const removeExercise = (id) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const promises = exercises.map(async (exercise) => {
        if (exercise.name.trim() !== '') {
          const ejercicioData = { nombre: exercise.name, idDia };
          const response = await fetch(`${API_CONFIG.BASE_URL}/ejercicios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ejercicioData),
          });

          if (!response.ok) throw new Error(`Error al guardar el ejercicio ${exercise.name}`);
          const data = await response.json();

          if (exercise.imageUri) {
            const formData = new FormData();
            formData.append("file", {
              uri: exercise.imageUri,
              name: `${data.id}.jpg`,
              type: "image/jpeg",
            });

            formData.append("name", data.id);

            const response2 = await fetch(`${API_CONFIG.BASE_URL}/upload/file`, {
              method: "POST",
              body: formData,
            });

            if (!response2.ok) throw new Error("Error al subir la imagen");
          }

          const ejercicioNotaData = {
            descripcion: 'sin descripcion',
            serie: exercise.series,
            repeticion: exercise.reps,
            kilo: 0,
            idEjercicio: data.id,
          };

          const responseNota = await fetch(`${API_CONFIG.BASE_URL}/notas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ejercicioNotaData),
          });

          if (!responseNota.ok) throw new Error("Error al guardar la nota del ejercicio");
        }
      });

      await Promise.all(promises);
      
      const updatedDiasValidacion = diasValidacion.map((dia) =>
        dia.id === idDia ? { ...dia, ejerciciosCreados: true } : dia
      );

      return { idRutina, updatedDiasValidacion };
    } catch (error) {
      console.error('Error en handleSave:', error);
      alert('Hubo un error al guardar los ejercicios');
      return { idRutina: null, updatedDiasValidacion: [] };
    } finally {
      setLoading(false);
    }
  };
  

  const handleModalAccept = async () => {
    const { idRutina, updatedDiasValidacion } = await handleSave();
    
    if (idRutina && updatedDiasValidacion.length > 0) {
      navigation.navigate('CrearDiascreen', { idRutina, diasValidacion: updatedDiasValidacion });
    } else {
      console.error("No se pudieron obtener los datos actualizados.");
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.navbar}>
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
         <Ionicons name="arrow-back" size={24} color="white" />
       </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Ejercicios</Text>
        </View>
     </View>


      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}

        <View style={styles.content}>
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseBlock}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa Ejercicio"
                  value={exercise.name}
                  onChangeText={(text) => {
                    setExercises((prev) =>
                      prev.map((ex, i) => (i === index ? { ...ex, name: text } : ex))
                    );
                  }}
                />
                {index === 0 && exercises.length >= 0 && (
                  <TouchableOpacity style={styles.botonAgregar} onPress={addExercise}>
                    <AntDesign name="pluscircle" size={24} color="blue" />
                  </TouchableOpacity>
                )}
                {index > 0 && exercises.length > 1 && (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => removeExercise(exercise.id)}>
                    <AntDesign name="minuscircle" size={24} color="red" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Serie"
                value={exercise.series}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const filtered = text.replace(/[^0-9\/\-\|]/g, '');
                  setExercises((prev) =>
                    prev.map((ex, i) => (i === index ? { ...ex, series: filtered } : ex))
                  );
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Repeticiones"
                value={exercise.reps}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const filtered = text.replace(/[^0-9\/\-\|]/g, '');
                  setExercises((prev) =>
                    prev.map((ex, i) => (i === index ? { ...ex, reps: filtered } : ex))
                  );
                }}
              />
                <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(index)}>
                  <Entypo name="upload" size={24} color="blue" />  
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Atrás</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleModalAccept}
            disabled={loading}
          >
            <Text style={styles.buttonText}>GUARDAR</Text>
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
  loadingOverlay: { 
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center'
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
  botonAgregar: {
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  imageButton: {
    marginLeft: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    backgroundColor: '#fff', 
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
  exerciseBlock: {
    marginBottom: 20, 
  },

  loadingOverlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 9999, // 👈 Añade esto
    elevation: 9999 // 👈 Para Android
  },


});

export default ExerciseScreen;
