/**
 * Предзагрузить изображение
 *
 * @param src - URL изображения
 * @returns Promise который резолвится когда изображение загружено
 *
 * @example
 * await preloadImage('/avatar.jpg');
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Предзагрузить несколько изображений
 *
 * @param srcs - Массив URL изображений
 * @returns Promise который резолвится когда все изображения загружены
 *
 * @example
 * await preloadImages(['/img1.jpg', '/img2.jpg']);
 */
export const preloadImages = (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(preloadImage));
};
