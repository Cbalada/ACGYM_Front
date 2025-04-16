import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import AppWebLayout from './screens/AppWebLayout';


export default function App() {
  if (Platform.OS === 'web') {
    return (
      <AuthProvider>
        <NavigationContainer>
          <AppWebLayout />
        </NavigationContainer>
      </AuthProvider>
    );
  }
  
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// export default function App() {
//   return (
//     <AuthProvider>
//       <NavigationContainer>
//         <AppWebLayout /> 
//       </NavigationContainer>
//     </AuthProvider>
    
//   );
// }
