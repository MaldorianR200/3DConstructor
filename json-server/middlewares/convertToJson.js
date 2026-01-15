const convertToJson = (formData) => {
  const json = {};

  for (const [key, value] of Object.entries(formData)) {
    const keys = key.match(/[^[\]]+/g); // Разделяем ключи по скобкам и точкам

    keys.reduce((acc, curr, index) => {
      // Пропускаем пустые ключи
      if (!curr) return acc;

      // Если текущий ключ содержит точку, разбиваем его на части
      const parts = curr.split('.');

      // Проходим по каждой части ключа
      parts.forEach((part, i) => {
        if (!part) return; // Пропускаем пустые части

        if (i < parts.length - 1) {
          acc = acc[part] = acc[part] || {};
        } else {
          curr = part;
        }
      });

      if (index === keys.length - 1) {
        acc[curr] = value;
      } else {
        if (isNaN(parseInt(keys[index + 1]))) {
          acc[curr] = acc[curr] || {};
        } else {
          acc[curr] = acc[curr] || [];
        }
      }

      return acc[curr];
    }, json);
  }

  return json;
};

module.exports = convertToJson;
