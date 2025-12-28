import { Router } from 'express';

/**
 * Маршруты для обнаружения сервера
 */
export default function discoveryRoutes(serverName, port) {
  const router = Router();
  
  /**
   * GET /api/discover
   * Возвращает информацию о сервере для обнаружения
   */
  router.get('/', (req, res) => {
    res.json({
      name: serverName,
      port: port,
      version: '1.0.0',
      type: 'mytvserver',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });
  
  return router;
}

