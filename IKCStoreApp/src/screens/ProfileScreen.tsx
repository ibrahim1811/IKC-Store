import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Web client ID — Firebase console'dan alınacak
GoogleSignin.configure({ webClientId: '508538629679-ju8433ihs1bguafuhn2su6ra9t1itnm1.apps.googleusercontent.com' });

export default function ProfileScreen() {
  const user = auth().currentUser;

  if (user) return <LoggedIn user={user} />;
  return <LoginForm />;
}

function LoggedIn({ user }: { user: { email: string | null; displayName: string | null } }) {
  const handleSignOut = async () => {
    await auth().signOut();
    try { await GoogleSignin.signOut(); } catch {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesabım</Text>
      <Text style={styles.email}>{user.displayName ?? user.email}</Text>
      {user.email && <Text style={styles.sub}>{user.email}</Text>}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
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
      setError('Giriş başarısız. Bilgileri kontrol et.');
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
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Şifre" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleEmail} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={loading}>
        <Text style={styles.googleBtnText}>Google ile Giriş</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.switchText}>
          {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Hesabın var mı? Giriş yap'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 24, textAlign: 'center' },
  email: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#111' },
  sub: { color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15, backgroundColor: '#fff' },
  error: { color: '#ef4444', marginBottom: 8, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  googleBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 16 },
  googleBtnText: { color: '#374151', fontWeight: '600' },
  signOutBtn: { marginTop: 32, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, alignItems: 'center' },
  signOutText: { color: '#ef4444', fontWeight: '600' },
  switchText: { textAlign: 'center', color: '#4f46e5', fontWeight: '600' },
});
