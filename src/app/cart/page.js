'use client';
import Header from '@/components/Header';
import Categories from '@/components/Categories';
import '@/styles/Cart.css';
import { useState, useEffect } from 'react';

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'ПК Intel Core i5 / RTX 3060',
      image: 'https://picsum.photos/300/200?random=1',
      price: 1000,
      quantity: 1,
    },
    {
      id: 2,
      name: 'ПК AMD Ryzen 7 / RTX 3090',
      image: 'https://picsum.photos/300/200?random=2',
      price: 4000,
      quantity: 2,
    },
  ]);

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Header />
      <Categories />
      <div className="cart-container">
        <h1>Ваш кошик</h1>
        {cartItems.length === 0 ? (
          <p>Кошик порожній.</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h2>{item.name}</h2>
                    <p>Кількість: {item.quantity}</p>
                    <p>Ціна: ₴{item.price}</p>
                    <p>Сума: ₴{item.price * item.quantity}</p>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>Видалити</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h2>Загальна сума: ₴{total}</h2>
              <button className="checkout-btn">Оформити замовлення</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
