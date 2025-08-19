import '../styles/Footer.css';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h3>Системні блоки</h3>
                    <ul>
                        <li><Link href="/ready-pc">Готові ПК</Link></li>
                        <li><Link href="/budget-options">Бюджетні варіанти</Link></li>
                        <li><Link href="/all">Усі</Link></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Периферія</h3>
                    <ul>
                        <li><Link href="/monitors">Монітори</Link></li>
                        <li><Link href="/mice">Миші</Link></li>
                        <li><Link href="/keyboards">Клавіатури</Link></li>
                        <li><Link href="/sets">Комплекти (миші+клавіатура)</Link></li>
                        <li><Link href="/surfaces">Поверхні</Link></li>
                        <li><Link href="/headsets">Гарнітура</Link></li>
                        <li><Link href="/acoustics">Акустика</Link></li>
                        <li><Link href="/webcams">Веб-камери</Link></li>
                        <li><Link href="/network-equipment">Мережеве обладнання</Link></li>
                        <li><Link href="/miscellaneous">Різне</Link></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Комплектуючі</h3>
                    <ul>
                        <li><Link href="/processors">Процесори</Link></li>
                        <li><Link href="/coolers">Кулери</Link></li>
                        <li><Link href="/motherboards">Материнські плати</Link></li>
                        <li><Link href="/graphics-cards">Відеокарти</Link></li>
                        <li><Link href="/ram">Оперативна пам'ять</Link></li>
                        <li><Link href="/ssd">SSD пам'ять</Link></li>
                        <li><Link href="/hdd">HDD накопичувач</Link></li>
                        <li><Link href="/power-supplies">Блоки живлення</Link></li>
                        <li><Link href="/fans">Вентилятори</Link></li>
                        <li><Link href="/cases">Корпуси</Link></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Інформація</h3>
                    <ul>
                        <li><Link href="/warranty-terms">Умови гарантії</Link></li>
                        <li><Link href="/delivery-terms">Умови доставки</Link></li>
                        <li><Link href="/payment-terms">Умови оплати</Link></li>
                        <li><Link href="/return-policy">Політика повернення</Link></li>
                        <li><Link href="/about-us">Про компанію</Link></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Контакти</h3>
                    <ul>
                        <li>Україна, м. Шептицький, вул. Стуса 15</li>
                        <li>Пн.-Пт. з 09:00 до 19:00</li>
                        <li>Сб. з 10:10 до 18:00</li>
                        <li><a href="tel:+380684013108">+380 68 401 3108</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}