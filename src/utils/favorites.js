// Утиліти для роботи з обраними товарами (favorites)

export function getFavorites() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

export function isFavorite(id) {
  if (typeof window === 'undefined') return false;
  const favs = getFavorites();
  return favs.includes(id);
}

export function toggleFavorite(id) {
  if (typeof window === 'undefined') return;
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(favId => favId !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
} 