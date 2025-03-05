

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/UserContext';
import MainNavigator from './ui/Tabs/MainNavigator';
import LoginScreen from './ui/Login/LoginScreen';
import RegisterScreen from './ui/Login/RegisterScreen';
import TestLoginScreen from './ui/Login/TestLoginScreen';
// import LoadingScreen from './ui/Login/LoadingScreen';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <>waiting...</>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? ( // if user is logged in: show the main navigator; if not: show the login and register screens
          <Stack.Screen name="Main" component={TestLoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
