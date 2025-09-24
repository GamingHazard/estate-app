import { Image } from 'react-native';
import { mockProperties } from '../data/mockData';
import { mockAdverts } from '../data/mockAdverts';

export const preloadImages = async () => {
  const propertyImages = mockProperties.map(property => property.thumbnail);
  const advertImages = mockAdverts.map(advert => advert.url);
  const allImages = [...propertyImages, ...advertImages];

  const loadImage = (imageUrl: string) => {
    return new Promise((resolve, reject) => {
      if (!imageUrl) {
        resolve(null);
        return;
      }

      Image.prefetch(imageUrl)
        .then(() => resolve(imageUrl))
        .catch(error => {
          console.warn(`Couldn't preload image ${imageUrl}:`, error);
          resolve(null); // Resolve anyway to not block other images
        });
    });
  };

  try {
    await Promise.all(allImages.map(imageUrl => loadImage(imageUrl)));
  } catch (error) {
    console.error('Error preloading images:', error);
  }
};