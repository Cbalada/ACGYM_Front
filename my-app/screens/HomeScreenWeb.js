import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Sidebar from '../screens/SidebarScreenWeb';
import { Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';
import { enviarActividad } from '../screens/Historial2Screen'


const HomeScreenWeb = () => {
  const [rutinas, setRutinas] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
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

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);
        const user = await storage.get(STORAGE_KEYS.USER);
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/user/${user}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }
        const data = await response.json();
  
        // Ordenar por nombre en orden alfabético
        const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  
        setRutinas(sortedData);
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRutinas();
  }, []);

  const handleDelete = (id) => {
    setRoutines(routines.filter(routine => routine.id !== id));
  };

  const handleEdit = async (id) => {
    const rutina = rutinas.find(r => r.id === id);
    setSelectedRoutine(rutina); // Guardamos la rutina seleccionada
    setModalVisible(true);
  };
  

  useEffect(() => {
    const fetchUsers = async () => {
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

        if (!response.ok) throw new Error('Error al obtener usuarios');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error en fetchUsers:', error);
      }
    };
    fetchUsers();
  }, []);

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
      enviarActividad("Elimino  Rutina");

      // Actualizar el estado local de rutinas
      setRutinas((prevRutinas) =>
        prevRutinas.map((r) =>
          r.id === itemId ? { ...r, activa: !r.activa } : r
        )
      );
    } catch (error) {
      console.error('Error en togglePapelera:', error);
    }
  };

  const handleSelectUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCloseModal = () => {
    setSelectedUsers([]);
    setModalVisible(false);
    setUserSearch('')
  };

  const validarImagen = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok; // Devuelve true si la imagen existe
    } catch (error) {
      return false; // Devuelve false si hay un error
    }
  };
  
  const enviarRutina = async () => {
    if (!selectedRoutine || selectedUsers.length === 0) {
      console.error("Debe seleccionar una rutina y al menos un usuario.");
      return;
    }
  
    try {
      // 1. Obtener los días de la rutina seleccionada
      const responseDias = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${selectedRoutine.id}`);
      if (!responseDias.ok) throw new Error("Error al obtener los días de la rutina");
  
      const dias = await responseDias.json();
  
      // 2. Obtener los ejercicios de cada día junto con sus notas
      const ejerciciosPorDia = {};
      for (let dia of dias) {
        const responseEjercicios = await fetch(`${API_CONFIG.BASE_URL}/ejercicios/dia/${dia.id}`);
        if (!responseEjercicios.ok) throw new Error(`Error al obtener ejercicios del día ${dia.nombre}`);
  
        const ejercicios2 = await responseEjercicios.json();
        const ejercicios = await Promise.all(
          ejercicios2.map(async (ejercicio) => {
            const imageUrl = `https://storage.googleapis.com/gim-image/uploads/${ejercicio.id}.jpg`;
            const esImagenValida = await validarImagen(imageUrl);
  
            return {
              ...ejercicio,
              imageUrl: esImagenValida ? imageUrl : "", // Si no existe, lo deja vacío
            };
          })
        );
  
        // Obtener las notas de cada ejercicio
        for (let ejercicio of ejercicios) {
          ejercicio.notas = await fetchNotas(ejercicio.id);
        }
  
        ejerciciosPorDia[dia.id] = ejercicios;
      }
  
      // 3. Crear rutinas para cada usuario seleccionado
      const requests = selectedUsers.map(async (user) => {
        const rutinaData = { nombre: selectedRoutine.nombre, idUser: user.usuario, activa: true };
        console.log("Enviando rutina:", rutinaData);
  
        const responseRutina = await fetch(`${API_CONFIG.BASE_URL}/rutinas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rutinaData),
        });
  
        if (!responseRutina.ok) throw new Error(`Error al enviar rutina para usuario ${user.usuario}`);
  
        const dataRutina = await responseRutina.json();
        console.log(`Rutina creada exitosamente para ${user.usuario}:`, dataRutina);
  
        // 4. Crear días en la nueva rutina
        for (let dia of dias) {
          const diaData = { nombre: dia.nombre, idRutina: dataRutina.id };
  
          const responseDia = await fetch(`${API_CONFIG.BASE_URL}/dias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(diaData),
          });
  
          if (!responseDia.ok) throw new Error(`Error al enviar el día ${dia.nombre}`);
  
          const nuevoDia = await responseDia.json();
          console.log(`Día ${dia.nombre} enviado exitosamente.`);
  
          // 5. Enviar los ejercicios de este día a la nueva rutina y sus notas
          for (let ejercicio of ejerciciosPorDia[dia.id] || []) {
            const ejercicioData = { nombre: ejercicio.nombre, idDia: nuevoDia.id };
  
            const responseEjercicio = await fetch(`${API_CONFIG.BASE_URL}/ejercicios`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ejercicioData),
            });
  
            if (!responseEjercicio.ok) throw new Error(`Error al enviar el ejercicio ${ejercicio.nombre}`);
  
            const nuevoEjercicio = await responseEjercicio.json();
            console.log(`Ejercicio ${ejercicio.nombre} enviado exitosamente.`);
  
            // 🚀 **Aquí verificamos si hay una imagen válida antes de subirla**
            if (ejercicio.imageUrl) {
              const formData = new FormData();
              formData.append("file", {
                uri: ejercicio.imageUrl, // ✅ Se usa la URL validada
                name: `${nuevoEjercicio.id}.jpg`, // ✅ Se usa el nuevo ID correcto
                type: "image/jpeg",
              });
  
              formData.append("name", nuevoEjercicio.id);
  
              const response2 = await fetch(`${API_CONFIG.BASE_URL}/upload/file`, {
                method: "POST",
                body: formData,
              });
  
              if (!response2.ok) throw new Error("Error al subir la imagen");
  
              console.log("Imagen subida correctamente");
            }
  
            // 6. Enviar las notas del ejercicio si existen
            for (let nota of ejercicio.notas || []) {
              await fetchCrearNotas(nota, nuevoEjercicio.id);
            }
          }
        }
      });
  
      // Esperar que todas las solicitudes terminen
      await Promise.all(requests);
  
      // Cerrar el modal y limpiar la selección
      setModalVisible(false);
      setSelectedUsers([]);
  
      console.log("Todas las rutinas, días y ejercicios fueron enviados correctamente.");
    } catch (error) {
      console.error("Error al enviar rutinas:", error);
    }
  };
  
  
  const fetchNotas = async (idEjercicio) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/notas/ejercicio/${idEjercicio}`);
      if (!response.ok) throw new Error('Error al obtener notas');
  
      const data = await response.json();
      return data.length > 0 ? data : [];
    } catch (error) {
      console.error('Error en fetchNotas:', error);
      return [];
    }
  };
  
  const fetchCrearNotas = async (nota, idEjercicio) => {
    try {
      const ejercicioNotaData = {
        descripcion: nota.descripcion || 'sin descripcion',
        serie: nota.serie || 0,
        repeticion: nota.repeticion || 0,
        kilo: nota.kilo || 0,
        idEjercicio: idEjercicio,
      };
  
      const responseNota = await fetch(`${API_CONFIG.BASE_URL}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ejercicioNotaData),
      });
  
      if (!responseNota.ok) throw new Error('Error al crear nota');
  
      console.log(`Nota creada para el ejercicio ${idEjercicio}`);
    } catch (error) {
      console.error('Error en fetchCrearNotas:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Sidebar /> */}
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>
            <Text style={styles.italic}>Rutinas</Text>
          </Text>
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
              <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.iconButton}>
                <Image
                  source={require("../assets/buscar.png")}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFilters} style={styles.iconButton}>
                <Image source={require("../assets/filter.png")} style={styles.iconImage3} />
              </TouchableOpacity>
            </View>

        </View>


        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            style={styles.altoFlatList}
            data={sortedRutinas.filter((r) => r.activa && r.nombre.toLowerCase().includes(search.toLowerCase()))}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ScrollView style={styles.scrollView}>
                <View style={styles.routineCard}>
                  <Text
                    style={styles.routineText}
                    onPress={() => navigation.navigate('RutinaWeb', { DatoRutina: item.id, DatoRutinaNombre: item.nombre })}
                  >
                    {item.nombre}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.favoritoButton} onPress={() => togglePapelera(item.id)}>
                      <Image source={require('../assets/delete.png')} style={styles.iconImage2} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.favoritoButton} onPress={() => handleEdit(item.id)}>
                      <Image source={require('../assets/ChatGPT Image 13 abr 2025, 05_34_26 p.m..png')} style={styles.iconImage} />
                    </TouchableOpacity>
                  </View>

                </View>
              </ScrollView>
            )}
          />
          )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar Usuarios</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar usuario..."
              placeholderTextColor="#888"
              value={userSearch}
              onChangeText={setUserSearch}
            />

            <FlatList
              style={styles.userList}
              data={users.filter((user) =>
                user.usuario.toLowerCase().includes(userSearch.toLowerCase())
              )}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    selectedUsers.some((u) => u.id === item.id) && styles.userItemSelected,
                  ]}
                  onPress={() => handleSelectUser(item)}
                >
                  <Text style={styles.userText}>{item.usuario}</Text>
                </TouchableOpacity>
              )}
            />

            <View style={styles.selectedUsersContainer}>
              {selectedUsers.map((user) => (
                <View key={user.id} style={styles.userBadge}>
                  <Text style={styles.userBadgeText}>{user.usuario}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCloseModal}>
                <Text style={styles.actionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={enviarRutina}>
                <Text style={styles.actionText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconButton: {
    backgroundColor: '#4B0082',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage3: {
    width: 20,
    height: 20,
    tintColor: 'white',
    resizeMode: 'contain',
  },
  iconImage: {
    width: 25,
    height: 25,
    tintColor: 'blue',
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  iconImage2: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  listContainer: {
    height: 200, // ¡Altura fija para que no empuje los botones!
    marginBottom: 10,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedUser: {
    backgroundColor: '#d0f0c0',
  },
  selectedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectedUserBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    margin: 2,
  },
  selectedUserText: {
    color: 'white',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // para que tengan separación sin romper el ancho
  },
  
  buttonBase: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 5,
  },
  
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  
  sendButton: {
    backgroundColor: '#007BFF',
  },
  
  filterButton: {
    padding: 10,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
    marginHorizontal: 15, 
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
    paddingHorizontal: 10,
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
    alignItems: 'center',
    gap: 10, // espacio entre botones
  },
  searchButton: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
},
  searchContainer: {
    alignItems: 'center',
  },
  searchInput: {
      width: '10%',
      padding: 10,
      borderWidth: 1,
      borderColor: '#4B0082',
      borderRadius: 8,
      backgroundColor: '#F0F0F0',
      fontSize: 5,
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
    width: 20,
    height: 20,
    padding: 10,
    borderRadius: 8, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, 
  },
  Icons: {
    width: 20,
    height: 20,
  },
  iconButtonUnified: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '90%',
    maxWidth: 500, // Limita el tamaño en pantallas grandes
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  userList: {
    maxHeight: 200,
    marginBottom: 10,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
  },
  userItemSelected: {
    backgroundColor: '#e6f0ff',
  },
  userText: {
    fontSize: 16,
    color: '#333',
  },
  selectedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  userBadge: {
    backgroundColor: '#4B0082',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  userBadgeText: {
    color: '#fff',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  selectedUserItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: '#e0e0e0' },
  contenedorbotones:{display: 'flex',flexdirection: "row",justifyContent:" space-between"},
});

export default HomeScreenWeb;




