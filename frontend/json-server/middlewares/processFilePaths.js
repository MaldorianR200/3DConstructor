const path = require('path');

const processFilePaths = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = replaceFileKeys(req.body, req.files);
  }
  next();
};

const replaceFileKeys = (json, files) => {
  const result = JSON.parse(JSON.stringify(json)); // Создаем копию объекта JSON для модификации

  if (files) {
    files.forEach((file) => {
      const fieldName = file.fieldname;
      const filePath = path.join('/uploads', file.filename);
      const keys = fieldName.match(/[^[\]]+/g); // Разделяем ключи, учитывая массивы

      keys.reduce((acc, curr, index) => {
        const isArrayKey = !isNaN(parseInt(keys[index + 1])); // Проверяем, является ли следующий ключ индексом массива
        if (index === keys.length - 1) {
          // Убираем точку в начале ключа и заменяем ключ на 'path'
          curr = curr.replace(/^\./, '');
          acc[curr] = filePath; // Устанавливаем путь к файлу
        } else {
          if (isArrayKey) {
            acc[curr] = acc[curr] || [];
          } else {
            acc[curr] = acc[curr] || {};
          }
        }
        return acc[curr];
      }, result);
    });
  }

  // Меняем file на path
  const cleanObject = (obj) => {
    for (const key in obj) {
      if (key == 'file') {
        obj.path = obj[key];
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleanObject(obj[key]);
      }
    }
  };

  cleanObject(result);
  return result;
};

module.exports = processFilePaths;
