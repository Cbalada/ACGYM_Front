import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, TextInput } from 'react-native';
import Collapsible from 'react-native-collapsible';
import Sidebar from '../screens/SidebarScreenWeb';
import { useRoute } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';

const RutinaScreenWeb = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const route = useRoute();
  const { DatoRutina } = route.params;
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState([]);
  const [ejercicios, setEjercicios] = useState({});
  const [notas, setNotas] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    rutinaNombre: '',
    dias: {},
    ejercicios: {},
    notas: {}
  });

  const toggleAccordion = async (index, dayId) => {
    setActiveIndex(activeIndex === index ? null : index);
    if (!ejercicios[dayId]) {
      await fetchEjercicios(dayId);
    }
  };

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${DatoRutina}`);
        if (!response.ok) {
          throw new Error('Error al obtener rutinas');
        }
        const data = await response.json();
        setRutinas(data);
        setEditedData(prev => ({
          ...prev,
          rutinaNombre: data.nombre
        }));
      } catch (error) {
        console.error('Error en fetchRutinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, []);

  useEffect(() => {
    const fetchDias = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${DatoRutina}`);
        if (!response.ok) {
          throw new Error('Error al obtener dias');
        }
        const data = await response.json();
        setDias(data);
        
        // Inicializar datos editables para días
        const diasEditables = {};
        data.forEach(day => {
          diasEditables[day.id] = day.nombre;
        });
        setEditedData(prev => ({
          ...prev,
          dias: diasEditables
        }));
      } catch (error) {
        console.error('Error en fetchDias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDias();
  }, []);

  const fetchEjercicios = async (idDia) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/ejercicios/dia/${idDia}`);
      if (!response.ok) {
        throw new Error('Error al obtener ejercicios');
      }
      const data2 = await response.json();
      const data = data2.map((ejercicio) => ({
        ...ejercicio,
        imageUrl: `https://storage.googleapis.com/gim-image/uploads/${ejercicio.id}.jpg`,
      }));
      setEjercicios(prev => ({ ...prev, [idDia]: data }));
      
      // Inicializar datos editables para ejercicios y notas
      const ejerciciosEditables = { ...editedData.ejercicios };
      const notasEditables = { ...editedData.notas };
      
      data.forEach(ejercicio => {
        ejerciciosEditables[ejercicio.id] = ejercicio.nombre;
        fetchNotas(ejercicio.id, notasEditables);
      });
      
      setEditedData(prev => ({
        ...prev,
        ejercicios: ejerciciosEditables,
        notas: notasEditables
      }));
      
    } catch (error) {
      console.error('Error en fetchEjercicios:', error);
    }
  };

  const fetchNotas = async (idEjercicio, notasEditables = {}) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/notas/ejercicio/${idEjercicio}`);
      if (!response.ok) {
        throw new Error('Error al obtener notas');
      }
      const data = await response.json();
      setNotas(prev => ({ ...prev, [idEjercicio]: data }));
      
      // Inicializar datos editables para notas
      if (!notasEditables[idEjercicio]) {
        notasEditables[idEjercicio] = {};
      }
      
      data.forEach(nota => {
        notasEditables[idEjercicio][nota.id] = {
          serie: nota.serie,
          repeticion: nota.repeticion
        };
      });
      
    } catch (error) {
      console.error('Error en fetchNotas:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Guardar nombre de la rutina
      if (editedData.rutinaNombre !== rutinas.nombre) {
        await fetch(`${API_CONFIG.BASE_URL}/rutinas/${DatoRutina}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: editedData.rutinaNombre,
            idUser: rutinas.idUser, // Mantener los valores originales
            activa: rutinas.activa,
            favorita: rutinas.favorita
          })
        });
      }
  
      // Guardar nombres de días
      for (const day of dias) {
        if (editedData.dias[day.id] && editedData.dias[day.id] !== day.nombre) {
          await fetch(`${API_CONFIG.BASE_URL}/dias/${day.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nombre: editedData.dias[day.id],
              idRutina: day.idRutina // Mantener el valor original
            })
          });
        }
      }
  
      // Guardar nombres de ejercicios
      for (const day of dias) {
        if (ejercicios[day.id]) {
          for (const ejercicio of ejercicios[day.id]) {
            if (editedData.ejercicios[ejercicio.id] && editedData.ejercicios[ejercicio.id] !== ejercicio.nombre) {
              await fetch(`${API_CONFIG.BASE_URL}/ejercicios/${ejercicio.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  nombre: editedData.ejercicios[ejercicio.id]
                })
              });
            }
          }
        }
      }
  
      // Guardar notas (series y repeticiones)
      for (const day of dias) {
        if (ejercicios[day.id]) {
          for (const ejercicio of ejercicios[day.id]) {
            if (notas[ejercicio.id]) {
              for (const nota of notas[ejercicio.id]) {
                const editedNota = editedData.notas[ejercicio.id]?.[nota.id];
                if (editedNota && 
                    (editedNota.serie !== nota.serie || editedNota.repeticion !== nota.repeticion)) {
                  await fetch(`${API_CONFIG.BASE_URL}/notas/${nota.id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      descripcion: nota.descripcion || "", // Mantener el valor original
                      serie: editedNota.serie,
                      repeticion: editedNota.repeticion,
                      kilo: nota.kilo || "" // Mantener el valor original
                    })
                  });
                }
              }
            }
          }
        }
      }
  
      // Actualizar la UI con los nuevos datos
      const rutinaResponse = await fetch(`${API_CONFIG.BASE_URL}/rutinas/${DatoRutina}`);
      const rutinaData = await rutinaResponse.json();
      setRutinas(rutinaData);
  
      const diasResponse = await fetch(`${API_CONFIG.BASE_URL}/dias/rutina/${DatoRutina}`);
      const diasData = await diasResponse.json();
      setDias(diasData);
  
      // Limpiar el cache de ejercicios para forzar recarga
      setEjercicios({});
      setNotas({});
  
      setIsEditing(false);
      alert("Cambios guardados exitosamente!");
  
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert("Ocurrió un error al guardar los cambios");
    }
  };

  const handleRutinaNombreChange = (text) => {
    setEditedData(prev => ({
      ...prev,
      rutinaNombre: text
    }));
  };

  const handleDiaNombreChange = (idDia, text) => {
    setEditedData(prev => ({
      ...prev,
      dias: {
        ...prev.dias,
        [idDia]: text
      }
    }));
  };

  const handleEjercicioNombreChange = (idEjercicio, text) => {
    setEditedData(prev => ({
      ...prev,
      ejercicios: {
        ...prev.ejercicios,
        [idEjercicio]: text
      }
    }));
  };

  const handleNotaChange = (idEjercicio, idNota, field, value) => {
    setEditedData(prev => ({
      ...prev,
      notas: {
        ...prev.notas,
        [idEjercicio]: {
          ...prev.notas[idEjercicio],
          [idNota]: {
            ...prev.notas[idEjercicio]?.[idNota],
            [field]: value
          }
        }
      }
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Sidebar /> */}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {isEditing ? (
            <TextInput
              style={[styles.title, styles.editInput]}
              value={editedData.rutinaNombre}
              onChangeText={handleRutinaNombreChange}
            />
          ) : (
            <Text style={styles.title}>{rutinas.nombre}</Text>
          )}
          
          <TouchableOpacity style={styles.button} onPress={isEditing ? handleSave : handleEdit}>
            <Text style={styles.buttonText}>{isEditing ? 'Guardar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        
        {dias.map((day, index) => (
          <View key={day.id}>
            <TouchableOpacity style={styles.dayContainer} onPress={() => toggleAccordion(index, day.id)}>
              {isEditing ? (
                <TextInput
                  style={[styles.dayText, styles.editInput]}
                  value={editedData.dias[day.id] || ''}
                  onChangeText={(text) => handleDiaNombreChange(day.id, text)}
                />
              ) : (
                <Text style={styles.dayText}>{day.nombre}</Text>
              )}
            </TouchableOpacity>
            
            <Collapsible collapsed={activeIndex !== index}>
              <View style={styles.exerciseContainer}>
                <FlatList
                  data={ejercicios[day.id] || []}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.exerciseRow}>
                      <Image source={{ uri: item.imageUrl }} style={styles.userImage} />
                      
                      {isEditing ? (
                        <TextInput
                          style={[styles.exerciseText, styles.editInput]}
                          value={editedData.ejercicios[item.id] || ''}
                          onChangeText={(text) => handleEjercicioNombreChange(item.id, text)}
                        />
                      ) : (
                        <Text style={styles.exerciseText}>{item.nombre}</Text>
                      )}
                      
                      {notas[item.id]?.map(nota => (
                        isEditing ? (
                          <View key={nota.id} style={styles.notaContainer}>
                            <TextInput
                              style={[styles.exerciseText, styles.editInput]}
                              value={editedData.notas[item.id]?.[nota.id]?.serie?.toString() || ''}
                              onChangeText={(text) => handleNotaChange(item.id, nota.id, 'serie', text)}
                              keyboardType="numeric"
                              placeholder="Series"
                            />
                            <TextInput
                              style={[styles.exerciseText, styles.editInput]}
                              value={editedData.notas[item.id]?.[nota.id]?.repeticion?.toString() || ''}
                              onChangeText={(text) => handleNotaChange(item.id, nota.id, 'repeticion', text)}
                              keyboardType="numeric"
                              placeholder="Repeticiones"
                            />
                          </View>
                        ) : (
                          <View key={nota.id} style={styles.notaContainer}>
                            <Text style={styles.exerciseText}>Series: {nota.serie}</Text>
                            <Text style={styles.exerciseText}>Reps: {nota.repeticion}</Text>
                          </View>
                        )
                      ))}
                    </View>
                  )}
                />
              </View>
            </Collapsible>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#3D1C56',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end', // Alinea el botón a la derecha
    minWidth: 80, // Ancho mínimo para mantener consistencia
  },

  container: {
    flex: 1,
    padding: 20,
  },
  safeArea: {
    flex: 1,
    flexDirection: 'row',
  },

  dayContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#D3D3D3', 
    padding: 10, 
    marginBottom: 5 
  },
  icon: { 
    width: 20, 
    height: 20, 
    marginRight: 10, 
    backgroundColor: 'black' 
  },

  exerciseContainer: { 
    backgroundColor: '#90EE90', 
    padding: 10 
  },
  exerciseRow: { 
    flexDirection: 'row',
    alignItems: 'center', 
    paddingVertical: 5 
  },

  userImage: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 10
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(61, 28, 86, 0.3)', // Color con transparencia
    padding: 0,
    includeFontPadding: false,
  },

  title: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    fontStyle: 'italic', 
    color: '#3D1C56',
    flex: 1,
    marginRight: 10,
  },
  dayText: { 
    fontSize: 25 
  },
  notaContainer: {
    flexDirection: 'row',
    marginRight: 10,
    alignItems: 'center',
  },
  notaView: {
    flexDirection: 'row',
    marginRight: 10,
    alignItems: 'center',
  },
  notaText: {
    fontSize: 16,
    marginRight: 15,
    color: '#3D1C56',
  },
  exerciseText: { 
    flex: 1, 
    fontSize: 20,
    marginRight: 10
  },
});

export default RutinaScreenWeb;