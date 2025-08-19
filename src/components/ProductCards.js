"use client";
import React, { useEffect, useState } from 'react';
import '../styles/ProductCard.css';
import { fetchAllCategories, fetchProductDetails, filterProducts, fetchProductSpecs } from '../api/productApiV2.js';
import { isFavorite, getFavorites, toggleFavorite } from '../utils/favorites';
import { addToCart } from '../api/cartApi';
import ProductDetailsModal from './ProductDetailsModal';

// Utility functions
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

const renderStars = (rating) => {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
};

// Utility function for getting specs by category
function getSpecsByCategory(product, category) {
  const a = product.attributes || {};
  switch (category) {
    case 'Процесори':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Сімейство', value: a['Сімейство процесорів:'] || a['Сімейство:'] },
        { label: 'Кількість ядер', value: a['Кількість ядер:'] },
        { label: 'Кількість потоків', value: a['Кількість потоків:'] },
        { label: 'Базова частота', value: a['Базова частота:'] },
        { label: 'Turbo частота', value: a['Turbo частота:'] },
        { label: 'Вбудована графіка', value: a['Вбудована графіка:'] },
      ];
    case 'Материнські плати':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Сокет', value: a['Сокет:'] },
        { label: 'Чіпсет', value: a['Чіпсет:'] },
        { label: "Тип пам'яті", value: a["Тип пам'яті:"] },
        { label: 'Кількість слотів RAM', value: a["Кількість слотів пам'яті:"] },
        { label: 'Форм-фактор', value: a['Форм-фактор:'] },
      ];
    case 'Відеокарти':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Графічний чіп', value: a['Графічний чіп:'] },
        { label: "Обсяг пам'яті", value: a["Обсяг пам'яті:"] },
        { label: "Тип пам'яті", value: a["Тип пам'яті:"] },
        { label: 'Розрядність шини', value: a['Розрядність шини:'] },
        { label: 'Відеовиходи', value: a['Відеовиходи:'] },
      ];
    case "Оперативна пам'ять":
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: "Тип пам'яті", value: a["Тип пам'яті:"] },
        { label: 'Обсяг', value: a['Обсяг:'] },
        { label: 'Кількість модулів', value: a['Кількість модулів:'] },
        { label: 'Частота', value: a['Частота:'] },
      ];
    case 'SSD накопичувачі':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Обсяг', value: a['Обсяг:'] },
        { label: 'Форм-фактор', value: a['Форм-фактор:'] },
        { label: 'Інтерфейс', value: a['Інтерфейс:'] },
        { label: 'Швидкість читання', value: a['Швидкість читання:'] },
        { label: 'Швидкість запису', value: a['Швидкість запису:'] },
      ];
    case 'HDD накопичувачі':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Обсяг', value: a['Обсяг:'] },
        { label: 'Форм-фактор', value: a['Форм-фактор:'] },
        { label: 'Інтерфейс', value: a['Інтерфейс:'] },
        { label: 'Швидкість обертання', value: a['Швидкість обертання:'] },
      ];
    case 'Блоки живлення':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Потужність', value: a['Потужність:'] },
        { label: 'Сертифікат 80 PLUS', value: a['Сертифікат 80 PLUS:'] },
        { label: 'Форм-фактор', value: a['Форм-фактор:'] },
        { label: 'Модульність', value: a['Модульність:'] },
      ];
    case 'Корпуси':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Форм-фактор', value: a['Форм-фактор:'] },
        { label: 'Підтримка материнських плат', value: a['Підтримка материнських плат:'] },
        { label: 'Кількість відсіків', value: a['Кількість відсіків:'] },
        { label: 'Підсвічування', value: a['Підсвічування:'] },
      ];
    case 'Вентилятори':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Розмір', value: a['Розмір:'] },
        { label: 'Швидкість обертання', value: a['Швидкість обертання:'] },
        { label: 'Рівень шуму', value: a['Рівень шуму:'] },
        { label: 'Підсвічування', value: a['Підсвічування:'] },
      ];
    case 'Кулери':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Тип', value: a['Тип:'] },
        { label: 'Сумісність сокетів', value: a['Сумісність сокетів:'] },
        { label: 'Максимальна швидкість', value: a['Максимальна швидкість:'] },
        { label: 'Рівень шуму', value: a['Рівень шуму:'] },
      ];
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
    case 'Гарнітура':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Тип підключення', value: a['Тип підключення:'] },
        { label: 'Тип навушників', value: a['Тип навушників:'] },
        { label: 'Мікрофон', value: a['Мікрофон:'] === '+' ? 'є' : 'немає' },
        { label: 'Довжина кабеля', value: a['Довжина кабеля:'] },
        { label: 'Колір', value: a['Колір:'] },
      ];
    case 'Комплекти (миша+клавіатура)':
      return [
        { label: 'Виробник', value: a['Виробник:'] },
        { label: 'Тип підключення', value: a['Тип підключення:'] },
        { label: 'Тип клавіш', value: a['Тип клавіш:'] },
        { label: 'Розкладка', value: a['Розкладка:'] },
        { label: 'Підсвітка', value: a['Підсвітка клавіш:'] === '+' ? 'є' : 'немає' },
        { label: 'Колір', value: a['Колір:'] },
      ];
    case 'Різне':
      return [
        { label: 'Категорія', value: a['Категорія:'] },
        { label: 'Тип', value: a['Тип:'] },
        { label: 'Виробник', value: a['Виробник:'] },
      ];
    case 'Готові ПК':
      return [
        { label: 'Відеокарта', value: a['Відеокарта'] },
        { label: 'Материнська плата', value: a['Материнська плата'] },
        { label: 'Накопичувач HDD', value: a['Накопичувач HDD'] },
        { label: 'Накопичувач SSD', value: a['Накопичувач SSD'] },
        { label: 'Процесор', value: a['Процесор'] },
        { label: "Тип пам'яті", value: a["Тип пам'яті"] },
        { label: "Оперативна пам’ять", value: a["Оперативна пам'ять"] },
      ];
    default:
      // Показати всі атрибути, якщо категорія не співпала
      return Object.entries(a).map(([key, value]) => ({
        label: key.replace(/:$/, ''),
        value
      }));
  }
}

