import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

const BottomNav = () => {
  const navigation = useNavigation();
  const { handleLogout } = useContext(AuthContext);

  const logout = async () => {
    await handleLogout(); // Actualiza el estado para que 'AppNavigator' redirija automáticamente.
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cargar')}>
        <Text style={styles.text}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
});

export default BottomNav;

