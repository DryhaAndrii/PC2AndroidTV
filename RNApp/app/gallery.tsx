import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function GalleryScreen() {
  const { serverUrl, serverName } = useLocalSearchParams<{
    serverUrl: string;
    serverName: string;
  }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Галерея</Text>
        <Text style={styles.subtitle}>Сервер: {serverName}</Text>
        <Text style={styles.subtitle}>URL: {serverUrl}</Text>
        <Text style={styles.placeholder}>
          Галерея будет реализована на следующем этапе
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    marginTop: 40,
    textAlign: 'center',
  },
});

