import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import InstalledAppsScreen from '../screens/InstalledAppsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AppDetailScreen from '../screens/AppDetailScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = { Home: '🏠', InstalledApps: '📱', Profile: '👤' };
  return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[label]}</Text>;
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Mağaza', tabBarLabel: 'Mağaza' }} />
      <Tab.Screen name="InstalledApps" component={InstalledAppsScreen} options={{ title: 'Yüklü', tabBarLabel: 'Yüklü' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil', tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AppDetail" component={AppDetailScreen} options={{ title: 'Uygulama Detayı', headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
