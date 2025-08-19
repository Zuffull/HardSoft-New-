"use client";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Categories from "../../components/Categories";
import Footer from "../../components/Footer";
import { getFavorites } from "../../utils/favorites";
import { fetchProductDetails } from "../../api/productApiV2";
import { ProductCardItem } from "../../components/ProductCards";
import '../../styles/Filters.css';

export default function FavoritesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Перевірка автентифікації
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthenticated(!!token);
    if (!token) {
      setLoading(false);
      return;
    }
    // Завантаження обраних товарів
    const favs = getFavorites();
    setFavorites(favs);
    if (favs.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    Promise.all(favs.map(id => fetchProductDetails(id).catch(() => null)))
      .then(res => setProducts(res.filter(Boolean)))
      .catch(() => setError("Не вдалося завантажити товари"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{  }}>
      <Header />
      <Categories />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0', minHeight: '60vh' }}>
        <h1 style={{ color: '#ff8001', fontWeight: 700, fontSize: '2.2rem', marginBottom: 32 }}>Обране</h1>
        {!isAuthenticated ? (
          <div style={{ background: '#232323', color: '#fff', padding: 32, borderRadius: 16, textAlign: 'center', fontSize: 20, maxWidth: 500, margin: '40px auto' }}>
            Збереження товарів доступне лише для зареєстрованих користувачів
          </div>
        ) : loading ? (
          <div style={{ color: '#fff', fontSize: 18, padding: 32 }}>Завантаження...</div>
        ) : error ? (
          <div style={{ color: 'red', fontSize: 18, padding: 32 }}>{error}</div>
        ) : products.length === 0 ? (
          <div style={{ color: '#fff', fontSize: 18, padding: 32 }}>У вас ще немає обраних товарів</div>
        ) : (
          <div className="systemproduct-grid">
            {products.map(product => (
              <ProductCardItem key={product.id} product={product} category={product.category?.name} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
