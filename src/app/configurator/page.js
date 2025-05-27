'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import Footer from '../../components/Footer.js';
import '../../styles/configurator.css';
import {
  fetchConfiguratorCategories,
  fetchCategoryAttributes,
  fetchAttributeValues,
  fetchCategoryProducts,
  getUserConfigurations,
  createConfiguration,
  getConfigurationDetails,
  updateConfiguration,
  saveConfiguration,
  deleteConfiguration,
  addItemToConfiguration,
  deleteConfigurationItem,
  getCompatibleProducts,
} from '../../api/configuratorAPI.js';
import Categories from '../../components/Categories.js';

const ALLOWED_CATEGORIES = [
  'Процесори',
  'Кулери',
  'Материнські плати',
  "Оперативна пам'ять",
  'Відеокарти',
  'SSD накопичувачі',
  'HDD накопичувачі',
  'Блоки живлення',
  'Корпуси',
  'Вентилятори',
  'Додаткові кабелі',
  'WiFi адаптер',
  'Операційна система',
];

export default function ConfiguratorPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [build, setBuild] = useState({});
  const [buildId, setBuildId] = useState(null);
  const [buildStatus, setBuildStatus] = useState('draft');
  const [userBuilds, setUserBuilds] = useState([]);
  const [message, setMessage] = useState('');
  const [compatibleProducts, setCompatibleProducts] = useState([]);

  // Завантажити всі категорії комплектуючих
  useEffect(() => {
    fetchConfiguratorCategories().then(all => {
      const filtered = all.filter(cat => ALLOWED_CATEGORIES.includes(cat.name));
      setCategories(filtered);
      if (filtered.length > 0) setSelectedCategory(filtered[0]);
    });
  }, []);

  // Завантажити збірки користувача
  useEffect(() => {
    getUserConfigurations().then(setUserBuilds).catch(() => setUserBuilds([]));
  }, []);

  // Завантажити атрибути для вибраної категорії
  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    fetchCategoryAttributes(selectedCategory.id).then(attrs => {
      setAttributes(attrs);
      Promise.all(
        attrs.map(attr =>
          fetchAttributeValues(selectedCategory.id, attr.id).then(values => ({ [attr.id]: values }))
        )
      ).then(valuesArr => {
        const valuesObj = valuesArr.reduce((acc, v) => ({ ...acc, ...v }), {});
        setAttributeValues(valuesObj);
      });
    }).finally(() => setLoading(false));
  }, [selectedCategory]);

  // Завантажити товари для категорії з фільтрами
  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    let filter = {};
    Object.entries(selectedFilters).forEach(([attrId, value]) => {
      if (value) filter[attrId] = value;
    });
    fetchCategoryProducts({
      filter,
      limit: 12,
      page: 1,
      categoryId: selectedCategory.id,
    })
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, [selectedFilters, selectedCategory]);

  // --- BUILD CRUD ---
  const handleCreateBuild = async () => {
    try {
      const build = await createConfiguration({ name: `Збірка ${Date.now()}` });
      setBuildId(build.id);
      setBuildStatus(build.status);
      setBuild({});
      setMessage('Створено нову збірку!');
      setUserBuilds(prev => [...prev, build]);
    } catch (e) {
      setMessage('Помилка створення збірки');
    }
  };

  const handleLoadBuild = async (id) => {
    try {
      const data = await getConfigurationDetails(id);
      setBuildId(data.id);
      setBuildStatus(data.status);
      // Формуємо build: {categoryName: product}
      const buildObj = {};
      (data.items || []).forEach(item => {
        if (item.product && item.product.category && item.product.category.name) {
          buildObj[item.product.category.name] = item.product;
        }
      });
      setBuild(buildObj);
      setMessage('Збірку завантажено!');
    } catch (e) {
      setMessage('Помилка завантаження збірки');
    }
  };

  const handleDeleteBuild = async () => {
    if (!buildId) return;
    try {
      await deleteConfiguration(buildId);
      setBuildId(null);
      setBuild({});
      setBuildStatus('draft');
      setUserBuilds(userBuilds.filter(b => b.id !== buildId));
      setMessage('Збірку видалено!');
    } catch (e) {
      setMessage('Помилка видалення збірки');
    }
  };

  const handleSaveBuild = async () => {
    if (!buildId) return;
    try {
      await saveConfiguration(buildId);
      setBuildStatus('saved');
      setMessage('Збірку збережено!');
    } catch (e) {
      setMessage('Помилка збереження збірки');
    }
  };

  // --- Додавання/видалення компонентів через API ---
  const handleAddToBuild = async (product) => {
    if (!buildId) {
      setMessage('Створіть або завантажте збірку!');
      return;
    }
    try {
      await addItemToConfiguration(buildId, { productId: product.id });
      setBuild(prev => ({ ...prev, [selectedCategory.name]: product }));
      setMessage('Додано до збірки!');
    } catch (e) {
      setMessage('Помилка додавання до збірки');
    }
  };

  const handleRemoveFromBuild = async (categoryName) => {
    if (!buildId) {
      setBuild(prev => {
        const copy = { ...prev };
        delete copy[categoryName];
        return copy;
      });
      return;
    }
    // Знайти itemId для видалення
    try {
      const details = await getConfigurationDetails(buildId);
      const item = (details.items || []).find(i => i.product && i.product.category && i.product.category.name === categoryName);
      if (item) {
        try {
          await deleteConfigurationItem(buildId, item.id);
        } catch (e) {
          setMessage('Помилка видалення компонента на сервері, але видалено з UI');
        }
      } else {
        setMessage('Компонент не знайдено на сервері, але видалено з UI');
      }
    } catch (e) {
      setMessage('Помилка звʼязку з сервером, але видалено з UI');
    } finally {
      setBuild(prev => {
        const copy = { ...prev };
        delete copy[categoryName];
        return copy;
      });
    }
  };

  // --- Перевірка сумісності ---
  const handleCheckCompatibility = async () => {
    if (!buildId) {
      setMessage('Створіть або збережіть збірку для перевірки сумісності!');
      return;
    }
    // Перевіряємо сумісність для всіх категорій, де є товар
    setLoading(true);
    try {
      const incompatible = [];
      for (const cat of categories) {
        if (!build[cat.name]) continue;
        const compatible = await getCompatibleProducts(buildId, cat.id);
        // Якщо поточний товар не входить у список сумісних — додаємо в список несумісних
        const currentProduct = build[cat.name];
        if (compatible && Array.isArray(compatible) && !compatible.some(p => p.id === currentProduct.id)) {
          incompatible.push(cat.name);
        }
      }
      if (incompatible.length === 0) {
        setMessage('Всі обрані товари сумісні між собою!');
      } else {
        setMessage('Несумісні товари у категоріях: ' + incompatible.join(', '));
      }
    } catch (e) {
      setMessage('Помилка перевірки сумісності');
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  const handleClearBuild = () => {
    setBuild({});
    setBuildId(null);
    setBuildStatus('draft');
    setCompatibleProducts([]);
    setMessage('Збірку очищено!');
  };

  const totalPrice = Object.values(build).reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <>
      <Header />
      <Categories />
      <div className="configurator-layout">
        <main className="configurator-main">
          <div className="configurator-categories-row">
            {categories.map(cat => {
              const selected = selectedCategory && selectedCategory.id === cat.id;
              const picked = build[cat.name];
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`configurator-category-tile${selected ? ' selected' : ''}`}
                >
                  <span>{cat.name}</span>
                  <span className="status">{picked ? 'Обрано' : 'Не обрано'}</span>
                </button>
              );
            })}
          </div>
          {!selectedCategory && <div style={{color: '#A00', fontWeight: 500}}>Оберіть категорію для початку</div>}
          <h1 style={{fontSize: 22, marginBottom: 8}}>{selectedCategory ? selectedCategory.name : 'Оберіть категорію'}</h1>
          <div style={{marginBottom: 10, fontSize: 15, color: '#555'}}>Оберіть фільтри, щоб звузити вибір товарів. Натисніть "Додати" для потрібного товару.</div>
          <div className="configurator-filters">
            {attributes.map(attr => (
              <div key={attr.id} className="configurator-filter-group">
                <label>{attr.name}</label>
                <select
                  value={selectedFilters[attr.id] || ''}
                  onChange={e => setSelectedFilters(prev => ({ ...prev, [attr.id]: e.target.value }))}
                >
                  <option value="">Всі</option>
                  {(attributeValues[attr.id] || []).map((val, idx) => {
                    if (typeof val === 'object' && val !== null && 'id' in val) {
                      return <option key={val.id} value={val.value}>{val.value}</option>;
                    }
                    return <option key={val + '-' + idx} value={val}>{val}</option>;
                  })}
                </select>
              </div>
            ))}
          </div>
          <div className="configurator-products">
            {compatibleProducts.length > 0 ? (
              <div className="configurator-product-grid">
                {compatibleProducts.map(product => (
                  <div key={product.id} className="configurator-product-card">
                    <img
                      src={product.img || (product.images && product.images[0]) || '/placeholder.jpg'}
                      alt={product.name}
                      style={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 8, background: '#f5f5f5', marginBottom: 10 }}
                      onError={e => { e.target.src = '/placeholder.jpg'; e.target.onerror = null; }}
                    />
                    <div className="configurator-product-title">{product.name}</div>
                    <div className="configurator-product-price">{product.price} ₴</div>
                    <button onClick={() => handleAddToBuild(product)} className="configurator-add-btn">Додати</button>
                  </div>
                ))}
              </div>
            ) : loading ? (
              <div>Завантаження...</div>
            ) : (
              <div className="configurator-product-grid">
                {products.length === 0 && <div>Товарів не знайдено</div>}
                {products.map(product => (
                  <div key={product.id} className="configurator-product-card">
                    <img
                      src={product.img || (product.images && product.images[0]) || '/placeholder.jpg'}
                      alt={product.name}
                      style={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 8, background: '#f5f5f5', marginBottom: 10 }}
                      onError={e => { e.target.src = '/placeholder.jpg'; e.target.onerror = null; }}
                    />
                    <div className="configurator-product-title">{product.name}</div>
                    <div className="configurator-product-price">{product.price} ₴</div>
                    <button onClick={() => handleAddToBuild(product)} className="configurator-add-btn">Додати</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <aside className="configurator-sidebar">
          <h2>Ваша збірка</h2>
          <table>
            <thead>
              <tr>
                <th>Категорія</th>
                <th>Назва</th>
                <th>Ціна</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const item = build[cat.name];
                return (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td style={{color: item ? '#222' : '#aaa'}}>{item ? item.name : 'Не обрано'}</td>
                    <td style={{color: item ? '#222' : '#aaa', textAlign: 'right'}}>{item ? `${item.price} ₴` : '-'}</td>
                    <td>
                      {item && <button onClick={() => handleRemoveFromBuild(cat.name)} style={{color: '#A00', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer'}}>✕</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="configurator-total">Загальна ціна: <b>{totalPrice} ₴</b></div>
          {Object.keys(build).length >= 2 && (
            <>
              <button onClick={handleCheckCompatibility} className="configurator-add-btn" style={{margin: '10px 0 0 0', width: '100%'}}>Перевірити на сумісність</button>
              {message && <div style={{marginTop: 8, color: message.includes('сумісні') ? 'green' : '#A00', fontWeight: 500}}>{message}</div>}
            </>
          )}
          <button onClick={handleClearBuild} className="configurator-clear-btn">Очистити</button>
          <div style={{marginTop: 10}}>
            <button onClick={handleCreateBuild} className="configurator-add-btn">Створити нову</button>
            <button onClick={handleSaveBuild} className="configurator-add-btn" style={{marginLeft: 8}}>Зберегти</button>
            <button onClick={handleDeleteBuild} className="configurator-add-btn" style={{marginLeft: 8}}>Видалити</button>
          </div>
          <div style={{marginTop: 10}}>
            <b>Завантажити збірку:</b>
            <ul style={{maxHeight: 120, overflowY: 'auto', margin: 0, padding: 0}}>
              {userBuilds.map(b => (
                <li key={b.id} style={{marginBottom: 2}}>
                  <button onClick={() => handleLoadBuild(b.id)} style={{fontSize: 13}}>{b.name || `Збірка ${b.id}`}</button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{marginTop: 10}}>
            <span>Статус: <b style={{color: buildStatus === 'saved' ? 'green' : buildStatus === 'draft' ? '#888' : '#A00'}}>{buildStatus}</b></span>
          </div>
        </aside>
      </div>
      <Footer />
    </>
  );
}
