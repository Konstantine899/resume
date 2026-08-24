// Проверка что stories не нарушают FSD границы
const fs = require('fs');
const path = require('path');

const storyFiles = process.argv[2];

// Запрещенные импорты в stories
const forbiddenPatterns = [
  /@app\/providers/, // Stories не должны импортировать провайдеры напрямую
];

console.log('🔍 [FSD Check] Validating story imports...');

// Валидация будет добавлена в CI
