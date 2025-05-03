import '../styles/header.css';
import Link from 'next/link';

export default function Header() {
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