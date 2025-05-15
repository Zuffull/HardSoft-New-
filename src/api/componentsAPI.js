const API_BASE_URL = 'http://192.168.0.105:3000';
const COMPONENTS_CATEGORY_ID = 'eec0c012-e114-47c1-b030-94f18e2718c6';

// Отримати атрибути категорії комплектуючих (або підкатегорії)
export async function fetchComponentsAttributes(categoryId = COMPONENTS_CATEGORY_ID) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes`);
  if (!res.ok) throw new Error('Не вдалося отримати атрибути категорії комплектуючих');
  return res.json();
}

// Отримати значення атрибуту категорії комплектуючих (або підкатегорії)
export async function fetchComponentAttributeValues(categoryId = COMPONENTS_CATEGORY_ID, attributeId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes/${attributeId}/values`);
  if (!res.ok) throw new Error('Не вдалося отримати значення атрибуту комплектуючих');
  return res.json();
}

// Отримати товари категорії комплектуючих з фільтрами
export async function fetchComponentsProducts({ page = 1, limit = 16, sort = '', filter = {}, brand = '', categoryId = COMPONENTS_CATEGORY_ID } = {}) {
  const requestBody = {
    page: Number(page),
    limit: Number(limit),
    filter,
  };
  if (sort) requestBody.sort = sort;
  if (brand) requestBody.brand = brand;
  requestBody.category = categoryId;

  const res = await fetch(`${API_BASE_URL}/api/products/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Fetch failed: ${res.status}. ${errorData}`);
  }

  const data = await res.json();
  // Додатково можна підвантажити деталі товару, якщо потрібно
  return data;
}

// Отримати підкатегорії комплектуючих
export async function fetchComponentsSubcategories() {
  const res = await fetch('http://192.168.0.105:3000/api/products/categories');
  if (!res.ok) throw new Error('Не вдалося отримати категорії');
  const all = await res.json();
  return all.filter(cat => cat.parent_id === COMPONENTS_CATEGORY_ID);
}
