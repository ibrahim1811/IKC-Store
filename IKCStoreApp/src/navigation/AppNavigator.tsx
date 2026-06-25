import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import InstalledAppsScreen from '../screens/InstalledAppsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AppDetailScreen from '../screens/AppDetailScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: '⊞',
  Favorites: '♥',
  InstalledApps: '↓',
  Profile: '◯',
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.45, color: focused ? '#6366F1' : '#9090B0' }}>
      {TAB_ICONS[label]}
    </Text>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#5A5A78',
        tabBarStyle: {
          backgroundColor: '#10101E',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.07)',
          height: Platform.OS === 'android' ? 60 : 80,
          paddingBottom: Platform.OS === 'android' ? 8 : 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#07070F' },
        headerTintColor: '#F1F1FF',
        headerTitleStyle: { fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'IKC Store', tabBarLabel: 'Mağaza' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoriler', tabBarLabel: 'Favoriler' }} />
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
        <Stack.Screen
          name="AppDetail"
          component={AppDetailScreen}
          options={{
            title: '',
            headerStyle: { backgroundColor: '#07070F' },
            headerTintColor: '#F1F1FF',
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
