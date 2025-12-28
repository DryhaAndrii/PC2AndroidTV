import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import { startDiscovery } from './services/discovery.js';
import { setupRoutes } from './routes/index.js';

// Загружаем переменные окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Получаем имя сервера из env или используем hostname
const getServerName = () => {
  if (process.env.SERVER_NAME && process.env.SERVER_NAME.trim() !== '') {
    return process.env.SERVER_NAME.trim();
  }
  return os.hostname();
};

const SERVER_NAME = getServerName();

// Middleware
app.use(cors()); // Разрешаем запросы с любого источника (для локальной сети)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для веб-интерфейса
app.use(express.static(join(__dirname, 'public')));

// API routes
setupRoutes(app, SERVER_NAME, PORT);

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`🚀 TV Media Server запущен!`);
  console.log(`📡 Имя сервера: ${SERVER_NAME}`);
  console.log(`🌐 Веб-интерфейс: http://localhost:${PORT}`);
  console.log(`📺 API: http://localhost:${PORT}/api`);
  console.log(`\nНажмите Ctrl+C для остановки\n`);
  
  // Запускаем обнаружение через mDNS
  startDiscovery(SERVER_NAME, PORT);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Остановка сервера...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Остановка сервера...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

