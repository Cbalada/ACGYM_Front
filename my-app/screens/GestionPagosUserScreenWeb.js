import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';
import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import Sidebar from './SidebarScreenWeb';
import { Picker } from '@react-native-picker/picker';
import { Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { enviarActividad } from '../screens/Historial2Screen'

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const GestionPagosUserScreenWeb = () => {
  const navigation = useNavigation();
  const [mes, setMes] = useState('');
  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const route = useRoute();
  const { datosusuario } = route.params;
  const [loading, setLoading] = useState(true);
  const [pagos, setpagos] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [hasClicked, setHasClicked] = useState(false);

  const handleDateChange = (event) => {
    setFecha(event.target.value);
  };

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        // setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/pago/pago/${datosusuario.id}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }
        const data = await response.json();
        setpagos(data);
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchRutinas();
  }, []);


  
  useEffect(() => {
    // Habilitar el botón solo si los campos están llenos y aún no se ha hecho clic
    setIsButtonDisabled(!(mes && fecha && monto) || hasClicked);
  }, [mes, fecha, monto, hasClicked]);
  
  const handleAccept = async () => {
    if (hasClicked) return; // Evitar múltiples clics
    
    setHasClicked(true); // Deshabilita el botón tras el primer clic
  
    try {
      const partes = fecha.split('-');
      const fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;
  
      const nuevoPagoData = {
        idUser: datosusuario.id,
        mes,
        fecha: fechaFormateada,
        monto,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPagoData),
      });
  
      if (!response.ok) throw new Error('Error en la solicitud');
  
      const data = await response.json();
      alert('Pago registrado correctamente');
      setpagos((prevPagos) => [...prevPagos, data]);
  
      // Limpiar los inputs y reactivar el botón
      setMes('');
      setFecha('');
      setMonto('');
      setHasClicked(false);
      enviarActividad("Cargo Pago");
    } catch (error) {
      console.error('Error al enviar el pago:', error);
      alert('Hubo un problema al registrar el pago');
      setHasClicked(false); // Reactivar el botón en caso de error
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/pago/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) throw new Error('Error al eliminar el pago');
  
      // Filtrar los pagos para eliminar el elemento eliminado
      setpagos((prevPagos) => prevPagos.filter((pago) => pago.id !== id));
      enviarActividad("Elimino Pago");

    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      alert('Hubo un problema al eliminar el pago');
    }
  };
  


  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        {/* <Sidebar /> */}
        <View style={styles.content}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarSection}>
              <Image source={{ uri: datosusuario.imageUrl }} style={styles.userImage} />
              <Text style={styles.profileText}>{datosusuario.nombre} {datosusuario.apellido}</Text>
            </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactText}>Información de contacto:</Text>
                  <Text style={styles.contactText}>Email: {datosusuario.email}</Text>
                  <Text style={styles.contactText}>Teléfono: {datosusuario.telefono}</Text>
                </View>


          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={[styles.column]}>
                <Text style={styles.headerText}>Mes</Text>
              </View>
              <View style={[styles.column]}>
                <Text style={styles.headerText}>Fecha</Text>
              </View>
              <View style={[styles.column]}>
                <Text style={styles.headerText}>Monto</Text>
              </View>
              <View style={[styles.columnAccion]}>
                <Text style={styles.headerText}>Acción</Text>
              </View>

            </View>
              {pagos.length > 10 ? (
                <FlatList
                  data={pagos}
                  style={styles.altoFlatList}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.row}>
                          <View style={[styles.column]}>
                            <Text style={styles.cell}>{item.mes}</Text>
                          </View>
                          <View style={[styles.column]}>
                            <Text style={styles.cell}>{item.fecha}</Text>
                          </View>
                          <View style={[styles.column]}>
                            <Text style={styles.cell}>{item.monto}</Text>
                          </View>
                          <View style={[styles.columnAccion]}>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                              <Image source={require('../assets/delete.png')} style={styles.Icons} />
                            </TouchableOpacity>
                          </View>
                        </View>
                    </ScrollView>
                  )}
                />

            ) : (

              <FlatList
                data={pagos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <View style={[styles.column]}>
                      <Text style={styles.cell}>{item.mes}</Text>
                    </View>
                    <View style={[styles.column]}>
                      <Text style={styles.cell}>{item.fecha}</Text>
                    </View>
                    <View style={[styles.column]}>
                      <Text style={styles.cell}>{item.monto}</Text>
                    </View>
                    <View style={[styles.columnAccion]}>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Image source={require('../assets/delete.png')} style={styles.Icons} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.titleText}>Cargar pago</Text>
            <View style={styles.inputRow}>
              <Picker
                selectedValue={mes}
                style={styles.input}
                onValueChange={(itemValue) => setMes(itemValue)}
              >
                {meses.map((m, index) => (
                  <Picker.Item key={index} label={m} value={m} />
                ))}
              </Picker>
              <View style={styles.input2}>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={fecha}
                    onChange={handleDateChange}
                    style={styles.input3}
                  />
                ) : (
                  <TextInput
                    style={styles.input3}
                    placeholder="Fecha"
                    value={fecha}
                    onChangeText={setFecha}
                  />
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Monto"
                value={monto}
                onChangeText={(text) => {
                  // Permitir solo números, coma, punto y símbolo $
                  const cleaned = text
                    .replace(/[^0-9.,$]/g, '')  // solo permite esos caracteres
                    .replace(/(\..*)\./g, '$1') // evita más de un punto decimal
                    .replace(/(,.*),/g, '$1');  // evita más de una coma decimal

                  setMonto(cleaned);
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={[styles.acceptButton, isButtonDisabled && { opacity: 0.5 }]} 
                onPress={handleAccept} 
                disabled={isButtonDisabled}
              >
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Icons: {
    width: 60,
    height: 60,
  },
  searchButtonContainer: {
    marginLeft: 'auto',

  },
  altoFlatList: {
    height: 300,
  },
  scrollView: {
    maxHeight: 400, // Se activa el scroll cuando hay más de 10 elementos
    overflowY: 'auto', // Habilita el desplazamiento solo en web
    backgroundColor: 'white', // Puedes cambiar el color si lo necesitas
  },
  container: { flex: 1, backgroundColor: '#fff' },
  mainContainer: { flex: 1, flexDirection: 'row' },
  content: { flex: 1, padding: 20 },
  profileContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 10, marginBottom: 10 },
  avatarSection: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'column', // Asegura que los elementos estén apilados verticalmente
  },
  
  userImage: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    marginBottom: 5, // Asegura un espacio entre la imagen y el texto
  },
  profileText: { fontSize: 16, fontWeight: 'bold', marginTop: 5, textAlign: 'center' },
  contactInfo: { flex: 1, paddingRight: 10, marginLeft: 50 },
  contactText: { fontSize: 12, color: '#666', lineHeight: 16 },
  inputContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginTop: 10 },
  titleText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  input: { width: 150 , flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, textAlign: 'center', marginHorizontal: 4 },
  input2: { width: 150 , flex: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, textAlign: 'center', marginHorizontal: 4 },
  input3: { flex: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, textAlign: 'center', marginHorizontal: 4 },
  acceptButton: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 5, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontWeight: 'bold' },
  tableContainer: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    padding: 8, 
    marginTop: 5,
    height: 350, 
  },
  tableHeader: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    paddingBottom: 5, 
    backgroundColor: '#f1f1f1', 
    paddingVertical: 8 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 6 
  },
  headerText: { 
    fontWeight: 'bold', 
    textAlign: 'center', // Asegura alineación central
    flex: 1, 
  },
  cell: { 
    textAlign: 'center', // Asegura que el contenido también esté centrado
    flex: 1, 
  },
  deleteButton: { 
    color: 'red', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  column: { flex: 1, textAlign: 'center' },
  columnAccion: { width: 70, alignItems: 'center' },
  verMasButton: {
    backgroundColor: '#A9A9A9', // Color gris
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  verMasButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  Icons: {
    width: 20,
    height: 20,
  },
  picker: { flex: 1, height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginHorizontal: 4 },
});

export default GestionPagosUserScreenWeb;
