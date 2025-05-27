'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Categories from '../../components/Categories';
import Footer from '../../components/Footer';

export default function Checkout() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    comment: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return 'Введіть ПІБ';
    if (!/^\+?\d{10,15}$/.test(form.phone.trim())) return 'Введіть коректний телефон';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return 'Введіть коректний email';
    if (!form.city.trim()) return 'Введіть місто';
    if (!form.address.trim()) return 'Введіть адресу';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const err = validate();
    if (err) return setError(err);
    setSubmitting(true);
    // Тут можна відправити дані на бекенд
    setTimeout(() => {
      setSuccess('Замовлення успішно оформлено! Наш менеджер звʼяжеться з вами.');
      setSubmitting(false);
      setForm({ name: '', phone: '', email: '', city: '', address: '', comment: '' });
    }, 1200);
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
          <input name="name" value={form.name} onChange={handleChange} placeholder="ПІБ*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <input name="city" value={form.city} onChange={handleChange} placeholder="Місто*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Адреса доставки*" required style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
          <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Коментар до замовлення (необовʼязково)" rows={3} style={{padding:12,borderRadius:10,border:'1.5px solid #444',background:'#23272f',color:'#f3f6fa',fontSize:16}} />
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