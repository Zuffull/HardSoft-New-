const API_BASE_URL = 'http://192.168.0.105:3000';

// Отримати всі категорії комплектуючих (CPU, GPU, RAM, Motherboard тощо)
export async function fetchConfiguratorCategories() {
  const res = await fetch(`${API_BASE_URL}/api/products/categories`);
  if (!res.ok) throw new Error('Не вдалося отримати категорії');
  return res.json();
}

// Отримати атрибути для категорії (наприклад, сокет для CPU, обсяг для RAM)
export async function fetchCategoryAttributes(categoryId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes`);
  if (!res.ok) throw new Error('Не вдалося отримати атрибути категорії');
  return res.json();
}

// Отримати значення атрибуту для категорії (наприклад, всі доступні сокети)
export async function fetchAttributeValues(categoryId, attributeId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes/${attributeId}/values`);
  if (!res.ok) throw new Error('Не вдалося отримати значення атрибуту');
  return res.json();
}

// Отримати товари для категорії з фільтрами (наприклад, всі CPU з певним сокетом)
export async function fetchCategoryProducts({
  page = 1,
  limit = 16,
  sort = '',
  filter = {},
  brand = '',
  categoryId = ''
} = {}) {
  const requestBody = {
    page: Number(page),
    limit: Number(limit),
    filter,
  };
  if (sort) requestBody.sort = sort;
  if (brand) requestBody.brand = brand;
  if (categoryId) requestBody.category = categoryId;

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

  return res.json();
}

// --- AUTH ---
function getToken() {
  // Можна замінити на отримання з localStorage, cookie або контексту
  return localStorage.getItem('token');
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- CONFIGURATOR BUILDS API ---

// Отримати список всіх конфігурацій користувача
export async function getUserConfigurations() {
  const res = await fetch(`${API_BASE_URL}/api/configurator`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати конфігурації');
  return res.json();
}

// Створити нову конфігурацію
export async function createConfiguration({ name, status = 'draft' }) {
  const res = await fetch(`${API_BASE_URL}/api/configurator`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, status }),
  });
  if (!res.ok) throw new Error('Не вдалося створити конфігурацію');
  return res.json();
}

// Отримати деталі конфігурації
export async function getConfigurationDetails(buildId) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати деталі конфігурації');
  return res.json();
}

// Оновити дані конфігурації
export async function updateConfiguration(buildId, { name, status }) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, status }),
  });
  if (!res.ok) throw new Error('Не вдалося оновити конфігурацію');
  return res.json();
}

// Зберегти конфігурацію (з перевіркою сумісності)
export async function saveConfiguration(buildId) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося зберегти конфігурацію');
  return res.json();
}

// Видалити конфігурацію
export async function deleteConfiguration(buildId) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося видалити конфігурацію');
  return res.json();
}

// Додати компонент до конфігурації
export async function addItemToConfiguration(buildId, { productId, quantity = 1 }) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error('Не вдалося додати компонент');
  return res.json();
}

// Оновити кількість компонента
export async function updateConfigurationItem(buildId, itemId, quantity) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}/items/${itemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Не вдалося оновити компонент');
  return res.json();
}

// Видалити компонент з конфігурації
export async function deleteConfigurationItem(buildId, itemId) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося видалити компонент');
  return res.json();
}

// Отримати сумісні продукти для збірки за категорією
export async function getCompatibleProducts(buildId, categoryId) {
  const res = await fetch(`${API_BASE_URL}/api/configurator/${buildId}/compatible-products/${categoryId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати сумісні продукти');
  return res.json();
}
