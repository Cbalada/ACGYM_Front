import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

const ModalRutina = ({ visible, onClose, onAccept }) => {
    const [nombreRutina, setNombreRutina] = useState('');
    const [link, setLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    const enviarRutina = async () => {
      setIsLoading(true);
      try {
        const user = await storage.get(STORAGE_KEYS.USER);
        if (!user) throw new Error('Usuario no encontrado');
  
        const workoutData = await fetchWorkoutDataMultiDia(link);
        if (!workoutData.Dias) throw new Error('No se pudieron obtener los días de la rutina');
  
        // Crear rutina principal
        const responseRutina = await fetch(`${API_CONFIG.BASE_URL}/rutinas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: nombreRutina,
            idUser: user,
            activa: true
          }),
        });
  
        if (!responseRutina.ok) throw new Error(`Error al enviar la rutina: ${responseRutina.status}`);
        const rutinaCreada = await responseRutina.json();
  
        // Procesar días y ejercicios
        for (const [nombreDia, diaData] of Object.entries(workoutData.Dias)) {
          if (diaData.Ejercicios?.length > 0) {
            // Crear día
            const responseDia = await fetch(`${API_CONFIG.BASE_URL}/dias`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                nombre: nombreDia,
                idRutina: rutinaCreada.id,
              }),
            });
  
            if (!responseDia.ok) continue;
            const diaCreado = await responseDia.json();
  
            // Crear ejercicios y notas
            for (const ejercicio of diaData.Ejercicios) {
              try {
                const responseEjercicio = await fetch(`${API_CONFIG.BASE_URL}/ejercicios`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    nombre: ejercicio.Nombre,
                    series: ejercicio.Series,
                    repeticiones: ejercicio.Repeticiones,
                    idDia: diaCreado.id,
                  }),
                });
  
                if (!responseEjercicio.ok) continue;
                const ejercicioCreado = await responseEjercicio.json();
  
                await fetch(`${API_CONFIG.BASE_URL}/notas`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    descripcion: 'sin descripcion',
                    serie: ejercicio.Series,
                    repeticion: ejercicio.Repeticiones,
                    kilo: '0',
                    idEjercicio: ejercicioCreado.id,
                  }),
                });
              } catch (error) {
                console.error(`Error con ejercicio ${ejercicio.Nombre}:`, error);
              }
            }
          }
        }
  
        return rutinaCreada;
      } finally {
        setIsLoading(false);
      }
    };

const handleCancelar = () => {
    setNombreRutina('');
    setLink('');
    onClose();
    };

  const fetchWorkoutDataMultiDia = async (originalUrl) => {
    try {
      // 📌 Extraemos el ID y el GID del link original
      const sheetIdMatch = originalUrl.match(/\/d\/([a-zA-Z0-9-_]+)\//);
      const gidMatch = originalUrl.match(/gid=([0-9]+)/);
  
      if (!sheetIdMatch || !gidMatch) throw new Error('URL de Google Sheets no válida');
  
      const sheetId = sheetIdMatch[1];
      const gid = gidMatch[1];
  
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  
      const csv = await response.text();
      const rows = csv.trim().split('\n').map((row) => row.split(','));
  
      const diasConfig = [
        { nombreFila: 3, inicio: 7, fin: 15 },
        { nombreFila: 17, inicio: 21, fin: 29 },
        { nombreFila: 31, inicio: 35, fin: 43 },
        { nombreFila: 45, inicio: 49, fin: 57 },
        { nombreFila: 59, inicio: 63, fin: 71 }
      ];
  
      const Dias = {};
  
      diasConfig.forEach(({ nombreFila, inicio, fin }) => {
        if (!rows[nombreFila] || !rows[nombreFila][6]) return;
  
        const nombreDia = rows[nombreFila][6];
        const ejercicios = [];
  
        for (let i = inicio; i <= fin; i++) {
          if (!rows[i] || !rows[i][6]) continue;
  
          const nombre = rows[i][6];
          const series = rows[i][8];
          const repeticiones = rows[i][9];
  
          ejercicios.push({
            Nombre: nombre,
            Series: series,
            Repeticiones: repeticiones
          });
        }
  
        Dias[nombreDia] = { Ejercicios: ejercicios };
      });
  
      const result = { Dias };
      console.log('✅ Resultado final:', JSON.stringify(result, null, 2));
      return result;
  
    } catch (error) {
      console.error('❌ Error al obtener los datos:', error.message);
      return { error: 'No se pudo obtener los datos correctamente' };
    }
  };
  
  
  const handleAceptar = async () => {
    try {
      const rutinaCreada = await enviarRutina();
      
      // Primero cerramos el modal
      onClose();
      setNombreRutina('');
      setLink('');
      
      // Luego mostramos el alert
      Alert.alert(
        'Éxito', 
        'Rutina creada correctamente',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              onAccept({ nombreRutina, link, idRutina: rutinaCreada.id });
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la rutina');
      console.error('Error al crear rutina:', error);
    }
  };


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Nueva Rutina</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la rutina"
            value={nombreRutina}
            onChangeText={setNombreRutina}
          />
          <TextInput
            style={styles.input}
            placeholder="Link"
            value={link}
            onChangeText={setLink}
          />
          
          {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancelar}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.disabledButton]} 
              onPress={handleAceptar}
              disabled={!nombreRutina || isLoading}
            >
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  loader: {
    marginVertical: 10,
  },
});

export default ModalRutina;