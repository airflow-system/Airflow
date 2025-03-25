import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function RouteScreen({ route, navigation }: any) {
  const {
    currentLocation,
    relevantLocation,
    encodedPolyline,
    estimatedArrivalTime,
    tripId,
    reservedParkingSlot,
    latestDaliAdvice,
  } = route.params;

  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasShownAdvice, setHasShownAdvice] = useState(false);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const decodePolyline = (encoded: string): LatLng[] => {
    let points: LatLng[] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const completeTrip = async () => {
    try {
      await axios.put(`http://192.168.10.196:8080/api/airFlow/completeTrip/${tripId}`);
      Alert.alert('Trip Completed');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to complete trip');
    }
  };

  useEffect(() => {
    if (encodedPolyline) {
      const points = decodePolyline(encodedPolyline);
      setRouteCoordinates(points);
    }

    // ✅ Show DALI advice only once
    if (latestDaliAdvice?.message && !hasShownAdvice) {
      Alert.alert('DALI Advice', latestDaliAdvice.message);
      setHasShownAdvice(true);
    }

    setLoading(false);
  }, [encodedPolyline]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* ETA Display */}
      {estimatedArrivalTime && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>ETA: {formatTime(estimatedArrivalTime)}</Text>
        </View>
      )}

      {/* Parking Info */}
      {reservedParkingSlot && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Reserved Slot: {reservedParkingSlot.slotId} at Gate {reservedParkingSlot.gateId}
          </Text>
        </View>
      )}

      {/* Map Rendering */}
      {routeCoordinates.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={currentLocation} title="Truck Start" />
          <Marker coordinate={relevantLocation} title="Airport Gate" />
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
        </MapView>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No route to display</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
  infoContainer: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   Button,
//   Platform,
// } from 'react-native';
// import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
// import axios from 'axios';

// const { width, height } = Dimensions.get('window');

// interface Props {
//   route: {
//     params: {
//       tripId: string;
//     };
//   };
//   navigation: any;
// }

// export default function RouteScreen({ route, navigation }: Props) {
//   const { tripId } = route.params;

//   const [trip, setTrip] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
//   const mapRef = useRef<MapView>(null);

//   const decodePolyline = (encoded: string): LatLng[] => {
//     let points: LatLng[] = [];
//     let index = 0, lat = 0, lng = 0;

//     while (index < encoded.length) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
//       lng += dlng;

//       points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
//     }

//     return points;
//   };

//   const fetchTrip = async () => {
//     try {
//       const response = await axios.get(`http://192.168.10.196:8080/api/airFlow/trip/${tripId}`);
//       const data = response.data;

//       setTrip(data);

//       if (data.currentRoute?.encodedPolyline) {
//         const points = decodePolyline(data.currentRoute.encodedPolyline);
//         setRouteCoordinates(points);

//         if (mapRef.current) {
//           mapRef.current.animateToRegion({
//             latitude: data.currentLocation.latitude,
//             longitude: data.currentLocation.longitude,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Trip fetch error:', error);
//       Alert.alert('Error', 'Unable to fetch trip details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const completeTrip = async () => {
//     try {
//       await axios.put(`http://192.168.10.196:8080/api/airFlow/completeTrip/${tripId}`);
//       Alert.alert('Trip completed!');
//       navigation.goBack();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to complete trip');
//     }
//   };

//   useEffect(() => {
//     fetchTrip(); // Initial fetch
//     const interval = setInterval(fetchTrip, 10000); // Every 10 seconds
//     return () => clearInterval(interval);
//   }, []);

//   if (loading || !trip) {
//     return <ActivityIndicator size="large" style={{ flex: 1 }} />;
//   }

//   const { currentLocation, currentRoute, estimatedArrivalTime, reservedParkingSlot, latestDaliAdvice } = trip;
//   const destination = currentRoute?.relevantLocation;

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={{
//           latitude: currentLocation.latitude,
//           longitude: currentLocation.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         <Marker coordinate={currentLocation} title="Current Location" />
//         {destination && <Marker coordinate={destination} title="Airport Gate" />}
//         <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
//       </MapView>

//       <View style={styles.infoContainer}>
//         <Text>🕒 ETA: {new Date(estimatedArrivalTime).toLocaleTimeString()}</Text>
//         {reservedParkingSlot?.reserved && (
//           <Text>🅿️ Reserved Slot: {reservedParkingSlot.slotId} at {reservedParkingSlot.gateId}</Text>
//         )}
//         {latestDaliAdvice?.message && (
//           <Text style={{ color: 'blue' }}>📣 DALI: {latestDaliAdvice.message}</Text>
//         )}
//         <Button title="Complete Trip" onPress={completeTrip} />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { width, height: height * 0.75 },
//   infoContainer: {
//     padding: 15,
//     backgroundColor: 'white',
//     elevation: 4,
//   },
// });


