import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { API_CONFIG } from '../constants/config';

const RegistroScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    usuario: '',
    email: '',
    telefono: '',
    tipoPlan: '',
    contrasena: '',
  });

  const [imageUri, setImageUri] = useState(null);

  const handleChange = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleRegister = async () => {
    const datosUsuario = {
      nombre: form.nombre || "",
      apellido: form.apellido || "",
      dni: "",
      genero: "",
      edad: form.edad || "",
      peso: "",
      altura: "",
      telefono: form.telefono || "",
      usuario: form.usuario || "",
      contrasena: form.contrasena || "",
      email: form.email || "",
      contacto: "",
      role: "user",
      fecha_registro: new Date().toISOString(),
    };
  
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosUsuario),
      });
  
      if (!response.ok) {
        throw new Error("Error al registrar el usuario");
      }
  
      const data = await response.json();


      const response3 = await fetch(`${API_CONFIG.BASE_URL}/users/${data.usuario}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response3.ok) {
        throw new Error("Error al registrar el usuario");
      }
      
      const data2 = await response3.json();
      
      const idUsuario = data2.usuario;


      console.log(idUsuario)
      Alert.alert("Éxito", "Usuario registrado correctamente");
  
      if (!imageUri) {
        console.log("No se seleccionó ninguna imagen");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: `${idUsuario}.jpg`,  // Asegurar nombre con extensión
        type: "image/jpeg",
      });
      formData.append("name", idUsuario);
      

      const response2 = await fetch(`${API_CONFIG.BASE_URL}/upload/file`, {
        method: "POST",
        body: formData, // No agregues manualmente el header "Content-Type"
      });
  
      if (!response2.ok) {
        throw new Error("Error al subir la imagen");
      }
  
      Alert.alert("Éxito", "Imagen subida correctamente");
      navigation.navigate("Login");
  
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };
  
  

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se requiere permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });


    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>

      {Object.entries(form).map(([key, value]) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={value}
          onChangeText={(text) => handleChange(key, text)}
          secureTextEntry={key === 'contrasena'}
        />
      ))}

      <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
        <Text style={styles.uploadText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity  
          style={[styles.button, styles.cancelButton]}  
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  uploadText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  acceptButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RegistroScreen;
