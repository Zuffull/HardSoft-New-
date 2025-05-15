"use client";
import React, { useEffect, useState } from 'react';
import '../styles/ProductCard.css';
import { fetch324Products } from '../api/productApi.js';

const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

export default function ProductCard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetch324Products({
          categoryName: "Готові ПК",
          page: 1,
          limit: 10,
          sort: 'rating:desc'
        });
        
        const transformedData = data.map(product => ({
          ...product,
          img: product.images && product.images.length > 0 
            ? product.images[0] 
            : '/placeholder.jpg',
          averageRating: calculateAverageRating(product.reviews)
        }));

        setProducts(transformedData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStars = (rating) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div>
      <div className="product-grid">
        {products.slice(5, 10).map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image-container">
              <img 
                src={product.img} 
                alt={product.name} 
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                  e.target.onerror = null;
                }}
              />
              {product.stock > 0 && (
                <span className="stock-badge">В наявності</span>
              )}
              {product.discount && (
                <span className="discount-badge">-{product.discount}%</span>
              )}
            </div>
            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>
              <div className="product-meta">
                <p className="product-sku">Код: {product.sku}</p>
                <div className="product-rating" title={`Рейтинг: ${product.averageRating}/5`}>
                  {renderStars(product.averageRating)}
                </div>
              </div>
              <ul className="product-specs">
                <li>Процесор: {product.attributes?.Процесор || "Не вказано"}</li>
                <li>Відеокарта: {product.attributes?.Відеокарта || "Не вказано"}</li>
                <li>Тип пам'яті: {product.attributes?.["Тип пам'яті"] || "Не вказано"}</li>
                <li>Оперативна пам'ять: {product.attributes?.["Оперативна пам’ять"] || "Не вказано"}</li>
                <li>Материнська плата: {product.attributes?.["Материнська плата"] || "Не вказано"}</li>
                <li>Накопичувач: {product.attributes?.Накопичувач || "Не вказано"}</li>
              </ul>
              <p className="product-price">{Number(product.price).toLocaleString('uk-UA')} ₴</p>
              <div className="product-actions">
                <a href="#" className={`product-button ${product.stock === 0 ? 'disabled' : ''}`}>
                  {product.stock === 0 ? 'Немає в наявності' : 'В кошик'}
                </a>
                <button className="favorite-btn" title="Додати в обране">
                  <img src="/favorite-icon.png" alt="favorite" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
