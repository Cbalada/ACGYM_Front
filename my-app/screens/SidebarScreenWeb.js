import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect, useNavigationState } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

const Sidebar = () => {
  const navigation = useNavigation();
  const { handleLogout } = useContext(AuthContext);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const currentRoute = useNavigationState((state) =>
    state?.routes?.[state.index]?.name || ''
  );
  
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

  const fetchPhoto = useCallback(async () => {
    try {
      const user = await storage.get(STORAGE_KEYS.USER);
      if (!user) return;
  
      const timestamp = new Date().getTime();
      const bucketName = 'gim-image';
      const imageUrl = `https://storage.googleapis.com/${bucketName}/uploads/${user}.jpg?t=${timestamp}`;
      
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

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  return (

    <View style={styles.sidebar}>
      <View style={styles.circle}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} onError={() => setPhotoUrl(null)} />
        ) : (
          <Text style={styles.photoText}>Foto</Text>
        )}
      </View>
      <Text style={styles.userName}>{userData ? `${userData.nombre} ${userData.apellido}` : 'Cargando...'}</Text>

      <View style={styles.menuOptions}>
        {[
          { name: 'Crear Rutinas', screen: 'GestionDeRutinaWeb' },
          { name: 'Ver Rutinas', screen: 'HomeWeb' },
          { name: 'Papelera', screen: 'PapeleraWeb' },
          { name: 'Gestion de Pagos', screen: 'GestionpagoWeb' },
          { name: 'Gestion de Roles', screen: 'Gestionroles2ScreenWeb' },
          { name: 'Historial', screen: 'HistorialscreenWeb' }
        ].map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.menuItem,
              currentRoute === item.screen && styles.selectedMenuItem
            ]}
            onPress={() => handlePress(item.screen)}
          >
            <Text style={styles.menuItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Image source={require('../assets/logout.png')} style={styles.icon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100vh',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#4B0082',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoText: {
    color: '#ccc',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuOptions: {
    flex: 1,
    width: '100%',
  },
  menuItem: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedMenuItem: {
    backgroundColor: '#6A0DAD',
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
  },
  logoutButton: {
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
});

export default Sidebar;
