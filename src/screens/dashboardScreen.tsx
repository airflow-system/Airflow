import React from 'react';
import { View, Text, Button, StyleSheet, PermissionsAndroid, Alert, Platform } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice.ts';
import { scheduleToAirport } from '../api';
import Geolocation from '@react-native-community/geolocation';

export default function DashboardScreen({ navigation }: any) {
  const truckId = '87e25afd-edfd-417b-a4d8-c13bdbd47da2';
  const driverId = '6fcfb5d8-5ff8-4dbc-b6a5-98793bf2c2de';
  const dispatch = useAppDispatch();

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Airflow Location Permission',
          message: 'Airflow needs access to your location to schedule a route.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.navigate('Login');
  };

  const handleGetRoute = async () => {
    console.log("Clicked");
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          console.log("📍 Actual Location:", latitude, longitude);
  
          try {
            const response = await scheduleToAirport(truckId, driverId, latitude, longitude);
            const trip = response.data;
            console.log(trip);
            navigation.navigate('Route', {
              tripId: trip.id,
              currentLocation: trip.currentLocation,
              // currentLocation:"32.9482,-96.7297",
              relevantLocation: trip.currentRoute.relevantLocation,
              encodedPolyline: trip.currentRoute.encodedPolyline,
            });            

          } catch (error: any) {
            Alert.alert('Error scheduling route', error.message);
          }
        },
        error => {
          Alert.alert('Location Error', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
  }
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Welcome, Driver</Text>
        <Button title="Get Route to Airport" onPress={handleGetRoute} />
        <Text style={styles.title}>Dashboard Screen</Text>
        <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
