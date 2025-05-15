const API_BASE_URL = 'http://192.168.0.105:3000';

// Отримати атрибути категорії для фільтрації
export async function fetchCategoryAttributes(categoryId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes`);
  if (!res.ok) throw new Error('Не вдалося отримати атрибути категорії');
  return res.json();
}

// Отримати значення атрибуту категорії
export async function fetchAttributeValues(categoryId, attributeId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes/${attributeId}/values`);
  if (!res.ok) throw new Error('Не вдалося отримати значення атрибуту');
  return res.json();
}
