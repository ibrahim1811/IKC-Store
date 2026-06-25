import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { saveFcmToken } from '../services/firebase';

GoogleSignin.configure({ webClientId: '508538629679-ju8433ihs1bguafuhn2su6ra9t1itnm1.apps.googleusercontent.com' });

async function registerFcm() {
  const status = await messaging().requestPermission();
  const granted =
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL;
  if (granted) {
    const token = await messaging().getToken();
    await saveFcmToken(token);
    await messaging().subscribeToTopic('updates');
  }
}

export default function ProfileScreen() {
  const [user, setUser] = useState(auth().currentUser);

  useEffect(() => {
    registerFcm().catch(() => {});
    return auth().onAuthStateChanged(u => setUser(u));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#07070F' }}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />
      {user ? <LoggedIn user={user} /> : <LoginForm />}
    </View>
  );
}

function LoggedIn({ user }: { user: { email: string | null; displayName: string | null } }) {
  const handleSignOut = async () => {
    await auth().signOut();
    try { await GoogleSignin.signOut(); } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
        </Text>
      </View>
      <Text style={styles.displayName}>{user.displayName ?? user.email}</Text>
      {user.displayName && user.email
        ? <Text style={styles.emailSub}>{user.email}</Text>
        : null}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleEmail = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await auth().signInWithEmailAndPassword(email, password);
      } else {
        await auth().createUserWithEmailAndPassword(email, password);
      }
    } catch {
      setError('E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(data?.idToken ?? '');
      await auth().signInWithCredential(credential);
    } catch {
      setError('Google girişi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.loginTitle}>
          {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
        </Text>
        <Text style={styles.loginSub}>IKC Store'a hoş geldin</Text>

        <TextInput
          placeholder="E-posta"
          placeholderTextColor="#5A5A78"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Şifre"
          placeholderTextColor="#5A5A78"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
          onPress={handleEmail}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.6 }]}
          onPress={handleGoogle}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.googleBtnText}>Google ile Giriş</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#07070F',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E3A',
    borderWidth: 2,
    borderColor: '#6366F1',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366F1',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F1FF',
    textAlign: 'center',
  },
  emailSub: {
    color: '#9090B0',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
    fontSize: 13,
  },
  signOutBtn: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(248,113,113,0.08)',
  },
  signOutText: { color: '#F87171', fontWeight: '700', fontSize: 15 },
  loginTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F1FF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  loginSub: {
    color: '#5A5A78',
    fontSize: 14,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#10101E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    fontSize: 15,
    color: '#F1F1FF',
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  googleBtn: {
    backgroundColor: '#10101E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  googleBtnText: { color: '#C4C4E0', fontWeight: '600', fontSize: 15 },
  switchText: {
    textAlign: 'center',
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
});
