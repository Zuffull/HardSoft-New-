'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../styles/header.css';
import AuthModal from './AuthModal'; 

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Стан для перевірки автентифікації
  const [showAuthModal, setShowAuthModal] = useState(false); // Стан для показу модального вікна

  // Функція для відкриття/закриття модального вікна
  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
  };

  // Можна зберігати інформацію про користувача в локальному сховищі або в куках
  useEffect(() => {
    // Приклад перевірки автентифікації (можна замінити на перевірку токена чи куки)
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // Функція для виходу
  const handleLogout = () => {
    localStorage.removeItem('user'); // Очищаємо інформацію про користувача
    setIsAuthenticated(false); // Оновлюємо стан
  };

  return (
    <div className='Header'>
      <div className='header_line'>
        <div className='header_logo'>
          <img src='Logo.png' alt='Logo' />
        </div>
        <Link href='/'>
          <h1 className='Logo_name'>HardSoft</h1>
        </Link>
        <div className='adresa'>Україна, м. <br/>Шептицький</div>
        <div className="image-container">
          <img src="Rectangle 1.png" alt="Background" className="background-image" />
          <p className="overlay-text">вул. Стуса буд. 3</p>
        </div>
        <p className='Street'>Пн.-Пт. з 09:00 до 19:00 <br/>Сб. з 10:00 до 18:00 </p>
        <div className='button'>
          {isAuthenticated ? (
            // Кнопка профілю, якщо користувач увійшов
            <Link href='/profile'>
              <img src='ProfileIcon.png' alt='Профіль' />
            </Link>
          ) : (
            // Кнопка для входу/реєстрації, якщо користувач не увійшов
            <button onClick={toggleAuthModal}>
              <img src='Вхід.png' alt='Вхід'/>
            </button>
          )}
          <Link href='/favorites'>
            <img src='Вибране.png' alt='Обране'/>
          </Link>
          <Link href='/cart'>
            <img src='Кошик.png' alt='Кошик'/>
          </Link>
        </div>
      </div>

      {/* Модальне вікно для входу/реєстрації */}
      {showAuthModal && <AuthModal onClose={toggleAuthModal} setIsAuthenticated={setIsAuthenticated} />}
    </div>
  );
}
