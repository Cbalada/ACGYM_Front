import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import Input from '../components/common/Input';

const LoginScreen = ({ navigation }) => {
  const [credentials, setCredentials] = useState({ usuario: '', contrasena: '' });
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleLogin = async () => {
    const result = await authService.login(credentials.usuario, credentials.contrasena);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input
        placeholder="Username"
        value={credentials.usuario}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, usuario: text }))}
      />
      <Input
        placeholder="Password"
        secureTextEntry
        value={credentials.contrasena}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, contrasena: text }))}
      />
      <Button title="Login" onPress={handleLogin} />
      
      {/* Opción para registrarse */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>¿No tienes una cuenta? Regístrate aquí</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('PreguntasWeb')}>
        <Text style={{ color: 'blue' }}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'blue',
    fontSize: 16,
  },
});

export default LoginScreen;
