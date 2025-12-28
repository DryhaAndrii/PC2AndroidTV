import axios from 'axios';

export interface ServerInfo {
  name: string;
  port: number;
  version: string;
  type: string;
  status: string;
  timestamp: string;
}

export interface FileInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  mimeType: string;
  modified: string;
}

export interface FilesResponse {
  files: FileInfo[];
  count: number;
  lastScan: string | null;
}

/**
 * Получает информацию о сервере
 */
export async function getServerInfo(serverUrl: string): Promise<ServerInfo> {
  try {
    const response = await axios.get<ServerInfo>(`${serverUrl}/api/discover`, {
      timeout: 3000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Не удалось подключиться к серверу: ${error}`);
  }
}

/**
 * Получает список файлов с сервера
 */
export async function getFiles(serverUrl: string): Promise<FilesResponse> {
  try {
    const response = await axios.get<FilesResponse>(`${serverUrl}/api/files`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Не удалось получить список файлов: ${error}`);
  }
}

/**
 * Получает URL для загрузки файла
 */
export function getFileUrl(serverUrl: string, fileId: string): string {
  return `${serverUrl}/api/files/${fileId}`;
}

/**
 * Получает информацию о файле
 */
export async function getFileInfo(serverUrl: string, fileId: string): Promise<FileInfo> {
  try {
    const response = await axios.get<FileInfo>(`${serverUrl}/api/files/${fileId}/info`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Не удалось получить информацию о файле: ${error}`);
  }
}

