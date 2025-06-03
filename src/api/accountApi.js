const API_BASE_URL = 'http://192.168.0.105:3000';

export function getToken() {
  console.log(localStorage.getItem('token'));
  return localStorage.getItem('token');
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- AUTH ---
export async function register({ username, email, password, phone, role = 'user' }) {
  const res = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, email, password, phone, role }),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  return response;
}

export async function login({ username, password }) {
  const res = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
    console.log(123);
    if (response.token) {
    console.log(response.token);
    localStorage.setItem('token', response.token);
  }
  return response;
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/api/users/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Помилка виходу');
  return res.json();
}

// --- PROFILE ---
export async function getProfile() {
  const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати профіль');
  return res.json();
}

export async function updateProfile({ username, email, role }) {
  const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, email, role }),
  });
  if (!res.ok) throw new Error('Не вдалося оновити профіль');
  return res.json();
}

// --- ADDRESSES ---
export async function getAddresses() {
  const res = await fetch(`${API_BASE_URL}/api/users/addresses`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати адреси');
  return res.json();
}

export async function addAddress({ address, city, postalCode, isDefault }) {
  const res = await fetch(`${API_BASE_URL}/api/users/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ address, city, postalCode, isDefault }),
  });
  if (!res.ok) throw new Error('Не вдалося додати адресу');
  return res.json();
}

export async function updateAddress({ address, city, postalCode, isDefault }) {
  const res = await fetch(`${API_BASE_URL}/api/users/addresses`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ address, city, postalCode, isDefault }),
  });
  if (!res.ok) throw new Error('Не вдалося оновити адресу');
  return res.json();
}

// --- WISHLIST ---
export async function getWishlist() {
  const res = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати список бажаного');
  return res.json();
}

export async function addToWishlist({ productId }) {
  const res = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Не вдалося додати до бажаного');
  return res.json();
}

export async function removeFromWishlist({ productId }) {
  const res = await fetch(`${API_BASE_URL}/api/users/wishlist`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Не вдалося видалити з бажаного');
  return res.json();
}

// --- ORDERS ---
export async function getOrders() {
  const res = await fetch(`${API_BASE_URL}/api/users/orders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати замовлення');
  return res.json();
}

export async function getOrderDetails(id) {
  const res = await fetch(`${API_BASE_URL}/api/users/orders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати деталі замовлення');
  return res.json();
}

export async function createOrder({ paymentMethod }) {
  const res = await fetch(`${API_BASE_URL}/api/users/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ paymentMethod }),
  });
  if (!res.ok) throw new Error('Не вдалося створити замовлення');
  return res.json();
}

export async function cancelOrder(id) {
  const res = await fetch(`${API_BASE_URL}/api/users/orders/cancel/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося скасувати замовлення');
  return res.json();
} 