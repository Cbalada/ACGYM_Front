import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput,Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';


const UserProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [photoUrl, setPhotoUrl] = useState(null);
  
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const user = await storage.get(STORAGE_KEYS.USER);
        if (!user) return;
        const timestamp = new Date().getTime(); 
        // const imageUrl = `${API_CONFIG.BASE_URL}/upload/${user}.jpg?t=${timestamp}`;
        const bucketName = 'gim-image';
        const imageUrl = `https://storage.googleapis.com/${bucketName}/uploads/${user}.jpg?t=${timestamp}`;
        setPhotoUrl(imageUrl);
      } catch (error) {
        console.error('Error al obtener la imagen:', error);
      }
    };

    fetchPhoto();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await storage.get(STORAGE_KEYS.USER);
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${user}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error en fetchUserData:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
     
      const updatedUserData = {
        nombre: userData.nombre || "",
        apellido: userData.apellido || "",
        dni:userData.dni || "",
        genero:userData.genero || "",
        edad: userData.edad || "",
        peso: userData.peso || "",
        altura: userData.altura || "",
        telefono: userData.telefono || "",
        usuario: userData.usuario || "",
        contrasena: userData.contrasena || "",
        email: userData.email || "",
        contacto: userData.contacto || "",
        role: "user",
        fecha_registro: userData.fecha_registro || "",
      };

      
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) throw new Error("Error al actualizar los datos del usuario");

      const data = await response.json();

      if (photoUrl) {
        const formData = new FormData();
        formData.append("file", {
          uri: photoUrl,
          name: `${userData.usuario}.jpg`,  
          type: "image/jpeg",
        });
        formData.append("name", userData.usuario);
        
    
        const response2 = await fetch(`${API_CONFIG.BASE_URL}/upload/file`, {
          method: "POST",
          body: formData, 
        });
    
        if (!response2.ok) {
          throw new Error("Error al subir la imagen");
        }
    
        Alert.alert("Éxito", "Imagen subida correctamente");
      }

      setUserData(data); 
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  
  if (!userData) {
    return <Text>Cargando...</Text>; 
  }

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
          <Text style={styles.title}>Perfil de usuario</Text>
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Text style={styles.edit}>{isEditing ? "Cancelar" : "Editar"}</Text>
          </TouchableOpacity>
        </View>

     
      <View style={styles.container}>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              <Image source={{ uri: photoUrl }} style={styles.photo} onError={() => setPhotoUrl(null)} />
              {isEditing && (
                <View style={styles.uploadIconContainer}>
                  <Image source={require('../assets/upload.png')} style={styles.uploadIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={isEditing ? userData.nombre || '' : userData.nombre || ''}
            editable={isEditing}
            placeholder="Nombre"
            onChangeText={(text) => setUserData({ ...userData, nombre: text })}
          />
          <TextInput
            style={styles.input}
            value={isEditing ? userData.apellido || '' : userData.apellido || ''}
            editable={isEditing}
            placeholder="Apellido"
            onChangeText={(text) => setUserData({ ...userData, apellido: text })}
          />
          <TextInput
            style={styles.input}
            value={isEditing ? (userData.edad || '').toString() : (userData.edad || '').toString()}
            editable={isEditing}
            placeholder="Edad"
            keyboardType="numeric"
            onChangeText={(text) => setUserData({ ...userData, edad: parseInt(text) })}
          />
          <TextInput
            style={styles.input}
            value={isEditing ? userData.usuario || '' : userData.usuario || ''}
            editable={isEditing}
            placeholder="Usuario"
            onChangeText={(text) => setUserData({ ...userData, usuario: text })}
          />
          <TextInput
            style={styles.input}
            value={isEditing ? userData.email || '' : userData.email || ''}
            editable={isEditing}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={(text) => setUserData({ ...userData, email: text })}
          />
          <TextInput
            style={styles.input}
            value={isEditing ? userData.telefono || '' : userData.telefono || ''}
            editable={isEditing}
            placeholder="Telefono"
            keyboardType="phone-pad"
            onChangeText={(text) => setUserData({ ...userData, telefono: text })}
          />
          <Picker selectedValue={userData.genero} enabled={isEditing} onValueChange={(value) => setUserData({ ...userData, genero: value })}>
            <Picker.Item label="Seleccione tipo de plan" value="" />
            <Picker.Item label="Turno mañana" value="Turno mañana" />
            <Picker.Item label="Turno tarde" value="Turno tarde" />
            <Picker.Item label="Turno noche" value="Turno noche" />
          </Picker>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton}  onPress={() => navigation.goBack(setIsEditing(false))}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.acceptButton, !isEditing && styles.disabledButton]}
            onPress={handleSave}
            disabled={!isEditing}
            >
            <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  uploadIconContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  edit: {
    position: "absolute",
    right: 20,
    size:30,
    fontSize: 16,
    color: "white",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 80,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  cancelButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  acceptButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',  // Alinea verticalmente
    justifyContent: 'space-between', // Distribuye los elementos
    backgroundColor: '#6200ea',
    padding: 15,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,  // Empuja el botón hacia la derecha
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  edit: {
    fontSize: 16,
    color: "white",
  },
    disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default UserProfile;
