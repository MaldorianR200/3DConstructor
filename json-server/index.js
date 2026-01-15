const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const convertToJson = require('./middlewares/convertToJson');
const processFilePaths = require('./middlewares/processFilePaths');

const DB_PATH = path.join(__dirname, 'db.json');

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults();

// Конфигурация multer для сохранения файлов
const uploadPath = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Создание директории для хранения загруженных файлов
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

server.use(middlewares);

// Middleware для обработки FormData и конвертации в JSON
server.use(upload.any()); // Обрабатываем любые файлы и поля

// Преобразуем formData в JSON
server.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = convertToJson(req.body);
  }
  next();
});

// Обрабатываем пути к файлам
server.use(processFilePaths);

// Служба статики для отдачи загруженных файлов
server.use('/uploads', express.static(uploadPath));

// Используем маршруты json-server
server.use(router);

// Запуск сервера
server.listen(9000, () => {
  console.log('Сервер запущен на порту 9000');
});
