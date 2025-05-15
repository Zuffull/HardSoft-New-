import React from 'react';
import '../styles/ProductCard.css';

function renderStars(rating) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function getSpecsByCategory(product, category) {
  const a = product.attributes || {};
  switch (category) {
    case 'Монітори':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Діагональ', value: a['Діагональ:'] },
        { label: 'Роздільна здатність', value: a['Роздільна здатність:'] },
        { label: 'Тип матриці', value: a['Тип матриці:'] },
        { label: 'Яскравість', value: a['Яскравість:'] },
      ];
    case 'Клавіатури':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Тип підключення', value: a['Тип підключення:'] },
        { label: 'Тип клавіш', value: a['Тип клавіш:'] },
        { label: 'Форм-фактор', value: a['Форм-фактор:'] },
        { label: 'Підсвітка клавіш', value: a['Підсвітка клавіш:'] === '+' ? 'є' : 'немає' },
        { label: 'Розкладка', value: a['Розкладка:'] },
        { label: 'Колір', value: a['Колір:'] },
      ];
    case 'Миші':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Тип підключення', value: a['Тип підключення:'] },
        { label: 'Тип клавіш', value: a['Тип клавіш:'] },
        { label: 'Довжина кабеля', value: a['Довжина кабеля:'] },
        { label: 'Підсвітка клавіш', value: a['Підсвітка клавіш:'] === '+' ? 'є' : 'немає' },
        { label: 'Колір', value: a['Колір:'] },
      ];
    case 'Поверхні':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Матеріал', value: a['Матеріал:'] },
        { label: 'Габарити', value: a['Габарити:'] },
        { label: 'Колір', value: a['Колір:'] },
        { label: 'Підсвічування', value: a['Наявність підсвічування:'] === '+' ? 'є' : 'немає' },
      ];
    case 'Веб-камери':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Роздільна здатність', value: a['Роздільна здатність:'] },
        { label: 'Мегапікселі', value: a['Кількість мегапікселів веб-камери:'] },
        { label: 'Тип сенсора', value: a['Тип сенсора:'] },
        { label: 'Мікрофон', value: a['Мікрофон:'] === '+' ? 'є' : 'немає' },
        { label: 'Інтерфейси', value: a['Інтерфейси:'] },
      ];
    case 'Мережеве обладнання':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Інтерфейс', value: a['Інтерфейс підключення:'] },
        { label: 'Антени', value: a['Зовнішні антени:'] },
        { label: 'Wi-Fi', value: a['Стандарти Wi-Fi:'] },
        { label: 'Частота Wi-Fi', value: a['Частота роботи Wi-Fi:'] },
        { label: 'Швидкість', value: a['Швидкість:'] },
      ];
    case 'Різне':
      return [
        { label: 'Категорія', value: a['Категорія:'] },
        { label: 'Тип', value: a['Тип:'] },
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Опис', value: a['Опис-характеристика:'] },
      ];
    default:
      return [];
  }
}

export default function SimpleProductCard({ product, category }) {
  // Обчислення середнього рейтингу
  let avgRating = 0;
  if (product.reviews && product.reviews.length > 0) {
    avgRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  }
  const specs = getSpecsByCategory(product, category);
  return (
    <div className="product-card simple-card">
      <div className="product-image-container">
        <img
          src={
            (product.images && product.images.length > 0 && product.images[0]) ||
            product.img ||
            '/placeholder.jpg'
          }
          alt={product.name}
          onError={e => {
            e.target.src = '/placeholder.jpg';
            e.target.onerror = null;
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-category">Категорія: {category}</div>
        <ul className="product-specs simple-specs">
          {specs.map((spec, i) =>
            spec.value && <li key={i}><b>{spec.label}:</b> {spec.value}</li>
          )}
        </ul>
        <div className="product-rating" title={`Рейтинг: ${avgRating.toFixed(1)}/5`}>
          {renderStars(avgRating)}
        </div>
        <p className="product-price">{Number(product.price).toLocaleString('uk-UA')} ₴</p>
        <div className="product-actions simple-actions">
          <a href="#" className={`product-button${product.stock === 0 ? ' disabled' : ''}`}>
            {product.stock === 0 ? 'Немає в наявності' : 'Купити'}
          </a>
          <button className="favorite-btn" title="Зберегти">
            <img src="/favorite-icon.png" alt="Зберегти" />
          </button>
        </div>
      </div>
    </div>
  );
} 