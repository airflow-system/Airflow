import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice.ts';

export default function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    dispatch(login());
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
