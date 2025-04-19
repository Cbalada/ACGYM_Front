import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { API_CONFIG } from '../constants/config';
import { useMemo } from 'react';
import { Platform } from 'react-native';

const QuestionScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [isUsernameEntered, setIsUsernameEntered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [step, setStep] = useState(0);
  const [isPasswordScreen, setIsPasswordScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [preguntas, setPreguntas] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const questions = [
    { question: "¿Cuál es tu color favorito?", key: "pregunta1", options: ["Rojo", "Azul", "Verde", "Amarillo"] },
    { question: "¿Cuál es tu animal favorito?", key: "pregunta2", options: ["Perro", "Gato", "Pájaro", "Pez"] },
    { question: "¿Cuál es tu comida favorita?", key: "pregunta3", options: ["Pizza", "Hamburguesa", "Pasta", "Ensalada"] },
  ];

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userData, setUserData] = useState(null);

  const fetchUserData = async (user) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${user}`);
      if (!response.ok) {
        throw new Error('Nombre de usuario incorrecto');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  };

  const fetchPreguntas = async (user) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/preguntas/pregunta/${user}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  };

  const handleAccept = async () => {
    setErrorMessage('');
    setIsBlocked(false);

    const userData = await fetchUserData(username);
    if (userData) {
      const preguntasData = await fetchPreguntas(username);

      if (preguntasData && preguntasData.length > 0) {
        setPreguntas(preguntasData[0]);

        if (preguntasData[0].strikes >= 4) {
          setIsBlocked(true);
          return;
        }

        setIsUsernameEntered(true);
        setUserData(userData);
      } else {
        setErrorMessage('No se encontraron preguntas');
      }
    } else {
      setErrorMessage('Nombre de usuario incorrecto');
    }
  };

  const updateStrikes = async (id) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/preguntas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strikes: (preguntas.strikes || 0) + 1 }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar strikes');
      }

      const data = await response.json();
      console.log('Strikes actualizado:', data);
    } catch (error) {
      console.error('Error en updateStrikes:', error);
    }
  };

  const handleNext = async () => {
    if (preguntas && selectedOption !== preguntas[questionsWithAnswers[step].key]) {
      await updateStrikes(preguntas.id);
      Platform.OS === 'android' || Platform.OS === 'ios'
      ? navigation.navigate('Login')
        
      : navigation.navigate('LoginWeb');
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
      setSelectedOption(null);
    } else {
      setIsPasswordScreen(true);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('Por favor, ingrese ambas contraseñas.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!userData || !userData.id) {
      setErrorMessage('Error al obtener datos del usuario.');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contrasena: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la contraseña');
      }

      alert('Contraseña cambiada con éxito');
      Platform.OS === 'web' ? navigation.navigate('LoginWeb') : navigation.navigate('Login');
    } catch (error) {
      setErrorMessage('Hubo un error al cambiar la contraseña.');
    }
  };

  const questionsWithAnswers = useMemo(() => {
    if (!preguntas) return questions;
  
    return questions.map((q) => {
      const correctAnswer = preguntas[q.key]; // respuesta correcta
      const options = [...q.options]; // copia de opciones originales
  
      // índice aleatorio para reemplazar
      const randomIndex = Math.floor(Math.random() * options.length);
      options[randomIndex] = correctAnswer;
  
      return {
        ...q,
        options,
      };
    });
  }, [preguntas]);

  return (
    <View style={styles.container}>
      {!isUsernameEntered ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ingrese su nombre de usuario:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nombre de usuario"
          />
          <TouchableOpacity
            style={[styles.button, !username && styles.disabledButton]}
            onPress={handleAccept}
            disabled={!username}
          >
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
          {isBlocked && <Text style={styles.errorText}>Usuario bloqueado - contactar con un administrador</Text>}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      ) : isPasswordScreen ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cambiar contraseña</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Ingresar nueva contraseña"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Ingresar nuevamente la contraseña"
            secureTextEntry
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, (!newPassword || !confirmPassword || newPassword !== confirmPassword) && styles.disabledButton]}
              onPress={handlePasswordChange}
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Platform.OS === 'web'
                  ? navigation.navigate('LoginWeb')
                  : navigation.navigate('Login')
              }
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      ) : (
        <View>
          <Text style={styles.question}>{questions[step].question}</Text>
          {questionsWithAnswers[step].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.option, selectedOption === option && styles.selectedOption]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Atrás</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, !selectedOption && styles.disabledButton]}
              onPress={handleNext}
              disabled={!selectedOption}
            >
              <Text style={styles.buttonText}>{step < questions.length - 1 ? 'Siguiente' : 'Finalizar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  inputContainer: { alignItems: 'center' },
  label: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, width: '100%', marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: 'white', fontSize: 16 },
  disabledButton: { backgroundColor: '#cccccc' },
  question: { fontSize: 20, marginBottom: 10, textAlign: 'center' },
  option: { padding: 10, borderWidth: 1, marginVertical: 5, borderRadius: 5 },
  selectedOption: { backgroundColor: '#007bff', borderColor: '#0056b3' },
  optionText: { fontSize: 16, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  errorText: { color: 'red', marginTop: 10 },
});

export default QuestionScreen;
