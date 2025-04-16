import { View, StyleSheet, TouchableOpacity } from "react-native";
import Sidebar from "../screens/SidebarScreenWeb";
import { Card, Text, Button, Avatar ,TextInput} from "react-native-paper";
import {  ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import React, { useContext, useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Image } from 'react-native';
import { enviarActividad } from '../screens/Historial2Screen'
import { Linking } from 'react-native';





const UserProfileScreen = () => {
  const [rutinas2, setRutinas] = useState([]);
  const route = useRoute();
  const { Datosusuario } = route.params;
  const [userData, setUserData] = useState([]); 
  const [isActive, setIsActive] = useState(Datosusuario.isActive);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    nombre: "Cargando...",
    apellido: "",
    rol: "Cargando...",
    email: "Cargando...",
    telefono: "Cargando...",
    edad: "",
    peso: "",
    altura: "",
    plan: "",
    fichaMedica: "",
    rutinas: [],
    avatar: "https://via.placeholder.com/150",
  });


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = Datosusuario.usuario
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${user}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }
        const data = await response.json();
        console.log(data);
        console.log("xflhjglksdjglksdjlgjsdkfklsdj")
        setUserData(data);
      } catch (error) {
        console.error('Error en fetchUserData:', error);
      }
    };
    
    fetchUserData();
  }, []);


  const updateIsActive = async (newStatus) => {
    setIsActive(newStatus);
  
    const updatedUserData = {
      ...user,
      isActive: newStatus,
    };
  
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${Datosusuario.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      });
  
      if (!response.ok) {
        throw new Error("Error al actualizar el estado del usuario");
      }
    } catch (error) {
      console.error("Error en updateIsActive:", error);
    }
  };

  const updateIsDelete = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${Datosusuario.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }
  
      // Suponiendo que la API devuelve el usuario actualizado o un estado de eliminación
      setIsActive(false);
      setUser(prevUser => ({ ...prevUser, isActive: false }));
  
    } catch (error) {
      console.error("Error en updateIsDelete:", error);
    }
  };

  useEffect(() => {
    const fetchRutinas = async () => {
      try {

        const user = await Datosusuario.usuario;
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/user/${user}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }
        const data = await response.json();
        const nombresRutinas = data.map(rutina => rutina.nombre);
        setRutinas(nombresRutinas);
        console.log(nombresRutinas)
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
      }
    };

    fetchRutinas();
  }, []);
  
  useEffect(() => {
    setUser(prevUser => ({
      ...prevUser,
      nombre: Datosusuario.nombre,
      apellido: Datosusuario.apellido,
      rol: Datosusuario.rol,
      email: Datosusuario.email,
      telefono: Datosusuario.telefono,
      edad: Datosusuario.edad,
      peso: Datosusuario.peso,
      altura: Datosusuario.altura,
      plan: Datosusuario.plan,
      fichaMedica: Datosusuario.fichaMedica,
      rutinas: rutinas2,  // Ahora sí se actualiza cuando rutinas2 cambie
      imageUrl: Datosusuario.imageUrl,
    }));
  }, [Datosusuario, rutinas2]);  // Añadimos rutinas2 a las dependencias
  
  console.log(Datosusuario)

  const handleBlock = () => updateIsDelete(false);
  const handleEnable = () => updateIsActive(true);
  
  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${Datosusuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      enviarActividad("Se Edito un Usuario");

      if (!response.ok) throw new Error("Error al actualizar los datos");
      setIsEditing(false);
    } catch (error) {
      console.error("Error en handleSave:", error);
    }
  };

  const saveUserData = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${Datosusuario.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los datos del usuario");
      }
      alert("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };


  const abrirWebWhatsApp = () => {
    Linking.openURL('https://web.whatsapp.com/');
  };

  return (
    <View style={styles.container}>
      {/* <Sidebar /> */}

      <View style={styles.contentContainer}>
        <Card style={styles.card}>
          <View style={styles.profileContainer}>
          <Image source={{ uri: Datosusuario.imageUrl }} style={styles.userImage} />
          <View style={styles.userInfo}>
              <Text style={styles.userName}>{`${userData.nombre} ${userData.apellido}`}</Text>
              {isEditing ? (
                <select
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                  style={styles.select}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="maestro">Maestro</option>
                </select>
              ) : (
                <Text style={styles.userRole}>{userData.role}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.searchButtonContainer} onPress={abrirWebWhatsApp}>
              <Image source={require('../assets/whatsapp.png')} style={styles.Icons} />
            </TouchableOpacity>

          </View>
        </Card>

        {/* Datos del Usuario */}
        <Card style={styles.card2}>
          <Card.Title title="Datos del Usuario" />
          <Card.Content style={styles.altoFlatList2}>
            <ScrollView style={styles.scrollView}>
              {isEditing ? (
                  <View style={styles.dataContainer}>
                    <View style={styles.row}><Text style={styles.label}>Edad:</Text><TextInput style={styles.input2} value={userData.edad} onChangeText={(text) => setUserData({ ...userData, edad: text })}/></View>
                    <View style={styles.row}><Text style={styles.label}>Peso:</Text><TextInput style={styles.input2} value={userData.peso} onChangeText={(text) => setUserData({ ...userData, peso: text })} /></View>
                    <View style={styles.row}><Text style={styles.label}>Altura:</Text><TextInput style={styles.input2} value={userData.altura} onChangeText={(text) => setUserData({ ...userData, altura: text })} /></View>
                    <View style={styles.row}><Text style={styles.label}>Tipo de Plan:</Text><TextInput style={styles.input2} value={userData.plan} onChangeText={(text) => setUserData({ ...userData, plan: text })} /></View>
                    <View style={styles.row}><Text style={styles.label}>Ficha Médica:</Text><TextInput style={styles.input2} value={userData.fichaMedica} onChangeText={(text) => setUserData({ ...userData, fichaMedica: text })} /></View>
                    <View style={styles.row}><Text style={styles.label}>Email:</Text><TextInput style={styles.input2} value={userData.email} onChangeText={(text) => setUserData({ ...userData, email: text })} /></View>
                    <View style={styles.row}><Text style={styles.label}>Teléfono:</Text><TextInput style={styles.input2} value={userData.telefono} onChangeText={(text) => setUserData({ ...userData, telefono: text })} /></View>
                  </View>
                ) : (
                  <View style={styles.dataContainer}>
                    <View style={styles.row}><Text style={styles.label}>Edad:</Text><Text style={styles.input}>{userData.edad}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Peso:</Text><Text style={styles.input}>{userData.peso}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Altura:</Text><Text style={styles.input}>{userData.altura}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Tipo de Plan:</Text><Text style={styles.input}>{userData.plan}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Ficha Médica:</Text><Text style={styles.input}>{userData.fichaMedica}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Email:</Text><Text style={styles.input}>{userData.email}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Teléfono:</Text><Text style={styles.input}>{userData.telefono}</Text></View>
                  </View>
                )}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Rutinas */}
        <Card style={styles.card}>
          <Card.Title title="Rutinas" />
          <Card.Content style={styles.altoFlatList}>
          <ScrollView style={styles.scrollView}>
            {user.rutinas.length > 0 ? (
              user.rutinas.map((rutina, index) => 
            
                <Text key={index} style={styles.dataText}>• {rutina}
                
                </Text>  
            )
          ) : (
            <Text style={styles.dataText}>No hay rutinas asignadas</Text>
          )}
          </ScrollView>
          </Card.Content>
        </Card>

        {/* Botones de Acción */}
        <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          icon={isEditing ? "content-save" : "pencil"} 
          onPress={isEditing ? handleSave : handleEdit}
          style={[styles.editButton, styles.buttonBase]}
        >
          {isEditing ? "Guardar" : "Editar"}
        </Button>

        {isActive ? (
          <Button 
            mode="contained" 
            icon="block-helper" 
            onPress={() => updateIsDelete(false)} 
            style={[styles.blockButton, styles.buttonBase]}
          >
            Bloquear
          </Button>
        ) : (
          <Button 
            mode="contained" 
            icon="check" 
            onPress={() => updateIsActive(true)} 
            style={[styles.enableButton, styles.buttonBase]}
          >
            Habilitar
          </Button>
        )}

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  select: {
    marginLeft: 5,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#FFF",
    color: "#333",
    width: 120,
    height: 35,
    textAlign: "center",
  },
  altoFlatList: {
    height: 200,
  },
  altoFlatList2: {
    height: 250,
  },
  scrollView: {
    maxHeight: 400,
    overflowY: 'auto', 
    backgroundColor: 'white', 
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: "#FFF",
    padding: 16,
  },
  card2: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: "#FFF",
    padding: 16,
    height: 330, // Altura específica solicitada
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
    width: 250,
    height: 90,
    justifyContent: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userRole: {
    fontSize: 16,
    color: "#757575",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",

  },
  editButton: {
    backgroundColor: "#607D8B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    height: 40,
  },
  blockButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    height: 40,
  },
  enableButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    height: 40,
  },

  buttonBase: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12, // espacio interno horizontal
    borderRadius: 5, // o el valor que estés usando
  },
  

  dataContainer: {
    paddingVertical: 4, // Reducido el padding vertical
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6, // Reducido el espacio entre filas (era 12)
    paddingVertical: 2, // Reducido el padding vertical (era 4)
  },
  label: {
    width: 120,
    fontSize: 14, // Reducido ligeramente el tamaño de fuente
    fontWeight: "600",
    color: "#555",
  },

  input: {
    flex: 1,
    fontSize: 14, // Reducido ligeramente el tamaño de fuente
    height: 36, // Altura ligeramente reducida (era 40)
    borderRadius: 6, // Bordes ligeramente menos redondeados
    paddingHorizontal: 10, // Padding horizontal reducido (era 12)
    paddingVertical: 6, // Padding vertical reducido (era 8)
    marginLeft: 8, // Margen izquierdo reducido (era 10)
  },

  input2: {
    flex: 1,
    fontSize: 14, // Reducido ligeramente el tamaño de fuente
    height: 36, // Altura ligeramente reducida (era 40)
    borderColor: "#BDBDBD",
    borderRadius: 6, // Bordes ligeramente menos redondeados
    paddingHorizontal: 10, // Padding horizontal reducido (era 12)
    backgroundColor: "#FFF",
    color: "#333",
    marginLeft: 8, // Margen izquierdo reducido (era 10)
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  Icons: {
    width: 60,
    height: 60,
  },
  searchButtonContainer: {
    marginLeft: 'auto',

},
});

export default UserProfileScreen;
