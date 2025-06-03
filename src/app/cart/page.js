'use client';
import Header from '../../components/Header';
import Categories from '../../components/Categories';
import '../../styles/Cart.css';
import { useState, useEffect } from 'react';
import { getCart, addToCart, updateCart, clearCart } from '../../api/cartApi';
import { fetchProductDetails } from '../../api/productApiV2';
import Link from 'next/link';
import { getConfigurationDetails } from '../../api/configuratorAPI';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Завантаження кошика з бекенду при монтуванні
  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCart();
        console.log('CART DATA:', data);
        console.log('CART ITEMS:', data.cart.items);
        // Для кожного товару отримати повний продукт (ціна, фото, назва)
        const itemsWithDetails = await Promise.all(
          (data.cart.items || []).map(async (item) => {
            if (item.product_id == null) {
              try {
                // Отримуємо деталі збірки
                const buildDetails = await getConfigurationDetails(item.id);
                console.log('BUILD DETAILS:', buildDetails);

                return {
                  ...item,
                  product: {
                    id: buildDetails.id,
                    name: buildDetails.name || `Збірка #${buildDetails.id}`,
                    image: '/pc-build.png',
                    is_build: true,
                    total_price: buildDetails.total_price,
                    build_items: buildDetails.build_items || []
                  }
                };
              } catch (error) {
                console.error('Помилка отримання деталей збірки:', error);
                return {
                  ...item,
                  product: {
                    image: '/versum_corps-icon-98x98-40-40-40.png',
                    price: 0,
                    name: `Збірка #${item.id}`,
                    is_build: true,
                    total_price: item.total || 0
                  }
                };
              }
            }
            // Визначаємо productId з різних можливих полів, включаючи product_id
            const productId = item.product_id || item.product?.id || item.productId || item.id;
            try {
              const product = await fetchProductDetails(productId);
              console.log('PRODUCT DETAILS:', product);
              let image = Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : null;
              if (!image) {
                const images = await fetchProductImages(productId);
                image = images[0]?.url || '/placeholder.jpg';
              }
              return {
                ...item,
                product: {
                  ...product,
                  image
                }
              };
            } catch {
              return {
                ...item,
                product: {
                  image: '/placeholder.jpg',
                  price: 0,
                  name: 'Товар'
                }
              };
            }
          })
        );
        setCartItems(itemsWithDetails);
      } catch (e) {
        setError('Не вдалося завантажити кошик');
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  // Оновлення кількості товару
  const changeQuantity = async (id, newQuantity) => {
    try {
      setUpdatingItemId(id);
      const item = cartItems.find(i => i.id === id);
      const productId = item?.product_id || item?.product?.id || item?.productId || item?.id;
      await updateCart({ productId, quantity: newQuantity });
      setCartItems(items => items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (e) {
      setError('Не вдалося оновити кількість');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Видалення товару (кількість = 0)
  const removeItem = async (id) => {
    setUpdatingItemId(id);
    await changeQuantity(id, 0);
    setCartItems(items => items.filter(item => item.id !== id));
    setUpdatingItemId(null);
  };

  // Очищення кошика з підтвердженням
  const handleClearCart = async () => {
    if (!window.confirm('Ви впевнені, що хочете очистити кошик?')) return;
    try {
      setLoading(true);
      await clearCart();
      setCartItems([]);
      setSuccess('Кошик успішно очищено!');
    } catch (e) {
      setError('Не вдалося очистити кошик');
    } finally {
      setLoading(false);
    }
  };

  const getItemPrice = (item) => {
    console.log('ITEM:', item);
    // Якщо це збірка
    if (item.product?.is_build) {
      return item.product.total_price || item.total || 0;
    }
    // Для звичайних товарів
    if (typeof item.price === 'number' && !isNaN(item.price)) return item.price;
    if (typeof item.product?.price === 'number' && !isNaN(item.product.price)) return item.product.price;
    if (typeof item.product?.price === 'string') return parseFloat(item.product.price) || 0;
    return 0;
  };

  const total = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  const handleCheckout = () => {
    setSuccess('Дякуємо за замовлення! (Демо)');
    handleClearCart();
  };

  return (
    <>
      <Header />
      <Categories />
      <div className="cart-container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 className="cart-title">Ваш кошик</h1>
          <Link href="/" className="cart-btn" style={{textDecoration:'none',padding:'8px 18px',fontSize:'1rem'}}>Повернутися до покупок</Link>
        </div>
        {loading ? (
          <p>Завантаження...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : success ? (
          <p style={{ color: 'green' }}>{success}</p>
        ) : cartItems.length === 0 ? (
          <p>Кошик порожній.</p>
        ) : (
          <>
            <button className="cart-btn" style={{marginBottom:12}} onClick={handleClearCart}>Очистити кошик</button>
            <div className="cart-items">
              {cartItems.map(item => {
                const price = getItemPrice(item);
                return (
                  <div className="cart-item" key={item.id}>
                    <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.product.name}</div>
                      {item.product.is_build && item.product.build_items && (
                        <div className="cart-build-items">
                          <div style={{fontSize: '0.9em', color: '#666', marginTop: '8px', marginBottom: '4px'}}>Компоненти збірки:</div>
                          {item.product.build_items.map((buildItem, index) => (
                            <div key={index} style={{fontSize: '0.85em', color: '#444', marginLeft: '12px'}}>
                              • {buildItem.product?.name || 'Невідомий компонент'} - ₴{buildItem.product?.price || 0}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="cart-actions">
                        <button onClick={() => changeQuantity(item.id, item.quantity - 1)} className="cart-btn cart-btn-qty" disabled={item.quantity <= 1 || updatingItemId === item.id}>−</button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.id, item.quantity + 1)} className="cart-btn cart-btn-qty" disabled={updatingItemId === item.id}>+</button>
                        <button className="cart-btn cart-btn-remove" onClick={() => removeItem(item.id)} disabled={updatingItemId === item.id}>Видалити</button>
                      </div>
                      <div className="cart-item-price">Ціна: <span className="cart-price">₴{price}</span></div>
                      <div className="cart-item-sum">Сума: <span className="cart-sum">₴{price * item.quantity}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-summary">
              <div className="cart-summary-label">Загальна сума:</div>
              <div className="cart-summary-value">₴{total}</div>
              <Link href="/checkout" className="cart-btn" style={{display:'inline-block',textAlign:'center',marginTop:12}}>Оформити замовлення</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
