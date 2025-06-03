const API_BASE_URL = 'http://192.168.0.105:3000';

/**
 * Отримати токен авторизації з localStorage
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Сформувати заголовки для авторизованих запитів
 * @returns {Object}
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Auth: token } : {}),
  };
}

// ---------------------- PRODUCTS ----------------------

/**
 * Отримати список всіх товарів
 * @param {Object} params - Параметри запиту
 * @param {number} [params.page] - Номер сторінки
 * @param {number} [params.limit] - Кількість на сторінку
 * @param {string} [params.sort] - Сортування
 * @returns {Promise<Array>} Масив товарів
 */
export async function fetchProducts({ page, limit, sort } = {}) {
  const url = new URL(`${API_BASE_URL}/api/products`);
  if (page) url.searchParams.append('page', page);
  if (limit) url.searchParams.append('limit', limit);
  if (sort) url.searchParams.append('sort', sort);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Не вдалося отримати товари');
  return res.json();
}

/**
 * Пошук товарів за назвою/описом
 * @param {string} query - Пошуковий запит
 * @returns {Promise<Array>} Масив знайдених товарів
 */
export async function searchProducts(query) {
  const res = await fetch(`${API_BASE_URL}/api/products/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Не вдалося знайти товари');
  return res.json();
}

/**
 * Отримати список популярних товарів
 * @returns {Promise<Array>} Масив популярних товарів
 */
export async function fetchPopularProducts() {
  const res = await fetch(`${API_BASE_URL}/api/products/popular`);
  if (!res.ok) throw new Error('Не вдалося отримати популярні товари');
  return res.json();
}

/**
 * Отримати подібні товари
 * @param {string} id - ID товару
 * @param {number} [limit] - Кількість подібних
 * @returns {Promise<Array>} Масив подібних товарів
 */
export async function fetchSimilarProducts(id, limit) {
  const url = new URL(`${API_BASE_URL}/api/products/${id}/similar`);
  if (limit) url.searchParams.append('limit', limit);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Не вдалося отримати подібні товари');
  return res.json();
}

/**
 * Отримати нещодавно переглянуті товари користувача
 * @returns {Promise<Array>} Масив товарів
 */
export async function fetchRecentlyViewed() {
  const res = await fetch(`${API_BASE_URL}/api/products/recently-viewed`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати нещодавно переглянуті товари');
  return res.json();
}

/**
 * Додати товар до нещодавно переглянутих
 * @param {string} productId - ID товару
 * @returns {Promise<Object>} Відповідь сервера
 */
export async function addRecentlyViewed(productId) {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}/view`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося додати до нещодавно переглянутих');
  return res.json();
}

// ---------------------- CATEGORIES ----------------------

/**
 * Отримати список всіх категорій
 * @returns {Promise<Array>} Масив категорій
 */
export async function fetchAllCategories() {
  const res = await fetch(`${API_BASE_URL}/api/products/categories`);
  if (!res.ok) throw new Error('Не вдалося отримати категорії');
  return res.json();
}

/**
 * Отримати категорію за id
 * @param {string} categoryId - ID категорії
 * @returns {Promise<Object>} Категорія
 */
export async function fetchCategoryById(categoryId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}`);
  if (!res.ok) throw new Error('Не вдалося отримати категорію');
  return res.json();
}

/**
 * Отримати атрибути категорії
 * @param {string} categoryId - ID категорії
 * @returns {Promise<Array>} Масив атрибутів
 */
export async function fetchCategoryAttributes(categoryId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes`);
  if (!res.ok) throw new Error('Не вдалося отримати атрибути категорії');
  return res.json();
}

/**
 * Отримати значення атрибуту категорії
 * @param {string} categoryId - ID категорії
 * @param {string} attributeId - ID атрибуту
 * @returns {Promise<Array>} Масив значень
 */
export async function fetchAttributeValues(categoryId, attributeId) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories/${categoryId}/attributes/${attributeId}/values`);
  if (!res.ok) throw new Error('Не вдалося отримати значення атрибуту');
  return res.json();
}

/**
 * Знайти категорію за назвою (name)
 * @param {string} categoryName - Назва категорії
 * @returns {Promise<Object|null>} Категорія або null, якщо не знайдено
 */
export async function fetchCategoryByName(categoryName) {
  const res = await fetch(`${API_BASE_URL}/api/products/categories`);
  if (!res.ok) throw new Error('Не вдалося отримати категорії');
  const categories = await res.json();
  return categories.find(cat => cat.name === categoryName) || null;
}

// ---------------------- PRODUCT DETAILS ----------------------

/**
 * Отримати деталі товару
 * @param {string} id - ID товару
 * @returns {Promise<Object>} Деталі товару
 */
export async function fetchProductDetails(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Не вдалося отримати деталі товару');
  return res.json();
}

/**
 * Отримати зображення товару
 * @param {string} id - ID товару
 * @returns {Promise<Array>} Масив зображень
 */
export async function fetchProductImages(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}/images`);
  if (!res.ok) throw new Error('Не вдалося отримати зображення товару');
  return res.json();
}

