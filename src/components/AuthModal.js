'use client';
import React, { useState } from 'react';
import '../styles/AuthModal.css';

export default function AuthModal({ onClose, setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ firstName: '', lastName: '', phoneNumber: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const data = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Збереження даних користувача в localStorage (або куки)
        localStorage.setItem('user', JSON.stringify(responseData.user));

        // Оновлюємо стан автентифікації на сторінці
        setIsAuthenticated(true);
        onClose();
        alert(isLogin ? 'Успішно увійшли!' : 'Успішно зареєстровано!');
      } else {
        throw new Error('Помилка при ' + (isLogin ? 'вході' : 'реєстрації') + '. Перевірте введені дані!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <button className="close-btn" onClick={onClose}>X</button>
        </div>
        <div className="auth-modal-body">
          <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName">Ім'я:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Введіть ім'я"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Прізвище:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Введіть прізвище"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Номер телефону:</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Введіть номер телефону"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Введіть email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Введіть пароль"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Зачекайте...' : isLogin ? 'Увійти' : 'Зареєструватися'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          {isLogin ? (
            <div className="auth-toggle">
              <span>Немає акаунту?</span>
              <button onClick={toggleAuthMode} className="toggle-btn">
                Зареєструватися
              </button>
              <div className="forgot-password">
                <a href="/forgot-password">Забули пароль?</a>
              </div>
            </div>
          ) : (
            <div className="auth-toggle">
              <span>Вже є акаунт?</span>
              <button onClick={toggleAuthMode} className="toggle-btn">
                Вхід
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
