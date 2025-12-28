# TV Media Server - Backend

Backend сервер для приложения TV Media Server, который предоставляет доступ к медиа файлам из выбранной папки через локальную сеть.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`:
```
PORT=3000
SERVER_NAME=MyMediaServer
SELECTED_FOLDER=
```

## Запуск

### Обычный режим
```bash
npm start
```

### Режим разработки (с автоперезагрузкой)
```bash
npm run dev
```

После запуска:
- Веб-интерфейс будет доступен по адресу: http://localhost:3000
- API будет доступен по адресу: http://localhost:3000/api

## Использование

1. Откройте веб-интерфейс в браузере (http://localhost:3000)
2. Выберите папку с медиа файлами через интерфейс
3. Сервер автоматически зарегистрируется в локальной сети через mDNS
4. TV приложение сможет обнаружить и подключиться к серверу

## API Endpoints

### Discovery
- `GET /api/discover` - Информация о сервере для обнаружения

### Folder
- `POST /api/folder/select` - Выбор папки
  - Body: `{ "folderPath": "/path/to/folder" }`
- `GET /api/folder/status` - Статус выбранной папки
- `GET /api/folder/current` - Текущая выбранная папка

### Files
- `GET /api/files` - Список всех файлов
- `GET /api/files/:id` - Получение файла по ID
- `GET /api/files/:id/info` - Информация о файле

## Поддерживаемые форматы

На данный момент поддерживаются только изображения:
- JPEG (.jpg, .jpeg)
- PNG (.png)

## Обнаружение в сети

Сервер автоматически регистрируется в локальной сети через mDNS/Bonjour с типом `mytvserver`. TV приложение может обнаружить сервер, сканируя сервисы типа `_mytvserver._tcp.local`.

## Структура проекта

```
Backend/
├── server.js              # Основной файл сервера
├── routes/                # API маршруты
│   ├── index.js          # Настройка всех маршрутов
│   ├── discovery.js      # Маршруты для обнаружения
│   ├── folder.js         # Маршруты для работы с папкой
│   └── files.js          # Маршруты для работы с файлами
├── services/             # Сервисы
│   └── discovery.js      # mDNS/Bonjour сервис
├── public/               # Статические файлы
│   └── index.html        # Веб-интерфейс
└── package.json
```

