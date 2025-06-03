import React, { useState } from 'react';
import '../styles/AuthModal.css';
import { login, register } from '../api/accountApi';

export default function AuthModal({ onClose, setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    console.log(123321);
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const response = await login({ username: form.username, password: form.password });
        console.log('Login response:', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
        } else {
          console.warn('Token not found in login response');
        }
        setIsAuthenticated(true);
        onClose();
      } else {
        const response = await register({ username: form.username, email: form.email, password: form.password, phone: form.phone });
        console.log('Register response:', response);
        if (response.user.token) {
          localStorage.setItem('token', response.user.token);
        } else {
          console.warn('Token not found in register response');
        }
        setIsAuthenticated(true);
        onClose();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Сталася помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="auth-modal-body">
          <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Логін</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Зачекайте...' : isLogin ? 'Увійти' : 'Зареєструватися'}
            </button>
          </form>
          <div className="auth-toggle">
            {isLogin ? (
              <>
                Немає акаунта?{' '}
                <button className="toggle-btn" onClick={() => setIsLogin(false)} type="button">
                  Зареєструватися
                </button>
              </>
            ) : (
              <>
                Вже є акаунт?{' '}
                <button className="toggle-btn" onClick={() => setIsLogin(true)} type="button">
                  Увійти
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 