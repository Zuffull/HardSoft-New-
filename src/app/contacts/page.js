'use client';
import Header from '../../components/Header.js';
import Footer from '../../components/Footer.js';
import Categories from '../../components/Categories.js';
import React from 'react';
import '../../styles/Contacts.css';

export default function ContactsPage() {
  return (
    <>
      <Header />
      <Categories />
      <main style={{ minHeight: '60vh', padding: '32px 0', }}>
        <div className="contacts-container">
          <h1 className="contacts-title">Контакти</h1>
          <div className="contacts-info">
            <p><b>Телефон:</b> <a href="tel:+380991234567">+38 (099) 123-45-67</a></p>
            <p><b>Email:</b> <a href="mailto:info@hardsoft.ua">info@hardsoft.ua</a></p>
            <p><b>Адреса:</b> м. Київ, вул. Прикладна, 1</p>
            <p><b>Графік роботи:</b> Пн-Пт 10:00-19:00, Сб-Нд 11:00-17:00</p>
            <p><b>Ми у соцмережах:</b></p>
            <ul className="contacts-socials">
              <li><a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer"><span className="contacts-icon">📘</span> Facebook</a></li>
              <li><a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer"><span className="contacts-icon">📸</span> Instagram</a></li>
              <li><a href="https://t.me/yourpage" target="_blank" rel="noopener noreferrer"><span className="contacts-icon">✈️</span> Telegram</a></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 