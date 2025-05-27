'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../styles/header.css';
import AuthModal from './AuthModal'; 

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Стан для перевірки автентифікації
  const [showAuthModal, setShowAuthModal] = useState(false); // Стан для показу модального вікна
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: ""
  });

  // Функція для відкриття/закриття модального вікна
  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
  };

  // Можна зберігати інформацію про користувача в локальному сховищі або в куках
  useEffect(() => {
    // Перевіряємо наявність токена
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const data = await getProfile();
        console.log("PROFILE RESPONSE:", data);
        setProfile(data.user || data);
        setForm({
          username: data.user?.username || data.username || "",
          email: data.user?.email || data.email || ""
        });
      } catch (e) {
        setError("Не вдалося отримати профіль");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Функція для виходу
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
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
            <Link href='/profile' style={{display:'flex',alignItems:'center',justifyContent:'center',width:40,height:40}}>
              <span style={{display:'inline-flex',width:32,height:32}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" fill="#4f8cff"/>
                  <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" fill="#4f8cff"/>
                </svg>
              </span>
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
