import { CATEGORIES } from '../constants/categories.js';

// Resolve the display style for a credential category, falling back to the first.
export const getCategoryStyle = (category) =>
  CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
