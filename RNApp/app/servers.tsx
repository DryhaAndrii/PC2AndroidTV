import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { discoverServers, quickDiscoverServers, DiscoveredServer } from '../services/serverDiscovery';

export default function ServersScreen() {
  const router = useRouter();
  const [servers, setServers] = useState<DiscoveredServer[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const startDiscovery = async (quick: boolean = false) => {
    setIsScanning(true);
    setError(null);
    setServers([]);
    setScanProgress({ current: 0, total: 0 });

    try {
      const foundServers = quick
        ? await quickDiscoverServers()
        : await discoverServers(3000, (current, total) => {
            setScanProgress({ current, total });
          });

      setServers(foundServers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при поиске серверов');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Автоматически запускаем быстрое сканирование при загрузке
    startDiscovery(true);
  }, []);

  const handleSelectServer = (server: DiscoveredServer) => {
    // Сохраняем выбранный сервер и переходим к галерее
    // Пока просто переходим, позже добавим контекст для хранения состояния
    router.push({
      pathname: '/gallery' as any,
      params: { serverUrl: server.url, serverName: server.name },
    });
  };

  const renderServerItem = ({ item }: { item: DiscoveredServer }) => {
    return (
      <TouchableOpacity
        style={styles.serverItem}
        onPress={() => handleSelectServer(item)}
        tvParallaxProperties={{ magnification: 1.1 }}
      >
        <View style={styles.serverInfo}>
          <Text style={styles.serverName}>{item.name}</Text>
          <Text style={styles.serverUrl}>{item.url}</Text>
          {item.info && (
            <Text style={styles.serverVersion}>Версия: {item.info.version}</Text>
          )}
        </View>
        <View style={styles.serverStatus}>
          {item.status === 'found' && (
            <View style={[styles.statusIndicator, styles.statusFound]} />
          )}
          {item.status === 'discovering' && (
            <ActivityIndicator size="small" color="#667eea" />
          )}
          {item.status === 'error' && (
            <View style={[styles.statusIndicator, styles.statusError]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📺 Поиск серверов</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.quickButton]}
            onPress={() => startDiscovery(true)}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>Быстрый поиск</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.fullButton]}
            onPress={() => startDiscovery(false)}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>Полный поиск</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isScanning && (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.scanningText}>
            Поиск серверов... {scanProgress.current} / {scanProgress.total}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {!isScanning && servers.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Серверы не найдены</Text>
          <Text style={styles.emptySubtext}>
            Убедитесь, что сервер запущен и находится в той же сети
          </Text>
        </View>
      )}

      <FlatList
        data={servers}
        renderItem={renderServerItem}
        keyExtractor={(item) => item.url}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isScanning && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Серверы не найдены</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  quickButton: {
    backgroundColor: '#667eea',
  },
  fullButton: {
    backgroundColor: '#764ba2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningContainer: {
    padding: 40,
    alignItems: 'center',
  },
  scanningText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#4a1a1a',
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  list: {
    padding: 20,
  },
  serverItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  serverInfo: {
    flex: 1,
  },
  serverName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  serverUrl: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 4,
  },
  serverVersion: {
    fontSize: 14,
    color: '#667eea',
  },
  serverStatus: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusFound: {
    backgroundColor: '#4caf50',
  },
  statusError: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    color: '#aaa',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

