import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { API_CONFIG } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
// Añade este import al inicio del archivo
import * as ImagePicker from 'expo-image-picker';

const Muestraejercicio = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {  nombre, imageUrl, idEjercicio } = route.params;
  const [imageError, setImageError] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nota, setNota] = useState(route.params.nota);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null); // imagen nueva
  const [serie, setSerie] = useState(nota.serie);
  const [repeticion, setRepeticion] = useState(nota.repeticion);
  const [kilo, setKilo] = useState(nota.kilo);
  const [descripcion, setDescripcion] = useState(nota.descripcion);

  const { height } = Dimensions.get('window');
  const offset = height * 0.1; // 10% hacia arriba

  const toggleEdit = async () => {
    if (editMode) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/notas/${nota.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descripcion: descripcion,
            serie: serie,
            repeticion: repeticion,
            kilo: kilo,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Error al actualizar la nota');
        }
  
        const updatedNota = await response.json();
        console.log('Nota actualizada con éxito:', updatedNota);
  
        // Verifica si el kilo ha cambiado
        if (kilo !== nota.kilo) {
          const today = new Date();
          const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        
          const estadisticaPayload = {
            fecha: formattedDate,
            kilo: String(kilo),
            idEjercicio: String(nota.idEjercicio || 'sin_id'), // Ajusta si el campo cambia
          };
        
          const estadisticaRes = await fetch(`${API_CONFIG.BASE_URL}/estadistica`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(estadisticaPayload),
          });
        
          if (!estadisticaRes.ok) {
            throw new Error('Error al registrar en estadística');
          }
        
          console.log('Estadística enviada con éxito');
        
          // 👉 Aquí actualizamos nota.kilo después del if
          setNota(prev => ({
            ...prev,
            kilo: kilo,
          }));
        }
        
        if (photoUrl) {
          const formData = new FormData();
          console.log(nota.idEjercicio)
          formData.append("file", {
            uri: photoUrl,
            name: `${nota.idEjercicio}.jpg`,
            type: "image/jpeg",
          });
          formData.append("name", nota.idEjercicio); // Ajusta esto si es otro campo

          const response2 = await fetch(`${API_CONFIG.BASE_URL}/upload/file`, {
            method: "POST",
            body: formData,
          });

          if (!response2.ok) {
            throw new Error("Error al subir la imagen");
          }

          
        }
  
      } catch (error) {
        console.error('Error en el proceso:', error);
      }
    }
  
    setEditMode(!editMode);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0].uri);
    }
  };
  
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Ejercicio</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          if (!buttonPressed) {
            setButtonPressed(true);
            toggleEdit().finally(() => setButtonPressed(false)); // Lo vuelve a habilitar después
          }
        }}
        style={styles.deleteButton}
      >
        <Image
          source={
            editMode
              ? require('../assets/check.png')
              : require('../assets/edit.png')
          }
          style={{ width: '100%', height: '100%' }}
        />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: offset }]}>


          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>

              <Image
                source={
                  imageUrl
                    ? { uri: imageUrl }
                    : require('../assets/default-grey.png')
                }
                onError={() => setImageError(true)}
                style={styles.image}
              />
              {editMode && (
                <View style={styles.uploadIconContainer}>
                  <Image source={require('../assets/upload.png')} style={styles.uploadIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>


        <View style={styles.card}>
          <Text style={styles.exerciseName}>{nombre}</Text>

          <View style={styles.infoContainer}>
            {editMode ? (
              <>
                <TextInput
                  style={styles.input}
                  value={kilo ? kilo.toString() : ''}
                  keyboardType="numeric"
                  onChangeText={setKilo}
                />
                <Text style={styles.infoText}> Kg </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoText}>{serie} Series</Text>
                <Text style={styles.infoText}> | </Text>
                <Text style={styles.infoText}>{repeticion} Repeticiones</Text>
                <Text style={styles.infoText}> | </Text>
                <Text style={styles.infoText}>{kilo} Kilos</Text>
              </>
            )}
          </View>

          {editMode ? (
            <TextInput
              style={styles.textArea}
              multiline
              onChangeText={setDescripcion}
              placeholder="sin descripción"
              placeholderTextColor="#999"
              maxLength={150}
            />


          ) : (
            <Text style={styles.notes}>NOTAS: {descripcion}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  uploadIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2b6cb4',
    borderRadius: 8,
    marginHorizontal: 5,
    width: 80, // ancho fijo
    height: 40,
    maxWidth: 80, // previene expansión excesiva
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 2,
  },
  
  textArea: {
    marginTop: 15,
    borderColor: '#2b6cb4',
    borderWidth: 1,
    padding: 10,
    width: '100%',
    borderRadius: 8,
    fontSize: 16,
  },
  deleteButton: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginTop: 110,
    top: 15,
    right: 15,
    zIndex: 1,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 200,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D3D3D3', // Color gris
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  notes: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  navbar: {
    position: 'relative', // Añade esto
    flexDirection: 'row',
    alignItems: 'center',
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

export default Muestraejercicio;
