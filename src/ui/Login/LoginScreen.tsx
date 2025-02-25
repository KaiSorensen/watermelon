import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { loginWithEmail, loginWithGoogle, getUserData } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import { auth } from '../../firebase';


// You'll need to set up Firebase auth
// import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const { setCurrentUser } = useAuth();
  
  const isDarkMode = useColorScheme() === 'dark';
  
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await loginWithEmail(email, password);
      const userData = await getUserData(userCredential.user.uid);
      if (userData) {
        // setCurrentUser(userData);
      }
      // Navigation will be handled by the auth state listener
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { idToken } = (await GoogleSignin.signIn()).data ?? { idToken: null };
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign In');
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      // Navigation will be handled by the auth state listener
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {
      backgroundColor: isDarkMode ? '#121212' : '#F5F5F5'
    }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            {/* <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            /> */}
            <Text style={[styles.appName, {
              color: isDarkMode ? '#FFFFFF' : '#333333'
            }]}>
              Of The Day
            </Text>
            <Text style={[styles.tagline, {
              color: isDarkMode ? '#CCCCCC' : '#666666'
            }]}>
              Don't kill yourself you're too pretty.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                color: isDarkMode ? '#FFFFFF' : '#333333',
                borderColor: isDarkMode ? '#444444' : '#DDDDDD'
              }]}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, {
                backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                color: isDarkMode ? '#FFFFFF' : '#333333',
                borderColor: isDarkMode ? '#444444' : '#DDDDDD'
              }]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.loginButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Login with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPasswordText, {
                color: isDarkMode ? '#AAAAAA' : '#666666'
              }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.noAccountText, {
              color: isDarkMode ? '#CCCCCC' : '#666666'
            }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4A6FFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 14,
    marginRight: 5,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6FFF',
  },
});

export default LoginScreen; 