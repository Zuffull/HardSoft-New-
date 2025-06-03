'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Categories from '../../components/Categories';
import Footer from '../../components/Footer';
import { getProfile, createOrder, updateAddress, getAddresses, addAddress } from '../../api/accountApi';
import { getCart, clearCart } from '../../api/cartApi';

export default function Checkout() {
  const [form, setForm] = useState({
    city: '',
    address: '',
    comment: '',
    postalCode: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    async function fetchProfileAndCart() {
      try {
        // Отримати профіль
        const profileData = await getProfile();
        const user = profileData.profile || profileData.user || profileData;
        setForm(f => ({
          ...f,
          name: user.username || '',
          phone: user.phone || '',
          email: user.email || ''
        }));
        setProfileLoaded(true);
      } catch (e) {
        // Якщо не авторизований, просто не заповнюємо
        setProfileLoaded(true);
      }
      try {
        // Отримати товари з кошика
        const cartData = await getCart();
        setCartItems(cartData.cart?.items || []);
      } catch (e) {
        setError('Не вдалося отримати кошик');
      }
    }
    fetchProfileAndCart();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.city.trim()) return 'Введіть місто';
    if (!form.address.trim()) return 'Введіть адресу';
    if (!form.postalCode.trim()) return 'Введіть поштовий індекс';
    if (cartItems.length === 0) return 'Кошик порожній';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const err = validate();
    if (err) return setError(err);
    setSubmitting(true);
    try {
      // 1. Перевіряємо, чи є адреса
      const addressesData = await getAddresses();
      const addresses = Array.isArray(addressesData.addresses) ? addressesData.addresses : addressesData;
      if (addresses && addresses.length > 0) {
        // Оновлюємо першу адресу
        await updateAddress({
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          isDefault: true
        });
      } else {
        // Додаємо нову адресу
        await addAddress({
          address: form.address,
          city: ч,
          postalCode: form.postalCode,
          isDefault: true
        });
      }
      // 2. Створюємо замовлення лише з paymentMethod
      await createOrder({ paymentMethod });
      setSuccess('Замовлення успішно оформлено! Наш менеджер звʼяжеться з вами.');
      setForm({ city: '', address: '', comment: '', postalCode: '' });
      await clearCart();
      setCartItems([]);
    } catch (e) {
      setError('Не вдалося оформити замовлення');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Categories />
      <div style={{
        maxWidth: 500,
        margin: '40px auto',
        background: 'linear-gradient(135deg, #23272f 80%, #2d323c 100%)',
        borderRadius: 18,
        padding: 32,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        color: '#f3f6fa',
        border: '1.5px solid #23272f',
      }}>
        <h1 style={{marginBottom:24, color:'#fff'}}>Оформлення замовлення</h1>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <input name="city" value={form.city} onChange={handleChange} placeholder="Місто*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Адреса доставки*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Поштовий індекс*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Коментар до замовлення (необовʼязково)" rows={3} style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <label style={{display:'flex',alignItems:'center',gap:4}}>
              <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod==='cash'} onChange={()=>setPaymentMethod('cash')} /> Готівка
            </label>
            <label style={{display:'flex',alignItems:'center',gap:4}}>
              <input type="radio" name="paymentMethod" value="card" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} /> Картка
            </label>
          </div>
          {error && <div style={{color:'#ff6b6b',marginTop:4}}>{error}</div>}
          {success && <div style={{color:'#4caf50',marginTop:4}}>{success}</div>}
          <button type="submit" className="cart-btn" style={{marginTop:8,background:'linear-gradient(90deg,#4f8cff 0%,#2355d8 100%)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,fontSize:17,boxShadow:'0 2px 8px rgba(79,140,255,0.10)'}} disabled={submitting}>{submitting ? 'Відправка...' : 'Підтвердити замовлення'}</button>
        </form>
        <Link href="/cart" style={{display:'block',marginTop:24,textAlign:'center',color:'#8fa7d8'}}>Повернутися до кошика</Link>
      </div>
      <Footer />
    </>
  );
} 