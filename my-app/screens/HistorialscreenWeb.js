import { DataTable } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, useWindowDimensions, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Sidebar from '../screens/SidebarScreenWeb';
import { API_CONFIG } from '../constants/config';

const UserHistoryScreen = () => {
  const [historial, setHistorial] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/historial`);
        if (!response.ok) throw new Error('Error al obtener datos del usuario');
        const data = await response.json();
        setHistorial(data);
      } catch (error) {
        console.error('Error en fetchHistorial:', error);
      }
    };
    fetchHistorial();
  }, []);

  const filteredHistorial = historial.filter(item =>
    item.actividad.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>


      <View style={[styles.mainContent, isWeb && styles.mainContentWeb]}>
        <Text style={styles.title}>Historial de Usuario</Text>

        <View style={styles.headerContainer}>
          {showSearch && (
            <TextInput
              style={[styles.searchInput, isWeb && styles.searchInputWeb]}
              placeholder="Buscar actividad..."
              value={search}
              onChangeText={setSearch}
              autoFocus
              placeholderTextColor="#666"
            />
          )}
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchButton}>
            <Image
              source={require("../assets/buscar.png")}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.tableScroll}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Usuario</DataTable.Title>
              <DataTable.Title>Fecha</DataTable.Title>
              <DataTable.Title>Actividad</DataTable.Title>
            </DataTable.Header>

            {filteredHistorial.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.idUser}</DataTable.Cell>
                <DataTable.Cell>{new Date(item.fecha).toLocaleDateString('es-ES')}</DataTable.Cell>
                <DataTable.Cell>{item.actividad}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebarContainer: {
    width: 250, // Ancho fijo para Sidebar
    backgroundColor: '#f0f0f0',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  mainContentWeb: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4B0082',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    fontSize: 16,
    marginRight: 10,
    color: '#333',
  },
  searchInputWeb: {
    maxWidth: 400,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4B0082',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableScroll: {
    flex: 1,
  },
});

export default UserHistoryScreen;
