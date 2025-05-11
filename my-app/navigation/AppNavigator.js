import React, { useContext, useEffect } from 'react';
import { Platform, BackHandler } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

// Importación de pantallas
import LoginScreen from '../screens/LoginScreen';
import LoginScreenWeb from '../screens/LoginScreenWeb';
import RegisterScreen from '../screens/Register';
import HomeScreen from '../screens/HomeScreen';
import RutinaScreen from '../screens/Rutinascreen';
import DiaScreen from '../screens/Diascreen';
import EjercicioScreen from '../screens/Ejerciciosscreen';
import ExerciseCard from '../screens/Mustraejercicio';
import RoutineScreen from '../screens/Crearrutinascreen';
import CrearDiasScreen from '../screens/Creardiasreen';
import ExerciseScreen from '../screens/Crearejercicioscreen';
import FavoritosScreen from '../screens/Favoritoscreen';
import PapeleraScreen from '../screens/Papelerascreen';
import EjercicioEstadisticaScreen from '../screens/EjercicioEstadisticaScreen';
import MuestraEjercicioEstadisticaSc from '../screens/MuestraEjercicioEstadisticaSc';
import UserProfile from '../screens/Perfildeusuarioscreen';
import HomeScreenWeb from '../screens/HomeScreenWeb';
import GestionDeRutinaScreenWeb from '../screens/GestionDeRutinasWeb';
import GestionDeDiaScreenWeb from '../screens/GestionDeDiaWeb';
import GestionDeEjercicioScreenWeb from '../screens/GestionDeEjercicioWeb';
import GestionpagoScreenWeb from '../screens/GestionpagosScreenweb';
import UserProfileScreen from '../screens/GestionRolesScreenWeb';
import GestionPagosUserScreenWeb from '../screens/GestionPagosUserScreenWeb';
import UserHistoryScreen from '../screens/HistorialscreenWeb';
import GestionRoles2ScreenWeb from '../screens/Gestionroles2Screen';
import RutinaScreenWeb from '../screens/RutinaScreenWeb';
import PapeleraScreenWeb from '../screens/PapeleraScreenWeb';
import EditarRutinaScreenWeb from '../screens/EditarRutinaScreenWeb';
import PreguntasScreenWeb from '../screens/PreguntasScreenWeb';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const bloquearRetroceso = () => true;
    BackHandler.addEventListener('hardwareBackPress', bloquearRetroceso);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', bloquearRetroceso);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          isAuthenticated
            ? Platform.OS === 'web'
              ? 'HomeWeb'
              : 'Home'
            : Platform.OS === 'web'
              ? 'LoginWeb'
              : 'Login'
        }
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          headerLeft: () => null,
        }}
      >
        {isAuthenticated ? (
          <>
            {Platform.OS === 'web' ? (
              <Stack.Screen name="HomeWeb" component={HomeScreenWeb} />
            ) : (
              <Stack.Screen name="Home" component={HomeScreen} />
            )}

            {/* Pantallas para usuarios autenticados */}
            <Stack.Screen name="GestionDeRutinaWeb" component={GestionDeRutinaScreenWeb} />
            <Stack.Screen name="GestionDeDiaWeb" component={GestionDeDiaScreenWeb} />
            <Stack.Screen name="GestionDeEjercicioWeb" component={GestionDeEjercicioScreenWeb} />
            <Stack.Screen name="GestionpagoWeb" component={GestionpagoScreenWeb} />
            <Stack.Screen name="GestionPagoUserWeb" component={GestionPagosUserScreenWeb} />
            <Stack.Screen name="GestionRolesWeb" component={UserProfileScreen} />
            <Stack.Screen name="HistorialscreenWeb" component={UserHistoryScreen} />
            <Stack.Screen name="Gestionroles2ScreenWeb" component={GestionRoles2ScreenWeb} />
            <Stack.Screen name="RutinaWeb" component={RutinaScreenWeb} />
            <Stack.Screen name="PapeleraWeb" component={PapeleraScreenWeb} />
            <Stack.Screen name="EditarRutinaWeb" component={EditarRutinaScreenWeb} />

            <Stack.Screen name="Rutina" component={RutinaScreen} />
            <Stack.Screen name="Dia" component={DiaScreen} />
            <Stack.Screen name="Ejercicio" component={EjercicioScreen} />
            <Stack.Screen name="Mustraejercicio" component={ExerciseCard} />
            <Stack.Screen name="Crearrutinascreen" component={RoutineScreen} />
            <Stack.Screen name="CrearDiascreen" component={CrearDiasScreen} />
            <Stack.Screen name="Crearejercicioscreen" component={ExerciseScreen} />
            <Stack.Screen name="favoritos" component={FavoritosScreen} />
            <Stack.Screen name="Papelera" component={PapeleraScreen} />
            <Stack.Screen name="EjercicioEstadistica" component={EjercicioEstadisticaScreen} />
            <Stack.Screen name="MuestraEjercicioEstadistica" component={MuestraEjercicioEstadisticaSc} />
            <Stack.Screen name="PerfildeUsuario" component={UserProfile} />
          </>
        ) : (
          <>
            {Platform.OS === 'web' ? (
              <Stack.Screen name="LoginWeb" component={LoginScreenWeb} />
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PreguntasWeb" component={PreguntasScreenWeb} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
