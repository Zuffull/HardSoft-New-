"use client";
import React, { useEffect, useState } from 'react';
import '../styles/ProductCard.css';
import { fetchProducts } from '../api/productApi.js'; // Adjust the import path as necessary

export default function ProductCard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Оголошуємо асинхронну функцію всередині useEffect
      const fetchData = async () => {
      let data = await fetchProducts();  // Ось так чекаємо на результат
      setProducts(data);  // Тепер виведе отримані дані
    };

    fetchData();  // Викликаємо асинхронну функцію
  }, []);

  return (
    <div style={{ marginTop: '70px' }}> 
      <div className="product-grid">
        {products.slice(0, 5).map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.img} alt={product.name} />
            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-id">ID: {product.id}</p>
              <ul className="product-specs">
                <li>Процесор: {product.processor}</li>
                <li>Відеокарта: {product.gpu}</li>
                <li>Тип пам'яті: {product.memoryType}</li>
                <li>Оперативна пам'ять: {product.ram}</li>
                <li>Накопичувач: {product.storage}</li>
              </ul>
              <p className="product-price">{product.price} ₴</p>
              <div className="product-actions">
                <a href="#" className="product-button">В кошик</a>
                <button className="favorite-btn" title="Додати в обране">
                  <img src="Обране(зірочка).png" alt="favorite" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}