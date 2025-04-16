import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

const LoginScreenWeb = () => {
  const [credentials, setCredentials] = useState({ usuario: '', contrasena: '' });
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    const result = await authService.login(credentials.usuario, credentials.contrasena);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      alert('Error: ' + result.message);
    }
  };
  return (
    <View style={styles.container}>

      <View style={styles.imageContainer}>
        <Image source={require('../assets/ChatGPT Image 13 abr 2025, 05_14_41 p.m..png')} style={styles.gymImage} />
      </View>


      {/* Formulario */}
      <View style={styles.formWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>¡Bienvenido a ACGYM!</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="#888"
            value={credentials.usuario}
            onChangeText={(text) => setCredentials((prev) => ({ ...prev, usuario: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={credentials.contrasena}
            onChangeText={(text) => setCredentials((prev) => ({ ...prev, contrasena: text }))}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PreguntasWeb')} style={{ marginTop: 20 }}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  gymImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#4B0082',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default LoginScreenWeb;
