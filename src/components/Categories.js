import Link from 'next/link';
import '../styles/Categories.css';

export default function Categories() {
  const categories = [
    { name: 'Системні блоки', href: '/system-blocks', img: 'Систем.Блок.png' },
    { name: 'Конфігуратор', href: '/configurator', img: 'Конфігуратор.png' },
    { name: 'Периферія', href: '/peripherals', img: 'периферія.png' },
    { name: 'Комплектуючі', href: '/components', img: 'Комплектуючі.png' },
    { name: 'Контакти', href: '/contacts', img: 'Контакти.png' },
  ];

  return (
    <div className='categories'>
      <ul className='categories_list'>
        {categories.map((cat, index) => (
          <li key={index} className='category_item'>
            <Link href={cat.href}>
              <div className='category_link'>
                <img src={cat.img} alt={cat.name} className='category_icon' />
                <span>{cat.name}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
