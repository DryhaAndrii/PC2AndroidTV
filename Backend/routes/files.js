import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { lookup } from 'mime-types';
import { getSelectedFolder } from './folder.js';

// Кэш для хранения списка файлов (в продакшене можно использовать БД)
let filesCache = null;
let lastScanTime = null;

// Поддерживаемые форматы изображений
const SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png'];

/**
 * Проверяет, является ли файл поддерживаемым изображением
 */
function isSupportedImage(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return SUPPORTED_IMAGE_FORMATS.includes(ext);
}

/**
 * Рекурсивно сканирует папку и возвращает список файлов
 */
async function scanFolder(folderPath, basePath = folderPath) {
  const files = [];
  
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        // Рекурсивно сканируем подпапки
        const subFiles = await scanFolder(fullPath, basePath);
        files.push(...subFiles);
      } else if (entry.isFile() && isSupportedImage(entry.name)) {
        // Получаем информацию о файле
        const stats = await fs.stat(fullPath);
        const fileId = Buffer.from(relativePath).toString('base64url');
        
        files.push({
          id: fileId,
          name: entry.name,
          path: relativePath,
          fullPath: fullPath,
          size: stats.size,
          type: 'image',
          mimeType: lookup(entry.name) || 'application/octet-stream',
          modified: stats.mtime.toISOString()
        });
      }
    }
  } catch (error) {
    console.error(`Ошибка при сканировании ${folderPath}:`, error.message);
  }
  
  return files;
}

/**
 * Обновляет кэш файлов
 */
async function updateFilesCache() {
  const selectedFolder = getSelectedFolder();
  
  if (!selectedFolder) {
    filesCache = [];
    lastScanTime = null;
    return;
  }
  
  try {
    filesCache = await scanFolder(selectedFolder);
    lastScanTime = new Date();
    console.log(`📁 Найдено файлов: ${filesCache.length}`);
  } catch (error) {
    console.error('Ошибка при обновлении кэша файлов:', error);
    filesCache = [];
    lastScanTime = null;
  }
}

/**
 * Маршруты для работы с файлами
 */
export default function filesRoutes() {
  const router = Router();

  /**
   * GET /api/files
   * Возвращает список всех файлов
   */
  router.get('/', async (req, res) => {
  try {
    const selectedFolder = getSelectedFolder();
    
    if (!selectedFolder) {
      return res.status(400).json({ 
        error: 'Папка не выбрана. Пожалуйста, выберите папку через веб-интерфейс.' 
      });
    }
    
    // Обновляем кэш если нужно
    await updateFilesCache();
    
    res.json({
      files: filesCache || [],
      count: filesCache?.length || 0,
      lastScan: lastScanTime?.toISOString() || null
    });
  } catch (error) {
    console.error('Ошибка при получении списка файлов:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
});

/**
 * GET /api/files/:id/info
 * Возвращает информацию о файле
 */
router.get('/:id/info', async (req, res) => {
  try {
    const { id } = req.params;
    const selectedFolder = getSelectedFolder();
    
    if (!selectedFolder) {
      return res.status(400).json({ 
        error: 'Папка не выбрана' 
      });
    }
    
    // Обновляем кэш если нужно
    await updateFilesCache();
    
    // Ищем файл в кэше
    const file = filesCache?.find(f => f.id === id);
    
    if (!file) {
      return res.status(404).json({ 
        error: 'Файл не найден' 
      });
    }
    
    res.json(file);
  } catch (error) {
    console.error('Ошибка при получении информации о файле:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
});

/**
 * GET /api/files/:id
 * Возвращает конкретный файл
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const selectedFolder = getSelectedFolder();
    
    if (!selectedFolder) {
      return res.status(400).json({ 
        error: 'Папка не выбрана' 
      });
    }
    
    // Декодируем ID обратно в путь
    let filePath;
    try {
      filePath = Buffer.from(id, 'base64url').toString('utf-8');
    } catch (error) {
      return res.status(400).json({ 
        error: 'Неверный ID файла' 
      });
    }
    
    const fullPath = path.join(selectedFolder, filePath);
    
    // Проверяем существование файла
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        return res.status(404).json({ 
          error: 'Файл не найден' 
        });
      }
      
      // Проверяем безопасность пути (предотвращаем path traversal)
      const resolvedPath = path.resolve(fullPath);
      const resolvedFolder = path.resolve(selectedFolder);
      
      if (!resolvedPath.startsWith(resolvedFolder)) {
        return res.status(403).json({ 
          error: 'Доступ запрещен' 
        });
      }
      
      // Определяем MIME тип
      const mimeType = lookup(filePath) || 'application/octet-stream';
      
      // Устанавливаем заголовки
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // Отправляем файл
      const fileStream = await fs.readFile(fullPath);
      res.send(fileStream);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ 
          error: 'Файл не найден' 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при получении файла:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера' 
    });
  }
});

  return router;
}