/**
 * Отримати характеристики товару
 * @param {string} id - ID товару
 * @returns {Promise<Object>} Характеристики
 */
export async function fetchProductSpecs(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}/specs`);
  if (!res.ok) throw new Error('Не вдалося отримати характеристики товару');
  return res.json();
}

/**
 * Отримати активні знижки на товар
 * @param {string} id - ID товару
 * @returns {Promise<Array>} Масив знижок
 */
export async function fetchProductDiscounts(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}/discounts`);
  if (!res.ok) throw new Error('Не вдалося отримати знижки на товар');
  return res.json();
}

/**
 * Отримати відгуки про товар
 * @param {string} id - ID товару
 * @returns {Promise<Array>} Масив відгуків
 */
export async function fetchProductReviews(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`);
  if (!res.ok) throw new Error('Не вдалося отримати відгуки про товар');
  return res.json();
}

// ---------------------- ADMIN ----------------------

/**
 * Створити новий товар (адмін)
 * @param {Object} body - Дані товару (див. документацію)
 * @returns {Promise<Object>} Створений товар
 */
export async function createProduct(body) {
  const res = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Не вдалося створити товар');
  return res.json();
}

/**
 * Оновити товар (адмін)
 * @param {string} id - ID товару
 * @param {Object} body - Дані для оновлення
 * @returns {Promise<Object>} Оновлений товар
 */
export async function updateProduct(id, body) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Не вдалося оновити товар');
  return res.json();
}

/**
 * Видалити товар (адмін)
 * @param {string} id - ID товару
 * @returns {Promise<Object>} Відповідь сервера
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося видалити товар');
  return res.json();
}

/**
 * Оновити кількість товару (адмін)
 * @param {string} id - ID товару
 * @param {number} quantity - Нова кількість
 * @param {string} [operation] - Операція (наприклад, 'inc' або 'dec')
 * @returns {Promise<Object>} Оновлений товар
 */
export async function updateProductQuantity(id, quantity, operation) {
  const body = { quantity };
  if (operation) body.operation = operation;
  const res = await fetch(`${API_BASE_URL}/api/products/${id}/quantity`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Не вдалося оновити кількість товару');
  return res.json();
}

/**
 * Фільтрація товарів
 * @param {Object} params - Параметри фільтрації
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.sort]
 * @param {string} [params.filter]
 * @param {string} [params.brand]
 * @param {string} [params.category]
 * @param {number} [params.minPrice]
 * @param {number} [params.maxPrice]
 * @param {boolean} [params.inStock]
 * @param {string} [params.search]
 * @param {Object} [params.attributeFilters]
 * @returns {Promise<Object>} Відфільтровані товари
 */
export async function filterProducts(params = {}) {
  const res = await fetch(`${API_BASE_URL}/api/products/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error('Не вдалося відфільтрувати товари');
  return res.json();
} 


// Get category name

export async function getProductCategoryInfo(productId) {
  try {
    // Отримуємо інформацію про продукт
    const productRes = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    if (!productRes.ok) throw new Error('Не вдалося отримати інформацію про товар');
    const productData = await productRes.json();

    if (!productData.categories || !Array.isArray(productData.categories)) {
      throw new Error('Некоректні дані категорій товару');
    }

    // Отримуємо інформацію про всі категорії продукту
    const categoryPromises = productData.categories.map(async (category) => {
      const categoryRes = await fetch(`${API_BASE_URL}/api/products/categories/${category}`);
      if (!categoryRes.ok) return null;
      return await categoryRes.json();
    });

    const categories = await Promise.all(categoryPromises);

    // Шукаємо категорію, яка не є "Компоненти"
    const targetCategory = categories.find(cat => cat && cat.name && cat.name !== 'Компоненти');

    if (!targetCategory) {
      throw new Error('Не знайдено відповідну категорію');
    }
    console.log('targetCategory', targetCategory.name);
    return targetCategory.name;
  } catch (error) {
    console.error('Помилка в getProductCategoryInfo:', error);
    throw error;
  }
}