import { Router } from 'express';
import discoveryRoutes from './discovery.js';
import filesRoutes from './files.js';
import folderRoutes from './folder.js';

/**
 * Настраивает все маршруты API
 */
export function setupRoutes(app, serverName, port) {
  const router = Router();
  
  // Подключаем маршруты
  router.use('/discover', discoveryRoutes(serverName, port));
  router.use('/files', filesRoutes());
  router.use('/folder', folderRoutes());
  
  // Корневой эндпоинт API
  router.get('/', (req, res) => {
    res.json({
      name: 'TV Media Server API',
      version: '1.0.0',
      server: serverName,
      endpoints: {
        discover: '/api/discover',
        files: '/api/files',
        folder: '/api/folder'
      }
    });
  });
  
  app.use('/api', router);
}

