import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/UserContext';
import { ColorsProvider } from './contexts/ColorContext';
import MainNavigator from './ui/tabs/MainNavigator';
import LoginScreen from './ui/login/LoginScreen';
import RegisterScreen from './ui/login/RegisterScreen';
// import LoadingScreen from './ui/Login/LoadingScreen';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Text>waiting...</Text>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? ( // if user is logged in: show the main navigator; if not: show the login and register screens
          <Stack.Screen name="Main" component={MainNavigator} />
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
      <ColorsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ColorsProvider>
    </SafeAreaProvider>
  );
};

export default App;
