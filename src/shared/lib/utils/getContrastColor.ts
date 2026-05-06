/**
 * Получить контрастный цвет (чёрный или белый) для фона
 * Использует формулу YIQ для определения яркости
 *
 * @param hexColor - HEX цвет фона (например, '#ff0000')
 * @returns 'black' или 'white' для контрастного текста
 *
 * @example
 * getContrastColor('#ffffff') // 'black'
 * getContrastColor('#000000') // 'white'
 * getContrastColor('#f4b377') // 'black'
 */
export const getContrastColor = (hexColor: string): 'black' | 'white' => {
  // Удалить # если есть
  const hex = hexColor.replace('#', '');

  // Преобразовать в RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Формула YIQ для определения яркости
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128 ? 'black' : 'white';
};
