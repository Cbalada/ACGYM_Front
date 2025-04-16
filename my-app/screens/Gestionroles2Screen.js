import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Sidebar from './SidebarScreenWeb'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { authService } from '../services/authService';
import React, { useContext, useState, useCallback, useEffect } from 'react';
import { enviarActividad } from '../screens/Historial2Screen'
import { useWindowDimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';

const GestionRoles2ScreenWeb = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [users, setUsers] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false); // Estado para mostrar opciones
  const [order, setOrder] = useState('asc'); // Estado para orden (ascendente o descendente)
  const [showActiveUsers, setShowActiveUsers] = useState(true); // Nuevo estado
  const { height: screenHeight } = useWindowDimensions();
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const token = await authService.getToken();
          if (!token) throw new Error('No token found');
  
          const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
  
          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  
          const data = await response.json();
  
          const usersWithImages = data.map((user) => ({
            ...user,
            imageUrl: `https://storage.googleapis.com/gim-image/uploads/${user.usuario}.jpg`,
          }));
  
          console.log(usersWithImages);
          setUsers(usersWithImages);
        } catch (error) {
          console.error('Error en fetchUserData:', error.message);
        }
      };
  
      fetchUserData();
    }, []) // Se ejecutará cada vez que la pantalla gane el foco
  );


  const filteredUsers = users
  .filter((user) => 
    (showActiveUsers ? user.isActive : !user.isActive) &&
    user.nombre.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => order === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre));






  return (
    <View style={styles.mainContainer}>
      {/* <Sidebar /> */}
      <View style={[styles.container, { minHeight: screenHeight }]}>
        <Text style={styles.title}>Gestion De Roles</Text>
        <View style={styles.header}>
          <Text style={styles.subTitle}>Lista De Usuarios</Text>
          {filterVisible && (
            <View style={styles.filterOptionsContainer}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, order === 'asc' && styles.checkboxSelected]}
                  onPress={() => setOrder('asc')}
                >
                  {order === 'asc' && <FontAwesome name="check" size={14} color="white" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Ascendente</Text>
              </View>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, order === 'desc' && styles.checkboxSelected]}
                  onPress={() => setOrder('desc')}
                >
                  {order === 'desc' && <FontAwesome name="check" size={14} color="white" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Descendente</Text>
              </View>
            </View>
          )}
          {showSearch && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar actividad..."
                value={search}
                onChangeText={setSearch}
                autoFocus
                placeholderTextColor="#666"
              />
            </View>
          )}
          <View style={styles.filterContainer}>
            <View style={styles.searchButtonContainer}>
              <TouchableOpacity 
                onPress={() => setShowActiveUsers(!showActiveUsers)} 
                style={styles.statusToggleButton}
              >
                <FontAwesome name="user" size={20} color={showActiveUsers ? "green" : "red"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchButton}>
                <FontAwesome name="search" size={20} color="white" style={styles.searchicon}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)} style={styles.filterButton}>
                <Image source={require("../assets/filter.png")} size={20}  style={styles.filterIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <FlatList
          data={filteredUsers}
          style={styles.listaUser}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ScrollView style={styles.scrollView}>
              <View style={styles.userRow}>
                <Image source={{ uri: item.imageUrl }} style={styles.userImage} />
                <Text
                  style={styles.userName}
                  onPress={() => {
                    navigation.navigate('GestionRolesWeb', { Datosusuario: item });
                  }}
                >
                  {item.nombre} {item.apellido}
                </Text>
                <TouchableOpacity onPress={() => {navigation.navigate('GestionRolesWeb', { Datosusuario: item })}}>
                  <Image source={require('../assets/formkit--right.png')} style={styles.Icons} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  statusToggleButton: {
    borderRadius: 50,
    backgroundColor: '#4B0082',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 10, // separa este botón del siguiente
  },
  listaUser:{
    height: 300,
  },
  filterButton: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  filterIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "white",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    elevation: 3, // Sombra en Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  searchicon:{
    marginLeft: 5,
  },

  filterButton: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // No necesita marginRight porque es el último
  },
  selected: {
    backgroundColor: "#007BFF",
  },
  filterTextOption: {
    marginLeft: 10,
    fontSize: 16,
    color: "black",
  },
  searchicon:{
    marginLeft: 5,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#4B0082',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#4B0082',
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'black',
  },
  altoFlatList: {
    height: 300,
  },
  scrollView: {
    maxHeight: 400,
    overflowY: 'auto', 
    backgroundColor: 'white', 
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    padding: 20,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10, // separación entre botones
    marginBottom: 10,
  },
  searchButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  searchButton: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // separa este botón del siguiente
  },
  
  searchInput: {
    width: '90%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#4B0082',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    fontSize: 16,
    color: '#333',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userRow: {
    width: '100%', 
    height: 60,  
    backgroundColor: 'lightgray',
    padding: 10,
    marginBottom: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'lightgray',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  Icons: {
    width: 25,
    height: 25,
    padding: 10,
    borderRadius: 8, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, // Sombra en Android
  },
});

export default GestionRoles2ScreenWeb;
