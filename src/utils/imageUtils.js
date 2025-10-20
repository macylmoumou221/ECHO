import { BASE_URL } from '../config';

export const getImageUrl = (url) => {
  if (!url) return "/src/assets/UserCircle.png";
  
  // If it's already a valid URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local path starting with /src, it's a local asset
  if (url.startsWith('/src')) {
    return url;
  }
  
  // Add the base URL if it's a relative path from the backend
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
