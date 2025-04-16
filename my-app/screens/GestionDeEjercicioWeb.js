import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import Sidebar from '../screens/SidebarScreenWeb';
import { AntDesign, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';


const GestionDeDiaScreenWeb = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { idDia } = route.params;
  const { idRutina } = route.params;
  const { diasValidacion } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);



  const [exercises, setExercises] = useState([{ id: Date.now(), name: '', series: '', reps: '', imageUri: null }]);

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  const pickImage = async (exerciseIndex) => {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setExercises(prev => 
                prev.map((ex, i) => 
                  i === exerciseIndex ? { ...ex, imageUri: reader.result } : ex
                )
              );
              resolve();
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      });
    } else {
      // Código para móviles (sin cambios)
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Se necesita permiso para acceder a las imágenes.');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        setExercises(prev => 
          prev.map((ex, i) => 
            i === exerciseIndex ? { ...ex, imageUri: result.assets[0].uri } : ex
          )
        );
      }
    }
  }

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', series: '', reps: '', imageUri: null }]);
  };


  const removeExercise = (id) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const handleSave = async () => {
    try {
      const promises = exercises.map(async (exercise) => {
        if (exercise.name.trim() !== '') { 
          const ejercicioData = {
            nombre: exercise.name,
            idDia: idDia,
          };
  
          const response = await fetch(`${API_CONFIG.BASE_URL}/ejercicios`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ejercicioData),
          });
  
          if (!response.ok) throw new Error(`Error al guardar el ejercicio ${exercise.name}`);
          
          const data = await response.json();
          console.log(`Ejercicio ${exercise.name} guardado con éxito`, data);
  
          console.log(data.id)
          const idEjercicio2 = data.id
               
          // **SUBIR IMAGEN SOLO SI EXISTE**
          if (exercise.imageUri) {
            const formData = new FormData();
            
            if (Platform.OS === 'web') {
              const blob = await fetch(exercise.imageUri).then(r => r.blob());
              formData.append("file", blob, `${idEjercicio2}.jpg`);
            } else {
              const file = {
                uri: exercise.imageUri,
                name: `${idEjercicio2}.jpg`,
                type: "image/jpeg"
              };
              formData.append("file", file);
            }
  
            formData.append("name", idEjercicio2);
  
            for (var pair of formData.entries()) {
              console.log(pair[0] + ', ' + pair[1]);
            }
  
            const response2 = await fetch(`${API_CONFIG.BASE_URL}/upload/file`, {
              method: "POST",
              body: formData, 
            });
  
            if (!response2.ok) {
              const errorResponse = await response2.text();
              throw new Error(`Error al subir la imagen: ${errorResponse}`);
            }

            console.log("Imagen subida correctamente");
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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ejercicioNotaData),
          });
  
          if (!responseNota.ok) throw new Error("Error al guardar la nota del ejercicio");
  
          console.log(`Nota del ejercicio ${exercise.name} guardada con éxito`);
        }
      });
  
      await Promise.all(promises);
  
      // **Actualizar estado de ejercicios creados**
      const updatedDiasValidacion = diasValidacion.map((dia) =>
        dia.id === idDia ? { ...dia, ejerciciosCreados: true } : dia
      );
  
      alert('Ejercicios guardados correctamente');
      navigation.navigate('GestionDeDiaWeb', { idRutina, diasValidacion: updatedDiasValidacion });
  
    } catch (error) {
      console.error('Error en handleSave:', error);
      alert('Hubo un error al guardar los ejercicios');
    }
  };




  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Sidebar /> */}
      <View style={styles.container}>
        <Text style={styles.title}>Crear Rutina - Asignar Ejercicios</Text>
        {exercises.map((exercise, index) => (
          <View style={styles.borderContainer}>
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
              <TouchableOpacity style={styles.addButton}>
                <AntDesign name="plus" size={20} color="black" />
              </TouchableOpacity>

              {index === 0 && exercises.length >= 0 && (
                <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                  <AntDesign name="pluscircle" size={24} color="blue" />
                </TouchableOpacity>
              )}
              {index > 0 && exercises.length > 1 && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => removeExercise(exercise.id)}>
                  <AntDesign name="minuscircle" size={24} color="red" />
                </TouchableOpacity>
              )}


            </View>

            <View style={styles.seriesRepsContainer}>
              <TextInput
                style={styles.seriesInput}
                placeholder="Serie"
                value={exercise.series}
                onChangeText={(text) => {
                  setExercises((prev) =>
                    prev.map((ex, i) => (i === index ? { ...ex, series: text } : ex))
                  );
                }}
              />
              <TextInput
                style={styles.repsInput}
                placeholder="Repeticiones"
                value={exercise.reps}
                onChangeText={(text) => {
                  setExercises((prev) =>
                    prev.map((ex, i) => (i === index ? { ...ex, reps: text } : ex))
                  );
                }}
              />
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={() => pickImage(index)}>
                <Entypo name="upload" size={24} color="blue" />
              </TouchableOpacity>
            </View>

            {exercise.imageUri && (
              <Image source={{ uri: exercise.imageUri }} style={styles.previewImage} />
            )}
          </View>
        ))}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Atrás</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => { handleSave(); navigation.navigate('GestionDeDiaWeb', { idRutina:idRutina, diasValidacion:diasValidacion })}}>
              <Text style={styles.buttonText}>Guardar</Text>
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
    padding: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  borderContainer: {
    width: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4B0082',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  addButton: {
    padding: 10,
  },
  seriesRepsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  seriesInput: {
    width: '45%',
    borderBottomWidth: 1,
    padding: 5,
  },
  repsInput: {
    width: '45%',
    borderBottomWidth: 1,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    position: 'absolute',
    bottom: 20,
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
  imageButton: {
    marginLeft: 5,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
});

export default GestionDeDiaScreenWeb;
