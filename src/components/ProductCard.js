import '../styles/ProductCard.css';
import React from 'react';

export default function ProductCard() {
  const products = [
    {
      id: 1,
      price: '₴1000',
      img: 'https://picsum.photos/300/200?random=1',
      processor: 'Intel Core i5',
      gpu: 'NVIDIA RTX 3060',
      memoryType: 'DDR4',
      ram: '16GB',
      storage: '512GB SSD',
    },
    {
      id: 2,
      price: '₴2000',
      img: 'https://picsum.photos/300/200?random=2',
      processor: 'AMD Ryzen 5',
      gpu: 'NVIDIA RTX 3070',
      memoryType: 'DDR4',
      ram: '32GB',
      storage: '1TB SSD',
    },
    {
      id: 3,
      price: '₴3000',
      img: 'https://picsum.photos/300/200?random=3',
      processor: 'Intel Core i7',
      gpu: 'NVIDIA RTX 3080',
      memoryType: 'DDR5',
      ram: '32GB',
      storage: '1TB SSD',
    },
    {
      id: 4,
      price: '₴4000',
      img: 'https://picsum.photos/300/200?random=4',
      processor: 'AMD Ryzen 7',
      gpu: 'NVIDIA RTX 3090',
      memoryType: 'DDR5',
      ram: '64GB',
      storage: '2TB SSD',
    },
    {
      id: 5,
      price: '₴5000',
      img: 'https://picsum.photos/300/200?random=5',
      processor: 'Intel Core i9',
      gpu: 'NVIDIA RTX 4090',
      memoryType: 'DDR5',
      ram: '64GB',
      storage: '2TB SSD',
    },
  ];

  return (
    <div>
      <h1 className="section-title">Топ продажів</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.img} alt={product.title} />
            <div className="product-info">
              <h3 className="product-title">{product.title}</h3>
              <p className="product-id">ID: {product.id}</p>
              <ul className="product-specs">
                <li>Процесор: {product.processor}</li> 
                <li>Відеокарта: {product.gpu}</li>
                <li>Тип пам'яті: {product.memoryType}</li>
                <li>Оперативна пам'ять: {product.ram}</li>
                <li>Накопичувач: {product.storage}</li>
              </ul>
              <p className="product-price">{product.price}</p>
              <div className="product-actions">
                <a href="#" className="product-button">В кошик</a>
                <button className="favorite-btn" title="Додати в обране"><img src='Обране(зірочка).png'></img></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}