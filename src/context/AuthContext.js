import React, { createContext, useContext, useState, useEffect } from 'react';

// Створення контексту
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (data) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      localStorage.setItem('user', JSON.stringify(responseData.user)); // Зберігаємо дані в localStorage
      setUser(responseData.user);
    } else {
      throw new Error('Помилка при вході. Перевірте введені дані.');
    }
  };

  const register = async (data) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      localStorage.setItem('user', JSON.stringify(responseData.user)); // Зберігаємо дані в localStorage
      setUser(responseData.user);
    } else {
      throw new Error('Помилка при реєстрації. Перевірте введені дані.');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
