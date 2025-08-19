"use client";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { getProfile, updateProfile, getOrders, getToken } from "../../api/accountApi";
import { getUserConfigurations } from "../../api/configuratorAPI";
import { useRouter } from "next/navigation";
import Categories from "../../components/Categories";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [builds, setBuilds] = useState([]);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [buildsError, setBuildsError] = useState("");

  useEffect(() => {

    console.log(123);
    console.log(getToken());
    console.log(123);

    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const data = await getProfile();
        console.log("PROFILE RESPONSE:", data);
        const userData = data.profile || data.user || data;
        setProfile(userData);
        setForm({
          username: userData.username || "",
          email: userData.email || ""
        });
      } catch (e) {
        setError("Не вдалося отримати профіль");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // --- Завантаження замовлень ---
    async function fetchOrders() {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const data = await getOrders();
        setOrders(Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : []);
      } catch (e) {
        setOrdersError("Не вдалося отримати замовлення");
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
    // --- Завантаження збірок ---
    async function fetchBuilds() {
      setBuildsLoading(true);
      setBuildsError("");
      try {
        const data = await getUserConfigurations();
        setBuilds(Array.isArray(data.configurations) ? data.configurations : Array.isArray(data) ? data : []);
      } catch (e) {
        setBuildsError("Не вдалося отримати збірки");
      } finally {
        setBuildsLoading(false);
      }
    }
    fetchBuilds();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateProfile({ ...form, role: profile.role });
      setSuccess("Профіль оновлено!");
      setEdit(false);
      // Оновити дані профілю з бекенду
      const data = await getProfile();
      const userData = data.profile || data.user || data;
      setProfile(userData);
      setForm({
        username: userData.username || "",
        email: userData.email || ""
      });
    } catch (e) {
      setError("Не вдалося оновити профіль");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) return <div><Header /><div style={{padding:32}}>Завантаження...</div></div>;
  if (error) return <div><Header /><div style={{padding:32, color:'red'}}>{error}<br/><button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} style={{marginTop:16, background:'#ff8001', color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Вийти з акаунту</button></div></div>;
  if (!profile) return <div><Header /><div style={{padding:32}}>Профіль не знайдено<br/><button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} style={{marginTop:16, background:'#ff8001', color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Вийти з акаунту</button></div></div>;

  return (
    <div style={{ }}>
      <Header />
      <Categories />
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '70vh',
          gap: 32,
          flexWrap: 'wrap',
          padding: '32px 0',

        }}
      >
        {/* --- Мої замовлення --- */}
        <section
          style={{
            flex: '1 1 340px',
            maxWidth: 400,
            background: '#262626',
            borderRadius: 18,
            padding: 24,
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
            color: '#fff',
            minWidth: 260,
            border: '1.5px solid #232323',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.3rem', color: '#ff8001', letterSpacing: '-1px', fontWeight: 700 }}>
            Мої замовлення
          </h3>
          {ordersLoading ? (
            <div>Завантаження...</div>
          ) : ordersError ? (
            <div style={{ color: '#ff8001' }}>{ordersError}</div>
          ) : orders.length === 0 ? (
            <div style={{ color: '#bbb' }}>У вас ще немає замовлень</div>
          ) : (
            <table style={{ width: '100%', color: '#fff', background: 'none', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff8001', background: '#232323' }}>
                  <th style={{ textAlign: 'left', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>№</th>
                  <th style={{ textAlign: 'left', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>Дата</th>
                  <th style={{ textAlign: 'left', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>Статус</th>
                  <th style={{ textAlign: 'right', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>Сума</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id || idx} style={{ borderBottom: '1px solid #333', background: idx % 2 === 0 ? '#232323' : '#262626' }}>
                    <td style={{ padding: '7px 4px' }}>{order.id || idx + 1}</td>
                    <td style={{ padding: '7px 4px' }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '7px 4px', color: order.status === 'completed' ? '#ff8001' : '#fff' }}>{order.status || '-'}</td>
                    <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 600 }}>{order.total ? `${order.total} ₴` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {/* --- Профіль по центру --- */}
        <div
          style={{
            flex: '1 1 340px',
            maxWidth: 420,
            minWidth: 320,
            background: '#262626',
            borderRadius: 28,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.22)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
            border: '1.5px solid #232323',
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff8001 0%, #262626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
            }}
          >
            <svg width="56" height="56" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" fill="#fff" />
              <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" fill="#fff" />
            </svg>
          </div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '2rem', color: '#ff8001', letterSpacing: '-1px' }}>
            Профіль
          </h2>
          {success && (
            <div style={{ color: '#ff8001', marginBottom: 4, fontWeight: 500 }}>{success}</div>
          )}
          {edit ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
              <label style={{ fontWeight: 500, color: '#ff8001', marginBottom: 2 }}>
                Логін:
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    border: '1.5px solid #ff8001',
                    marginTop: 6,
                    fontSize: 16,
                    background: '#232323',
                    color: '#fff',
                    transition: 'border 0.2s',
                  }}
                />
              </label>
              <label style={{ fontWeight: 500, color: '#ff8001', marginBottom: 2 }}>
                Email:
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    border: '1.5px solid #ff8001',
                    marginTop: 6,
                    fontSize: 16,
                    background: '#232323',
                    color: '#fff',
                    transition: 'border 0.2s',
                  }}
                />
              </label>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg,#ff8001 0%,#262626 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 0',
                  fontWeight: 700,
                  marginTop: 8,
                  fontSize: 16,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Зберегти
              </button>
              <button
                type="button"
                onClick={() => setEdit(false)}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 0',
                  fontWeight: 500,
                  fontSize: 16,
                  marginTop: 2,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Скасувати
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              <div style={{ fontWeight: 600, color: '#ff8001', fontSize: 18, marginBottom: 2 }}>
                <span style={{ color: '#ff8001' }}>Логін:</span> {profile.username}
              </div>
              <div style={{ fontWeight: 500, color: '#fff', fontSize: 16 }}>
                <span style={{ color: '#ff8001' }}>Email:</span> {profile.email}
              </div>
              <div style={{ fontWeight: 500, color: '#fff', fontSize: 16 }}>
                <span style={{ color: '#ff8001' }}>Телефон:</span> {profile.phone || '-'}
              </div>
              <div style={{ fontWeight: 500, color: '#fff', fontSize: 16 }}>
                <span style={{ color: '#ff8001' }}>Роль:</span> {profile.role}
              </div>
              <button
                style={{
                  marginTop: 22,
                  background: 'linear-gradient(90deg,#ff8001 0%,#262626 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 0',
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setEdit(true)}
              >
                Редагувати
              </button>
              <button
                style={{
                  marginTop: 8,
                  background: '#ff8001',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 0',
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={handleLogout}
              >
                Вийти з акаунту
              </button>
            </div>
          )}
        </div>
        {/* --- Мої збірки --- */}
        <section
          style={{
            flex: '1 1 340px',
            maxWidth: 400,
            background: '#262626',
            borderRadius: 18,
            padding: 24,
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
            color: '#fff',
            minWidth: 260,
            border: '1.5px solid #232323',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.3rem', color: '#ff8001', letterSpacing: '-1px', fontWeight: 700 }}>
            Мої збірки
          </h3>
          {buildsLoading ? (
            <div>Завантаження...</div>
          ) : buildsError ? (
            <div style={{ color: '#ff8001' }}>{buildsError}</div>
          ) : builds.length === 0 ? (
            <div style={{ color: '#bbb' }}>У вас ще немає збережених збірок</div>
          ) : (
            <table style={{ width: '100%', color: '#fff', background: 'none', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff8001', background: '#232323' }}>
                  <th style={{ textAlign: 'left', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>Назва</th>
                  <th style={{ textAlign: 'left', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>Дата</th>
                  <th style={{ textAlign: 'left', padding: '7px 4px', color: '#ff8001', fontWeight: 700 }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {builds.map((build, idx) => (
                  <tr key={build.id || idx} style={{ borderBottom: '1px solid #333', background: idx % 2 === 0 ? '#232323' : '#262626' }}>
                    <td style={{ padding: '7px 4px' }}>{build.name || `Збірка ${build.id || idx + 1}`}</td>
                    <td style={{ padding: '7px 4px' }}>{build.createdAt ? new Date(build.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '7px 4px', color: build.status === 'saved' ? '#ff8001' : '#fff' }}>{build.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
} 