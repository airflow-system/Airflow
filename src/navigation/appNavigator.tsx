import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/loginScreen.tsx';
import DashboardScreen from '../screens/dashboardScreen.tsx';
import RouteScreen from '../screens/routeScreen.tsx';
import { Text } from 'react-native-gesture-handler';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Route" component={RouteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
