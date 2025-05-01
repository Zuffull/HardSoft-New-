import './favoritespage.css';
import Link from 'next/link';

export default function FavoritesPage() {
    return (
      <div className='Header'>
        <div className='header_line'>
          <div className='header_logo'>
            <img src='Logo.png' alt='Logo' />
          </div>
          <h1 className='Logo_name'>HardSoft</h1>
            <div className='adresa'>Україна, м. <br/>Шептицький</div>
          <p className='Street'>вул. Стуса буд. 3</p>
          <p className='Street'>Пн.-Пт. з 09:00 до 19:00 <br/>Сб. з 10:00 до 18:00 </p>
          <div className='button'>
          <Link href='#'>
            <img src='Вхід.png' alt='Вхід'/>
          </Link>
          <Link href='/favorites'>
            <img src='Вибране.png' alt='Обране'/>
          </Link>
            <Link href='/cart'>
              <img src='Кошик.png' alt='Кошик'/>
            </Link>
          </div>
        </div>
      </div>
    );
  }