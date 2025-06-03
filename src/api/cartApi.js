const API_BASE_URL = 'http://104.244.79.23:3000';

function getToken() {
  return localStorage.getItem('token');
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getCart() {
  const res = await fetch(`${API_BASE_URL}/api/users/cart`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося отримати кошик');
  return res.json();
}

export async function addToCart({ productId, build_id, quantity }) {
  const res = await fetch(`${API_BASE_URL}/api/users/cart`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, build_id, quantity }),
  });
  if (!res.ok) throw new Error('Не вдалося додати до кошика');
  return res.json();
}

export async function updateCart({ productId, quantity }) {
  const res = await fetch(`${API_BASE_URL}/api/users/cart`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error('Не вдалося оновити кошик');
  return res.json();
}

export async function clearCart() {
  const res = await fetch(`${API_BASE_URL}/api/users/cart`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Не вдалося очистити кошик');
  return res.json();
} 