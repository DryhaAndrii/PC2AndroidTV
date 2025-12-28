import { getServerInfo, ServerInfo } from './api';

export interface DiscoveredServer {
  name: string;
  url: string;
  port: number;
  info: ServerInfo | null;
  status: 'discovering' | 'found' | 'error';
}

/**
 * Получает локальный IP адрес устройства (для определения подсети)
 * Пока используем стандартную подсеть, позже можно улучшить определение
 */
function getLocalNetworkBase(): string {
  // Для TV приложений обычно используется подсеть 192.168.x.x
  // Будем сканировать стандартные подсети
  // TODO: Определять подсеть автоматически на основе IP устройства
  return '192.168.1';
}

/**
 * Генерирует список IP адресов для сканирования
 */
function generateIPList(baseIP: string, start: number = 1, end: number = 255): string[] {
  const ips: string[] = [];
  for (let i = start; i <= end; i++) {
    ips.push(`${baseIP}.${i}`);
  }
  return ips;
}

/**
 * Проверяет доступность сервера по IP адресу
 */
async function checkServer(ip: string, port: number = 3000): Promise<ServerInfo | null> {
  const url = `http://${ip}:${port}`;
  try {
    const info = await getServerInfo(url);
    // Проверяем, что это наш сервер
    if (info.type === 'mytvserver') {
      return info;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Сканирует локальную сеть в поисках серверов
 */
export async function discoverServers(
  port: number = 3000,
  onProgress?: (current: number, total: number) => void
): Promise<DiscoveredServer[]> {
  const baseIP = getLocalNetworkBase();
  const ipList = generateIPList(baseIP);
  const servers: DiscoveredServer[] = [];
  let checked = 0;

  // Сканируем IP адреса параллельно (по 10 за раз)
  const batchSize = 10;
  for (let i = 0; i < ipList.length; i += batchSize) {
    const batch = ipList.slice(i, i + batchSize);
    
    const promises = batch.map(async (ip) => {
      const info = await checkServer(ip, port);
      checked++;
      if (onProgress) {
        onProgress(checked, ipList.length);
      }
      
      if (info) {
        return {
          name: info.name,
          url: `http://${ip}:${port}`,
          port: info.port,
          info: info,
          status: 'found' as const,
        } as DiscoveredServer;
      }
      return null;
    });

    const results = await Promise.all(promises);
    const foundServers = results.filter((server): server is DiscoveredServer => server !== null);
    servers.push(...foundServers);
  }

  return servers;
}

/**
 * Быстрое сканирование только последних 20 IP адресов (обычно новые устройства)
 */
export async function quickDiscoverServers(port: number = 3000): Promise<DiscoveredServer[]> {
  const baseIP = getLocalNetworkBase();
  // Сканируем последние 20 адресов (обычно там новые устройства)
  const startIP = 235;
  const endIP = 255;
  const ipList = generateIPList(baseIP, startIP, endIP);
  const servers: DiscoveredServer[] = [];

  const promises = ipList.map(async (ip) => {
    const info = await checkServer(ip, port);
    if (info) {
      return {
        name: info.name,
        url: `http://${ip}:${port}`,
        port: info.port,
        info: info,
        status: 'found' as const,
      } as DiscoveredServer;
    }
    return null;
  });

  const results = await Promise.all(promises);
  const foundServers = results.filter((server): server is DiscoveredServer => server !== null);
  servers.push(...foundServers);

  return servers;
}

