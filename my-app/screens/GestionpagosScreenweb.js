import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView  } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Sidebar from './SidebarScreenWeb';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { API_CONFIG } from '../constants/config';
import { authService } from '../services/authService';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';


const GestionPagoScreenWeb = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [users, setUsers] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false); // Estado para mostrar opciones
  const [order, setOrder] = useState('asc'); // Estado para orden (ascendente o descendente)
  const [pagos, setPagos] = useState([])
  const [totalMes, setTotalMes] = useState(0);
  const [showTotal, setShowTotal] = useState(true);
  const route = useRoute();

  useEffect(() => {
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

        // Añadir imageUrl a cada usuario
        const usersWithImages = data.map((user) => ({
          ...user,
          imageUrl: `https://storage.googleapis.com/gim-image/uploads/${user.usuario}.jpg`,
        
        }));
        console.log(usersWithImages)
        setUsers(usersWithImages);
      } catch (error) {
        console.error('Error en fetchUserData:', error.message);
      }
    };

    fetchUserData();
  }, []);
  
  useEffect(() => {
    const fetchPagosData = async () => {
      try {
        const token = await authService.getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_CONFIG.BASE_URL}/pago`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        setPagos(data);

        // Filtrar pagos del mes y año actual
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1; // Los meses van de 0 a 11
        const añoActual = fechaActual.getFullYear();

        const pagosFiltrados = data.filter(pago => {
          // Dividir la fecha del pago (formato "dd/mm/yyyy")
          const [dia, mes, año] = pago.fecha.split('/').map(Number);
          
          // Comparar mes y año
          return mes === mesActual && año === añoActual;
        });

        // Sumar los montos de los pagos filtrados
        const suma = pagosFiltrados.reduce((total, pago) => {
          return total + parseFloat(pago.monto);
        }, 0);

        setTotalMes(suma);
      } catch (error) {
        console.error('Error en fetchPagosData:', error.message);
      }
    };

    fetchPagosData();
  }, []);


  const filteredUsers = users
  .filter((user) => user.nombre.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => order === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre));



  return (
    <View style={styles.mainContainer}>
      {/* <Sidebar /> */}
      <View style={styles.container}>
        <Text style={styles.title}>Gestión De Pagos</Text>
        <View style={styles.header}>
          <Text style={styles.subTitle}>Lista De Usuarios Para Pagos</Text>

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
              <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchButton}>
                  <Image
                    source={require("../assets/buscar.png")}
                    style={styles.searchIcon}
                  />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)} style={styles.filterButton}>
                  <Image source={require("../assets/filter.png")} style={styles.filterIcon} />
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
                  onPress={() => navigation.navigate('GestionPagoUserWeb', { datosusuario: item })}
                >
                  {item.nombre} {item.apellido}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('GestionPagoUserWeb', { datosusuario: item })}>
                    <Image source={require('../assets/payments.png')} style={styles.Icons} />
                  </TouchableOpacity>

              </View>
            </ScrollView>
          )}
        />
           <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Del Mes:</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.totalValue}>
                  {showTotal ? `$${totalMes.toFixed(2)}` : '******'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowTotal(!showTotal)}
                  style={styles.eyeIconContainer}
                >
                  <Image 
                    source={
                      showTotal
                        ? require('../assets/eyes.png')
                        : require('../assets/eyesoff.png')
                    }
                    style={styles.eyeImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  totalContainer: {
    // tu estilo aquí
  },
  totalLabel: {
    // tu estilo aquí
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalValue: {
    // tu estilo aquí
  },
  eyeIconContainer: {
    marginLeft: 8,
  },
  eyeImage: {
    width: 20,
    height: 20,
  },
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightAlignedGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingLeft: 10, // Espacio entre label y valores
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 80,
    textAlign: 'right',
  },
  eyeIconContainer: {
    marginLeft: 5, // Espacio entre valor y ojo
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginVertical: 5,
    elevation: 3, // Sombra en Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
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
  searchButton: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  searchContainer: {
    marginBottom: 15,
    alignItems: 'center',
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
    width: 30,
    height: 30,
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
  valueContainer: {
    flexDirection: 'row', // Organiza elementos en fila
    justifyContent: 'space-between', // Separa elementos en los extremos
    alignItems: 'center', // Alinea verticalmente
    width: '100%', // Ocupa todo el ancho disponible
  },
  totalValue: {
    textAlign: 'right', // Alinea el texto a la derecha
    flex: 1, // Ocupa el máximo espacio disponible dentro del contenedor
  },
    
});

export default GestionPagoScreenWeb;
