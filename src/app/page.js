import Header from '../components/Header';
import Categories from '../components/Categories';
import ProductCard from '../components/ProductCard';
import ConfiguratorSection from '../components/ConfiguratorSection';
import ProductCard2 from '../components/ProductCard2';
import Footer from '../components/Footer';
import '../styles/StyleMainpage.css';
import React from 'react';

export default function Home() {
  return (
    <div>
      <Header />
      <Categories />
      <ProductCard />
      <ConfiguratorSection />
      <ProductCard2 />
      <main className="Main"> 
        <div className="Text">
        <div className="BlurCircle"></div>
        <p className='Text'>
          Компанія <span className="highlight">HardSoft</span> – це експерти у світі персональних комп’ютерів. Ми спеціалізуємось на збірці ПК під ключ, підбираючи найкращі комплектуючі для геймерів, творців контенту та професіоналів.
          <br/>
          🎮 Геймінг без компромісів – створюємо потужні ігрові машини, що витримують будь-які навантаження
          <br/> ⚙️ Максимальна продуктивність – зберемо ПК для роботи, навчання та складних задач
          <br/>💡 Індивідуальний підхід – підбір конфігурації відповідно до ваших вимог
          <br/>🚀 Швидка збірка та доставка – завжди на зв’язку та готові до роботи<br/>
          Ми аналізуємо новітні технології та використовуємо лише перевірені компоненти, щоб ваш комп’ютер відповідав сучасним стандартам продуктивності та надійності.
          <br/>
          <span className="highlight">HardSoft</span> – коли важливий кожен FPS та кожен гігагерц! 🔥
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};