// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
// import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
// import axios from 'axios';

// const { width, height } = Dimensions.get('window');

// export default function RouteScreen({ route }: any) {
//   const { currentLocation, relevantLocation, encodedPolyline } = route.params;
//   const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
//   const [loading, setLoading] = useState(true);

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

//   const fetchRoute = async () => {
//     // const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
//     // const destination = `${relevantLocation.latitude},${relevantLocation.longitude}`;
//     // // const origin = "32.9515,-96.8235";
//     // // const destination = "32.9251,-96.8335";
//     // const apiKey = 'AIzaSyAwAh3PYfuxInElnoaAl0XSd85Nmy4itU4' // 🔁 Replace with your real key

//     // try {
//     //   const res = await axios.get(
//     //     `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
//     //   );
//     //   console.log('Directions API response:', res.data);
//     //   const routes = res.data.routes;
//     //   if (routes && routes.length > 0 && routes[0].overview_polyline) {
//     //   const points = decodePolyline(res.data.routes[0].overview_polyline.points);
//     //   setRouteCoordinates(points);
//     //   }
//     // } catch (err) {
//     //   console.error('Error fetching route:', err);
//     // } finally {
//     //   setLoading(false);
//     // }

//     useEffect(() => {
//       if (encodedPolyline) {
//         const points = decodePolyline(encodedPolyline);
//         setRouteCoordinates(points);
//         setLoading(false);
//       } else {
//         console.warn("No encoded polyline provided from backend");
//         setLoading(false);
//       }
//     }, []);
//   };

//   useEffect(() => {
//     fetchRoute();
//   }, []);

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: currentLocation.latitude,
//             longitude: currentLocation.longitude,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//         >
//           <Marker coordinate={currentLocation} title="Truck Start" />
//           <Marker coordinate={relevantLocation} title="Airport Gate" />
//           <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
//         </MapView>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { width, height },
// });
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function RouteScreen({ route }: any) {
  const { currentLocation, relevantLocation, encodedPolyline } = route.params;
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (encodedPolyline) {
      const points = decodePolyline(encodedPolyline);
      setRouteCoordinates(points);
      setLoading(false);
    }
    
  }, [encodedPolyline]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
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
});
