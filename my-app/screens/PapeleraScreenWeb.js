import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, ScrollView, Modal  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Sidebar from './SidebarScreenWeb';
import { Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';
import { enviarActividad } from '../screens/Historial2Screen'


const PapeleraScreenWeb = () => {
  const [rutinas, setRutinas] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [orderAsc, setOrderAsc] = useState(true);
  const [sortedRutinas, setSortedRutinas] = useState([]);
  
  useEffect(() => {
    // Ordenar la lista cada vez que cambie orderAsc o rutinas
    const sortedData = [...rutinas].sort((a, b) =>
      orderAsc ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre)
    );
    setSortedRutinas(sortedData);
  }, [orderAsc, rutinas]);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters); // Solo se activa o desactiva cuando se toca el botón "Filtros"
  };
  
  const selectOrder = (asc) => {
    setOrderAsc(asc);
  };

  const fetchRutinas = useCallback(async () => {
    try {
      setLoading(true);
      const user = await storage.get(STORAGE_KEYS.USER);
      const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/user/${user}`);
      if (!response.ok) {
        throw new Error('Error al obtener rutinas');
      }
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));

      setRutinas(sortedData);
    } catch (error) {
      console.error('Error en fetchRutinas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Llamar fetchRutinas en cada renderizado del componente
  useEffect(() => {
    fetchRutinas();
  }, [fetchRutinas]);

    const handleDelete = (id) => {
      setRoutines(routines.filter(routine => routine.id !== id));
    };

    const handleEdit = (id) => {
      console.log(`Editar rutina con id: ${id}`);
    };

   const togglePapelera = async (itemId) => {
      try {
        const user = await storage.get(STORAGE_KEYS.USER);
        const rutinaSeleccionada = rutinas.find((r) => r.id === itemId);
    
        if (!rutinaSeleccionada) {
          console.error('No se encontró la rutina con el ID:', itemId);
          return;
        }
    
        console.log('Botón presionado para:', rutinaSeleccionada.nombre);
    
        const nuevaRutinaData = {
          nombre: rutinaSeleccionada.nombre,
          idUser: user,
          activa: !rutinaSeleccionada.activa,
          favorita: rutinaSeleccionada.favorita,
        };
    
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaRutinaData),
        });
    
        if (!response.ok) {
          throw new Error('Error al actualizar la Papelera');
        }
    
        const data = await response.json();
        console.log('Papelera actualizada exitosamente:', data);
        enviarActividad("Recupero  Rutina");
        setIsModalVisible(false);
      
        setRutinas((prevRutinas) =>
          prevRutinas.map((r) =>
            r.id === itemId ? { ...r, activa: !r.activa } : r
          )
        );

        await fetchRutinas();
      } catch (error) {
        console.error('Error en togglePapelera:', error);
      }
    };

    const togglePapeleraDefinitivo = async () => {
      if (!selectedItemId) return;
  
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${selectedItemId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
  
        if (!response.ok) {
          throw new Error('Error al eliminar la rutina');
        }
  
        enviarActividad("Rutina eliminada definitivamente");
  
        setRutinas((prevRutinas) => prevRutinas.filter((r) => r.id !== selectedItemId));
  
        await fetchRutinas();
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error en togglePapeleraDefinitivo:', error);
      }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Sidebar /> */}
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}> <Text style={styles.italic}>Papelera</Text> </Text>

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

            {showFilters && (
              <View style={styles.filterOptionsContainer}>
                <View style={styles.checkboxGroup}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity 
                      style={[styles.checkbox, orderAsc && styles.checkboxSelected]}
                      onPress={() => selectOrder(true)}
                    >
                      {orderAsc && <FontAwesome name="check" size={14} color="white" />}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>Ascendente</Text>
                  </View>
                  
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity 
                      style={[styles.checkbox, !orderAsc && styles.checkboxSelected]}
                      onPress={() => selectOrder(false)}
                    >
                      {!orderAsc && <FontAwesome name="check" size={14} color="white" />}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>Descendente</Text>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.searchButtonContainer}>
              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={styles.searchButton}
              >
                <Image
                  source={require("../assets/buscar.png")}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFilters}
                style={styles.searchButton} // reutilizamos el mismo estilo que el searchButton
              >
               <Image source={require("../assets/filter.png")} style={styles.filterIcon} />
              </TouchableOpacity>
            </View>
          </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
              style={styles.altoFlatList}
              data={sortedRutinas.filter(r => !r.activa && r.nombre.toLowerCase().includes(search.toLowerCase()))}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ScrollView style={styles.scrollView}>
                  <View style={styles.routineCard}>
                    <Text style={styles.routineText} onPress={() => navigation.navigate('RutinaWeb', {DatoRutina: item.id, DatoRutinaNombre: item.nombre})}>{item.nombre}</Text>
                    <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        setSelectedItemId(item.id);
                        setIsModalVisible(true);
                      }}
                    >
                      <Image source={require('../assets/delete.png')} style={styles.deleteButton} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => togglePapelera(item.id)}>
                      <Image source={require('../assets/eos-icons--arrow-rotate.png')} style={styles.deleteButton}/>
                    </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              )}
            />

          )}
        
        <Modal transparent={true} visible={isModalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>¿Eliminar rutina?</Text>
              <Text style={styles.modalText}>¿Deseas borrar definitivamente esta rutina?.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonDelete} onPress={togglePapeleraDefinitivo}>
                  <Text style={styles.modalButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
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

  filterOptionsContainer: {
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
  checkboxGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15, // Ajusta este valor para el espaciado
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
  },
  safeArea: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  italic: {
    fontStyle: 'italic',
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
    justifyContent: 'center',
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
  routineCard: {
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
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  routineText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionText: {
    marginLeft: 10,
    color: 'blue',
  },
  deleteButton: {
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
  Icons: {
    width: 20,
    height: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 280,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButtonCancel: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  modalButtonDelete: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#d9534f',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});

export default PapeleraScreenWeb;
