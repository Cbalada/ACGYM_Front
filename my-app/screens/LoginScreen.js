import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity
} from 'react-native';
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
      <Text style={styles.header}>Bienvenido a ACGYM</Text>

      <Input
        placeholder="Username"
        value={credentials.usuario}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, usuario: text }))}
        style={styles.input}
      />
      <Input
        placeholder="Password"
        secureTextEntry
        value={credentials.contrasena}
        onChangeText={(text) => setCredentials(prev => ({ ...prev, contrasena: text }))}
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>¿No tienes una cuenta? Regístrate aquí</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('PreguntasWeb')}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 15,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#6A0DAD',
  },
  loginButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'blue',
    fontSize: 16,
  },
  forgotText: {
    marginTop: 10,
    textAlign: 'center',
    color: 'blue',
    fontSize: 16,
  },
});

export default LoginScreen;
