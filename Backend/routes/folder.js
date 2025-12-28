import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

// Храним выбранную папку в памяти (в продакшене можно использовать БД)
let selectedFolder = process.env.SELECTED_FOLDER || '';

/**
 * Экспортируем функцию для получения выбранной папки
 */
export function getSelectedFolder() {
  return selectedFolder;
}

/**
 * Маршруты для работы с папкой
 */
export default function folderRoutes() {
  const router = Router();

  /**
   * POST /api/folder/select
   * Выбор папки для обслуживания
   */
  router.post('/select', async (req, res) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({ 
        error: 'Необходимо указать путь к папке' 
      });
    }
    
    // Проверяем существование папки
    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ 
          error: 'Указанный путь не является папкой' 
        });
      }
    } catch (error) {
      return res.status(404).json({ 
        error: 'Папка не найдена' 
      });
    }
    
    // Сохраняем выбранную папку
    selectedFolder = folderPath;
    
    res.json({
      success: true,
      folder: selectedFolder,
      message: 'Папка успешно выбрана'
    });
  } catch (error) {
    console.error('Ошибка при выборе папки:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
});

/**
 * GET /api/folder/status
 * Получение статуса выбранной папки
 */
router.get('/status', (req, res) => {
  res.json({
    selected: selectedFolder !== '',
    folder: selectedFolder || null
  });
});

/**
 * GET /api/folder/current
 * Получение текущей выбранной папки
 */
router.get('/current', (req, res) => {
  if (!selectedFolder) {
    return res.status(404).json({ 
      error: 'Папка не выбрана' 
    });
  }
  
    res.json({
      folder: selectedFolder
    });
  });

  return router;
}

