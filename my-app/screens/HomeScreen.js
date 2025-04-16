import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { Alert } from 'react-native';


const HomeScreen = ({ onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const navigation = useNavigation();
  const { handleLogout } = useContext(AuthContext);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [pagos, setpagos] = useState([]);
  const [pagoValido, setPagoValido] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const user = await storage.get(STORAGE_KEYS.USER);
          const response = await fetch(`${API_CONFIG.BASE_URL}/users/${user}`);
          if (!response.ok) throw new Error('Error al obtener datos del usuario');

          const data = await response.json();
          setUserData(data);

          const response2 = await fetch(`${API_CONFIG.BASE_URL}/pago/pago/${data.id}`);
          if (!response2.ok) throw new Error('Error al obtener pagos');

          const data2 = await response2.json();
          const pagosOrdenados = data2.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setpagos(pagosOrdenados);

          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          const nombreMes = meses[new Date().getMonth()];

          const pagoDelMes = pagosOrdenados.find(pago => pago.mes === nombreMes);

          if (pagoDelMes) {
            setPagoValido(true);
            setModalVisible(false);
          } else {
            setPagoValido(false);
            setModalVisible(true);
          }

        } catch (error) {
          console.error('Error en fetchUserData:', error);
          setPagoValido(false);
          setModalVisible(true);
        }
      };

      fetchUserData();
    }, [])
  );
  
   
  
  const fetchPhoto = useCallback(async () => {
    try {
      const user = await storage.get(STORAGE_KEYS.USER);
      if (!user) return;
  
      const timestamp = new Date().getTime(); // Genera un timestamp único

      const bucketName = 'gim-image';
      const imageUrl = `https://storage.googleapis.com/${bucketName}/uploads/${user}.jpg?t=${timestamp}`;

      // const imageUrl = `${API_CONFIG.BASE_URL}/upload/${user}.jpg?t=${timestamp}`;
      console.log(imageUrl)
      
      setPhotoUrl(imageUrl);
    } catch (error) {
      console.error('Error al obtener la imagen:', error);
    }
  }, []);
  

  useFocusEffect(
    useCallback(() => {
      fetchPhoto();
    }, [fetchPhoto])
  );

  const logout = async () => {
    await handleLogout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.photoPlaceholder}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} onError={() => setPhotoUrl(null)} />
            ) : (
              <Text style={styles.photoText}>Foto</Text>
            )}
          </View>
          <Text style={styles.name}>  {userData ? `${userData.nombre} ${userData.apellido}` : 'Cargando...'}</Text>
          <Text style={styles.plan}>{userData ? `${userData.genero}` : 'Cargando...'}</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Rutina')}>
            <Text style={styles.buttonText}>Rutina</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Crearrutinascreen')}>
            <Text style={styles.buttonText}>Crear Rutina</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('favoritos')}>
            <Text style={styles.buttonText}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Papelera')}>
            <Text style={styles.buttonText}>Papelera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EjercicioEstadistica')}>
            <Text style={styles.buttonText}>Estadísticas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PerfildeUsuario')} >
            <Text style={styles.buttonText}>Perfil de usuario</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logoutButton, isPressed && styles.logoutButtonPressed]}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={onPress}
          >
            <Text style={styles.logoutButtonText} onPress={logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Pago pendiente</Text>
          <Text style={styles.modalText}>No se encontró un pago registrado para el mes actual.</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
      </Modal>
    </SafeAreaView>


  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  photoPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  photo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  plan: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
  logoutButton: {
    width: '47%',
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutButtonPressed: {
    backgroundColor: '#d32f2f',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#808080',
  },
  button: {
    width: '47%',
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },


  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#d32f2f',
    padding: 25,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#ffffff33',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});




export default HomeScreen;
