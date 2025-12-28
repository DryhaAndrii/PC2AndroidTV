import bonjour from 'bonjour';
import os from 'os';

let bonjourInstance = null;
let service = null;

/**
 * Запускает mDNS/Bonjour сервис для обнаружения сервера в локальной сети
 * @param {string} serverName - Имя сервера
 * @param {number} port - Порт сервера
 */
export function startDiscovery(serverName, port) {
  try {
    // Создаем экземпляр Bonjour
    bonjourInstance = bonjour();
    
    // Публикуем сервис
    service = bonjourInstance.publish({
      name: serverName,
      type: 'mytvserver',
      port: port,
      protocol: 'tcp',
      txt: {
        name: serverName,
        port: port.toString(),
        version: '1.0.0'
      }
    });
    
    console.log(`🔍 Сервер зарегистрирован для обнаружения: ${serverName}._mytvserver._tcp.local`);
  } catch (error) {
    console.error('❌ Ошибка при запуске обнаружения:', error.message);
    console.log('⚠️  Сервер будет работать, но не будет обнаружен автоматически');
  }
}

/**
 * Останавливает mDNS/Bonjour сервис
 */
export function stopDiscovery() {
  if (service) {
    service.stop();
    service = null;
  }
  if (bonjourInstance) {
    bonjourInstance.unpublishAll(() => {
      bonjourInstance.destroy();
      bonjourInstance = null;
    });
  }
}