// Hook for common product card functionality
function useProductCard() {
  const [favorites, setFavorites] = useState([]);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleToggleFavorite = (id) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ productId, quantity: 1 });
      setCartMessage('Додано в кошик!');
      setTimeout(() => setCartMessage(''), 1500);
    } catch (e) {
      setCartMessage('Помилка додавання в кошик');
      setTimeout(() => setCartMessage(''), 1500);
    }
  };

  return { favorites, cartMessage, handleToggleFavorite, handleAddToCart };
}

// Main ProductCard component for displaying PC products
export function ProductCard({ slice = [0, 5] }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartMessage, handleToggleFavorite, handleAddToCart } = useProductCard();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categories = await fetchAllCategories();
        const category = categories.find(cat => cat.name === "Готові ПК");
        if (!category) throw new Error("Категорію не знайдено");
        
        const data = await filterProducts({
          category: category.id,
          page: 1,
          limit: 10,
          sort: 'rating:desc'
        });
        
        const productsArray = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [];
        
        // Отримуємо деталі для кожного продукту
        const productsWithDetails = await Promise.all(
          productsArray.map(async (product) => {
            try {
              const details = await fetchProductDetails(product.id);
              return {
                ...product,
                ...details,
                img: (details.images && details.images.length > 0) 
                  ? details.images[0] 
                  : (product.images && product.images.length > 0)
                    ? product.images[0]
                    : '/placeholder.jpg',
                averageRating: calculateAverageRating(details.reviews || product.reviews || [])
              };
            } catch (error) {
              return product;
            }
          })
        );
        setProducts(productsWithDetails);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div>
      <div className="product-grid">
        {products.slice(...slice).map((product) => {
          const attrs = product.attributes || {};
          return (
            <div className="product-card" key={product.id} onClick={() => setSelectedProduct(product)} style={{cursor: 'pointer'}}>
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
                {product.discount && typeof product.discount === 'number' && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
                {product.discount && typeof product.discount === 'object' && product.discount.discount_percent && (
                  <span className="discount-badge">-{product.discount.discount_percent}%</span>
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
                  <li>Процесор: {attrs["Процесор"] || "Не вказано"}</li>
                  <li>Відеокарта: {attrs["Відеокарта"] || "Не вказано"}</li>
                  <li>Тип пам'яті: {attrs["Тип пам'яті"] || "Не вказано"}</li>
                  <li>Оперативна пам'ять: {attrs["Оперативна пам’ять"] || "Не вказано"}</li>
                  <li>Материнська плата: {attrs["Материнська плата"] || "Не вказано"}</li>
                  <li>Накопичувач: {attrs["Накопичувач"] || attrs["Накопичувач SSD"] || "Не вказано"}</li>
                </ul>
                <p className="product-price">{Number(product.price).toLocaleString('uk-UA')} ₴</p>
                <div className="product-actions">
                  <button
                    className={`product-button${product.stock === 0 ? ' disabled' : ''}`}
                    disabled={product.stock === 0}
                    onClick={e => { e.stopPropagation(); handleAddToCart(product.id); }}
                  >
                    {product.stock === 0 ? 'Немає в наявності' : 'В кошик'}
                  </button>
                  <button
                    className={`favorite-btn${isFavorite(product.id) ? ' active' : ''}`}
                    title={isFavorite(product.id) ? 'Видалити з обраного' : 'Додати в обране'}
                    onClick={e => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                  >
                    <img src={isFavorite(product.id) ? "/Обране(зірочка).png" : "/Обране(зірочка).png"} alt="favorite" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedProduct && (
        <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {cartMessage && <div className="cart-message">{cartMessage}</div>}
    </div>
  );
}

// Simple product card for various categories
export function SimpleProductCard({ product, category }) {
  const { cartMessage, handleToggleFavorite, handleAddToCart } = useProductCard();
  
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
          <button
            className={`product-button${product.stock === 0 ? ' disabled' : ''}`}
            disabled={product.stock === 0}
            onClick={() => handleAddToCart(product.id)}
          >
            {product.stock === 0 ? 'Немає в наявності' : 'Купити'}
          </button>
          <button
            className={`favorite-btn${isFavorite(product.id) ? ' active' : ''}`}
            title={isFavorite(product.id) ? 'Видалити з обраного' : 'Зберегти'}
            onClick={() => handleToggleFavorite(product.id)}
          >
            <img src={isFavorite(product.id) ? "/Обране(зірочка).png" : "/Обране(зірочка).png"} alt="favorite" />
          </button>
        </div>
        {cartMessage && <div className="cart-message">{cartMessage}</div>}
      </div>
    </div>
  );
}

// Product card item for system blocks and peripherals
export function ProductCardItem({ product: initialProduct, category, onClick }) {
  const [product, setProduct] = useState(initialProduct);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const { cartMessage, handleToggleFavorite, handleAddToCart } = useProductCard();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [details, productSpecs] = await Promise.all([
          fetchProductDetails(initialProduct.id),
          fetchProductSpecs(initialProduct.id)
        ]);
        setProduct(prev => ({
          ...prev,
          ...details,
          attributes: productSpecs,
          averageRating: calculateAverageRating(details.reviews || prev.reviews || [])
        }));
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    fetchDetails();
  }, [initialProduct.id]);

  const specs = getSpecsByCategory(product, category || 'Готові ПК');

  const handleBuyClick = async (e) => {
    e.stopPropagation(); // Prevent card click event
    setIsButtonClicked(true);
    await handleAddToCart(product.id);
    // Reset button state after animation
    setTimeout(() => {
      setIsButtonClicked(false);
    }, 300);
  };

  return (
    <div className="systemproduct-card" onClick={onClick} style={{cursor: 'pointer'}}>
      <div className="systemproduct-image-container">
        <img 
          src={product.images?.[0] || product.img || '/placeholder.jpg'}
          alt={product.name}
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
            e.target.onerror = null;
          }}
        />
        {product.stock > 0 && (
          <span className="stock-badge">В наявності</span>
        )}
        {product.discount && typeof product.discount === 'number' && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
        {product.discount && typeof product.discount === 'object' && product.discount.discount_percent && (
          <span className="discount-badge">-{product.discount.discount_percent}%</span>
        )}
      </div>
      <div className="systemproduct-info">
        <h3 className="systemproduct-title">{product.name}</h3>
        <div className="product-meta">
          <p className="product-sku">Код: {product.sku}</p>
          <div className="product-rating" title={`Рейтинг: ${product.averageRating || 0}/5`}>
            {renderStars(product.averageRating || 0)}
          </div>
        </div>
        <ul className="systemproduct-specs">
          {Object.entries(product.attributes || {}).slice(0, 6).map(([key, value], index) => (
            <li key={index}>
              {key}: {value || "Не вказано"}
            </li>
          ))}
        </ul>
        <p className="systemproduct-price">{Number(product.price).toLocaleString('uk-UA')} ₴</p>
        <div className="systemproduct-actions">
          <button
            className={`systemproduct-button${product.stock === 0 ? ' disabled' : ''}${isButtonClicked ? ' clicked' : ''}`}
            disabled={product.stock === 0}
            onClick={handleBuyClick}
          >
            {product.stock === 0 ? 'Немає в наявності' : 'В кошик'}
          </button>
          <button
            className={`favorite-btn${isFavorite(product.id) ? ' active' : ''}`}
            title={isFavorite(product.id) ? 'Видалити з обраного' : 'Додати в обране'}
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
          >
            <img src={isFavorite(product.id) ? "/Обране(зірочка).png" : "/Обране(зірочка).png"} alt="favorite" />
          </button>
        </div>
      </div>
      {cartMessage && (
        <div className="cart-message" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          {cartMessage}
        </div>
      )}
    </div>
  );
}