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
  saveConfiguration,
  deleteConfiguration,
  addItemToConfiguration,
  deleteConfigurationItem,
  getCompatibleProducts,
} from '../../api/configuratorAPI.js';
import { getProductCategoryInfo } from '../../api/productApiV2.js';
import { addToCart } from '../../api/cartApi.js';
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
  'Вентилятори'
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
  const [error, setError] = useState(null);

  // Функція для форматування повідомлень про помилки
  const formatErrorMessage = (error) => {
    if (!error) return 'Виникла помилка';
    
    // Перевірка на помилку сумісності
    if (error.includes('Компонент несумісний')) {
      const match = error.match(/з "([^"]+)": Несумісні значення атрибуту "([^"]+)": ([^ ]+) ≠ ([^ ]+)/);
      if (match) {
        const [_, component, attribute, value1, value2] = match;
        return `⚠️ Несумісний ${attribute.split(' ')[0]}: ${value1} та ${value2}`;
      }
    }
    
    // Інші типи помилок
    if (error.includes('Помилка завантаження')) {
      return '⚠️ Помилка завантаження даних';
    }
    
    if (error.includes('Помилка створення')) {
      return '⚠️ Не вдалося створити збірку';
    }
    
    if (error.includes('Помилка збереження')) {
      return '⚠️ Не вдалося зберегти збірку';
    }
    
    if (error.includes('Помилка видалення')) {
      return '⚠️ Не вдалося видалити компонент';
    }
    
    // Якщо не знайдено відповідний формат, повертаємо оригінальне повідомлення
    return error;
  };

  // Функція для логування помилок
  const handleError = (error, customMessage) => {
    console.error(customMessage, error);
    setMessage(formatErrorMessage(customMessage));
  };

  // Функція для очищення фільтрів
  const clearFilters = () => {
    setSelectedFilters({});
    setAttributes([]);
    setAttributeValues({});
    setProducts([]);
  };

  // Оновлюємо useEffect для завантаження категорій
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const all = await fetchConfiguratorCategories();
        console.log('Завантажені категорії:', all);
        if (!all || !Array.isArray(all)) {
          throw new Error('Помилка завантаження категорій');
        }
      const filtered = all.filter(cat => ALLOWED_CATEGORIES.includes(cat.name));
      setCategories(filtered);
        // При першому завантаженні встановлюємо першу категорію
        if (filtered.length > 0 && !selectedCategory) {
          setSelectedCategory(filtered[0]);
        }
      } catch (error) {
        handleError(error, 'Помилка завантаження категорій');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Завантажити збірки користувача
  useEffect(() => {
    const loadUserBuilds = async () => {
      try {
        const builds = await getUserConfigurations();
        if (!builds || !Array.isArray(builds)) {
          throw new Error('Помилка завантаження збірок');
        }
        setUserBuilds(builds);
      } catch (error) {
        handleError(error, 'Помилка завантаження збірок користувача');
        setUserBuilds([]);
      }
    };
    loadUserBuilds();
  }, []);

  // Завантажити атрибути для вибраної категорії
  useEffect(() => {
    const loadAttributes = async () => {
    if (!selectedCategory) return;
      try {
    setLoading(true);
        // Скидаємо фільтри при зміні категорії
        setSelectedFilters({});
        setAttributes([]);
        setAttributeValues({});
        
        const attrs = await fetchCategoryAttributes(selectedCategory.id);
        if (!attrs || !Array.isArray(attrs)) {
          throw new Error('Помилка завантаження атрибутів');
        }
      setAttributes(attrs);

        const valuesPromises = attrs.map(async attr => {
          const values = await fetchAttributeValues(selectedCategory.id, attr.id);
          return { [attr.id]: values };
        });

        const valuesArr = await Promise.all(valuesPromises);
        const valuesObj = valuesArr.reduce((acc, v) => ({ ...acc, ...v }), {});
        setAttributeValues(valuesObj);
      } catch (error) {
        handleError(error, 'Помилка завантаження атрибутів категорії');
      } finally {
        setLoading(false);
      }
    };
    loadAttributes();
  }, [selectedCategory]);

  // Завантажити товари для категорії з фільтрами
  useEffect(() => {
    setError(null);
    const loadProducts = async () => {
    if (!selectedCategory) return;
      try {
    setLoading(true);
        
        // Формуємо правильний формат фільтрів для API
        const attributeFilters = {};
        Object.entries(selectedFilters)
          .filter(([_, value]) => value)
          .forEach(([key, value]) => {
            attributeFilters[key] = value;
          });

        console.log('Sending request with filters:', {
          categoryId: selectedCategory.id,
          attributeFilters
        });

        const data = await fetchCategoryProducts({
          categoryId: selectedCategory.id,
          page: 1,
      limit: 12,
          filter: attributeFilters
        });

        console.log('Received products:', data);

        if (!data || !Array.isArray(data)) {
          throw new Error('Помилка завантаження товарів');
        }
        setProducts(data);
      } catch (error) {
        handleError(error, 'Помилка завантаження товарів');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedFilters, selectedCategory]);

  // --- BUILD CRUD ---
  const handleCreateBuild = async () => {
    setError(null);
    try {
      setLoading(true);
      setMessage('');
      const build = await createConfiguration({ name: `Збірка ${Date.now()}` });
      if (!build || !build.id) {
        throw new Error('Помилка створення збірки');
      }
      setBuildId(build.id);
      setBuildStatus(build.status);
      setBuild({});
      setUserBuilds(prev => [...prev, build]);
      setMessage('Створено нову збірку!');
    } catch (error) {
      handleError(error, 'Помилка створення збірки');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBuild = async (id) => {
    setError(null);
    try {
      setLoading(true);
      setMessage('');
      
      // Очищуємо попередній стан перед завантаженням нової збірки
      setBuild({});
      setBuildId(null);
      setBuildStatus('draft');
      
      const data = await getConfigurationDetails(id);
      console.log('Завантажені дані збірки:', data);
      
      if (!data || !data.id) {
        throw new Error('Помилка завантаження збірки');
      }
      
      setBuildId(data.id);
      setBuildStatus(data.status || 'draft');
      
      if (!data.items || !Array.isArray(data.items)) {
        console.log('Збірка не містить компонентів');
        setMessage('Збірку завантажено! (порожня)');
        return;
      }

      const buildObj = {};
      
      // Чекаємо завершення всіх асинхронних операцій перед оновленням стану
      await Promise.all(
        data.items.map(async (item) => {
          if (!item.product || !item.product.id) {
            console.log('Пропущено некоректний продукт:', item);
            return;
          }

          try {
            const categoryName = await getProductCategoryInfo(item.product.id);
            console.log('Отримано категорію:', categoryName, 'для продукту:', item.product.id);
            
            if (categoryName) {
              const category = categories.find(cat => cat.name === categoryName);
              if (category) {
                buildObj[category.id] = item.product;
                console.log('Додано продукт до категорії:', category.name);
              }
            }
          } catch (error) {
            console.error('Помилка при обробці продукту:', item.product.id, error);
          }
        })
      );
      
      console.log('Фінальний об\'єкт збірки:', buildObj);
      setBuild(buildObj);

      setMessage('Збірку завантажено!');
    } catch (error) {
      handleError(error, 'Помилка завантаження збірки');
      // Очищуємо стан при помилці
      setBuild({});
      setBuildId(null);
      setBuildStatus('draft');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuild = async () => {
    if (!buildId) {
      setMessage('Спочатку створіть або завантажте збірку');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      await deleteConfiguration(buildId);
      setBuildId(null);
      setBuild({});
      setBuildStatus('draft');
      setUserBuilds(userBuilds.filter(b => b.id !== buildId));
      setMessage('Збірку видалено!');
    } catch (error) {
      handleError(error, 'Помилка видалення збірки');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBuild = async () => {
    if (!buildId) {
      setMessage('Спочатку створіть або завантажте збірку');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      await saveConfiguration(buildId);
      setBuildStatus('saved');
      setMessage('Збірку збережено!');
    } catch (error) {
      handleError(error, 'Помилка збереження збірки');
    } finally {
      setLoading(false);
    }
  };

  // --- Додавання/видалення компонентів через API ---
  const handleAddToBuild = async (product) => {
    setError(null);
    if (!buildId) {
      setMessage('Спочатку створіть або завантажте збірку');
      return;
    }
    if (!product || !product.id) {
      setMessage('⚠️ Некоректний товар');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      
      const result = await addItemToConfiguration(buildId, { productId: product.id });
      if (result?.error) {
        throw new Error(result.error.error || 'Помилка додавання до збірки');
      }

      const data = await getConfigurationDetails(buildId);
      if (!data || !data.items) {
        throw new Error('Помилка оновлення даних збірки');
      }

      const buildObj = {...build};
      await Promise.all(
        data.items.map(async (item) => {
          if (item.product) {
            const categoryName = await getProductCategoryInfo(item.product.id);
            if (categoryName) {
              const category = categories.find(cat => cat.name === categoryName);
              if (category) {
                buildObj[category.id] = item.product;
              }
            }
          }
        })
      );

      setBuild(buildObj);
      setMessage('✓ Додано до збірки');
    } catch (error) {
      handleError(error, error.message || 'Помилка додавання компонента');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromBuild = async (categoryId) => {
    setError(null);
    if (!categoryId) {
      setMessage('Помилка: не вказана категорія');
      return;
    }
    try {
      setLoading(true);
      setMessage('');

      // Якщо немає buildId, просто видаляємо з локального стану
      if (!buildId) {
        const newBuild = {...build};
        delete newBuild[categoryId];
        setBuild(newBuild);
        setMessage('Компонент видалено зі збірки');
        return;
      }

      // Отримуємо поточні деталі збірки
      const details = await getConfigurationDetails(buildId);
      if (!details || !details.items) {
        throw new Error('Помилка отримання даних збірки');
      }

      // Знаходимо продукт для видалення
      let itemToRemove = null;
      await Promise.all(
        details.items.map(async (item) => {
          if (item.product) {
            const categoryName = await getProductCategoryInfo(item.product.id);
            if (categoryName) {
              const category = categories.find(cat => cat.name === categoryName);
              if (category && category.id === categoryId) {
                itemToRemove = item;
        }
            }
          }
        })
      );

      if (!itemToRemove) {
        throw new Error('Компонент не знайдено в збірці');
      }

      // Видаляємо компонент
      await deleteConfigurationItem(buildId, itemToRemove.id);

      // Оновлюємо локальний стан
      const newBuild = {...build};
      delete newBuild[categoryId];
      setBuild(newBuild);
      
      setMessage('Компонент видалено зі збірки');
    } catch (error) {
      handleError(error, 'Помилка видалення компонента');
      // Видаляємо з UI навіть при помилці API
      const newBuild = {...build};
      delete newBuild[categoryId];
      setBuild(newBuild);
    } finally {
      setLoading(false);
    }
  };

  // --- Перевірка сумісності ---
  const handleCheckCompatibility = async () => {
    if (!buildId) {
      setMessage('Спочатку створіть або завантажте збірку');
      return;
    }
    if (Object.keys(build).length < 2) {
      setMessage('Додайте хоча б два компоненти для перевірки сумісності');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      
      const incompatible = [];
      for (const cat of categories) {
        if (!build[cat.id]) continue;
        
        const compatible = await getCompatibleProducts(buildId, cat.id);
        if (!compatible || !Array.isArray(compatible)) {
          throw new Error('Помилка отримання сумісних товарів');
        }

        const currentProduct = build[cat.id];
        if (!compatible.some(p => p.id === currentProduct.id)) {
          incompatible.push(cat.name);
        }
      }

      if (incompatible.length === 0) {
        setMessage('✅ Всі обрані товари сумісні між собою!');
      } else {
        setMessage('❌ Несумісні товари у категоріях: ' + incompatible.join(', '));
      }
    } catch (error) {
      handleError(error, 'Помилка перевірки сумісності');
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
    setError(null);
  };

  const totalPrice = Object.values(build).reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleBuyBuild = async () => {
    if (!buildId) {
      setMessage('Спочатку створіть або завантажте збірку');
      return;
    }
    if (Object.keys(build).length === 0) {
      setMessage('Додайте хоча б один компонент до збірки');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      
      await addToCart({ build_id: buildId, quantity: 1 });
      setMessage('✅ Збірку додано до кошика! Перейдіть у кошик для оформлення замовлення.');
    } catch (error) {
      console.log('Помилка додавання до кошика:', error);
      handleError(error, 'Помилка додавання до кошика');
    } finally {
      setLoading(false);
    }
  };

  const isCategoryPicked = selectedCategory && build[selectedCategory.id];

  // Додаємо useEffect для логування змін у build
  useEffect(() => {
    console.log('Build змінився:', build);
  }, [build]);

  // Додаємо функцію для перевірки наявності компонента
  const isComponentSelected = (categoryId) => {
    return Boolean(build[categoryId]);
  };

  // Функція для зміни категорії
  const handleCategoryChange = (category) => {
    clearFilters();
    setSelectedCategory(category);
  };

  // Функція для скорочення назви продукту
  const shortenProductName = (name) => {
    if (!name) return '';
    
    // Для процесорів
    if (name.includes('Процесор')) {
      return name.split('(')[0].trim();
    }
    
    // Для відеокарт
    if (name.includes('Відеокарта')) {
      return name.split('(')[0].trim();
    }
    
    // Для материнських плат
    if (name.includes('Материнська плата')) {
      return name.split('(')[0].trim();
    }
    
    // Для RAM
    if (name.includes("Оперативна пам'ять")) {
      return name.split('(')[0].trim();
    }
    
    // Для SSD та HDD
    if (name.includes('Накопичувач')) {
      return name.split('(')[0].trim();
    }
    
    // Для блоків живлення
    if (name.includes('Блок живлення')) {
      return name.split('(')[0].trim();
    }
    
    // Для корпусів
    if (name.includes('Корпус')) {
      return name.split('(')[0].trim();
    }

    // Для всіх інших випадків обрізаємо після першої дужки
    return name.split('(')[0].trim();
  };

  return (
    <>
      <Header />
      <Categories />
      <div className="configurator-layout">
        <main className="configurator-main">
          <div className="configurator-categories-row">
            {categories.map(cat => {
              const selected = selectedCategory?.id === cat.id;
              const picked = build[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat)}
                  className={`configurator-category-tile${selected ? ' selected' : ''}`}
                  disabled={loading}
                >
                  <span>{cat.name}</span>
                  <span className="status">{picked ? '✓ Обрано' : 'Не обрано'}</span>
                </button>
              );
            })}
          </div>

          {!selectedCategory && (
            <div style={{color: '#A00', fontWeight: 500, padding: '20px 0'}}>
              Оберіть категорію для початку
            </div>
          )}

          {selectedCategory && (
            <>
              <h1 style={{fontSize: 22, marginBottom: 8}}>{selectedCategory.name}</h1>
              <div style={{marginBottom: 10, fontSize: 15, color: '#555'}}>
                Оберіть фільтри, щоб звузити вибір товарів. Натисніть "Додати" для потрібного товару.
              </div>
            </>
          )}

          <div className="configurator-filters">
            {attributes.map(attr => (
              <div key={attr.id} className="configurator-filter-group">
                <label>{attr.name}</label>
                <select
                  value={selectedFilters[attr.id] || ''}
                  onChange={e => setSelectedFilters(prev => ({ ...prev, [attr.id]: e.target.value }))}
                  disabled={loading}
                >
                  <option value="">Всі</option>
                  {(attributeValues[attr.id] || []).map((val, idx) => (
                    <option 
                      key={typeof val === 'object' ? val.id : `${val}-${idx}`} 
                      value={typeof val === 'object' ? val.value : val}
                    >
                      {typeof val === 'object' ? val.value : val}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="configurator-products">
            {loading ? (
              <div style={{padding: 20, textAlign: 'center', color: '#666'}}>
                Завантаження...
              </div>
            ) : isCategoryPicked ? (
              <div style={{color: '#888', fontWeight: 500, fontSize: 16, padding: 24}}>
                Ви вже додали компонент цієї категорії до збірки
              </div>
            ) : compatibleProducts.length > 0 ? (
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
                    <button 
                      onClick={() => handleAddToBuild(product)} 
                      className="configurator-button add"
                      disabled={loading || isCategoryPicked}
                      style={{width: '100%'}}
                    >
                      Додати
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="configurator-product-grid">
                {products.length === 0 ? (
                  <div style={{padding: 20, textAlign: 'center', color: '#666'}}>
                    Товарів не знайдено
                  </div>
                ) : (
                  products.map(product => (
                  <div key={product.id} className="configurator-product-card">
                    <img
                      src={product.img || (product.images && product.images[0]) || '/placeholder.jpg'}
                      alt={product.name}
                      style={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 8, background: '#f5f5f5', marginBottom: 10 }}
                      onError={e => { e.target.src = '/placeholder.jpg'; e.target.onerror = null; }}
                    />
                    <div className="configurator-product-title">{product.name}</div>
                    <div className="configurator-product-price">{product.price} ₴</div>
                      <button 
                        onClick={() => handleAddToBuild(product)} 
                        className="configurator-button add"
                        disabled={loading || isCategoryPicked}
                        style={{width: '100%'}}
                      >
                        Додати
                      </button>
                  </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>

        <aside className="configurator-sidebar">
          <h2>Ваша збірка {buildId ? `#${buildId}` : ''}</h2>
          
          {message && (
            <div style={{
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: message.includes('✓') || 
                             message.includes('Створено') ||
                             message.includes('Збережено') ||
                             message.includes('додано') ||
                             message.includes('Компонент видалено') ||
                             message.includes('очищено') ? 
                             'rgba(0, 180, 0, 0.1)' : 'rgb(255, 242, 242)',
              color: message.includes('✓') || 
                    message.includes('Створено') ||
                    message.includes('Збережено') ||
                    message.includes('додано') ||
                    message.includes('Компонент видалено') ||
                    message.includes('очищено') ? 
                    '#00a000' : '#d00',
              borderRadius: '4px',
              border: `1px solid ${message.includes('✓') || 
                                 message.includes('Створено') ||
                                 message.includes('Збережено') ||
                                 message.includes('додано') ||
                                 message.includes('Компонент видалено') ||
                                 message.includes('очищено') ? 
                                 'rgba(0, 180, 0, 0.2)' : 'rgba(221, 0, 0, 0.1)'}`,
              fontSize: '14px',
              fontWeight: 500
            }}>
              {message}
            </div>
          )}

          <table style={{ width: '100%', marginBottom: '20px', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '25%', padding: '0 12px 8px 12px', color: '#666', fontSize: '14px' }}>Категорія</th>
                <th style={{ textAlign: 'left', width: '45%', padding: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Назва</th>
                <th style={{ textAlign: 'right', width: '20%', padding: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Ціна</th>
                <th style={{ width: '10%', padding: '0 0 8px 0' }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const item = build[cat.id];
                const isSelected = isComponentSelected(cat.id);
                return (
                  <tr key={cat.id} style={{
                    backgroundColor: isSelected ? '#f8f9fa' : '#1f1f1f',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  }}>
                    <td style={{ 
                      padding: '8px 0', 
                      paddingLeft: '12px', 
                      color: isSelected ? '#000' : '#888',
                      fontWeight: isSelected ? 500 : 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px'
                    }}>{cat.name}</td>
                    <td style={{
                      color: isSelected ? '#222' : '#666',
                      padding: '8px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontStyle: isSelected ? 'normal' : 'italic'
                    }}>
                      {isSelected ? shortenProductName(item.name) : 'Не обрано'}
                    </td>
                    <td style={{
                      color: isSelected ? '#222' : '#666',
                      textAlign: 'right',
                      padding: '8px 0',
                      whiteSpace: 'nowrap',
                      fontStyle: isSelected ? 'normal' : 'italic'
                    }}>
                      {isSelected ? `${item.price} ₴` : '-'}
                    </td>
                    <td style={{ 
                      padding: '8px 0', 
                      textAlign: 'center',
                      width: '40px',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px'
                    }}>
                      {isSelected && (
                        <button 
                          onClick={() => handleRemoveFromBuild(cat.id)}
                          disabled={loading}
                          style={{
                            color: '#A00',
                            fontWeight: 'bold',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            opacity: loading ? 0.5 : 1,
                            padding: '0 8px'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="configurator-total" style={{margin: '20px 0'}}>
            Загальна ціна: <b>{totalPrice} ₴</b>
          </div>

          <div style={{display: 'grid', gap: '10px'}}>
            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                onClick={handleCreateBuild} 
                className="configurator-button"
                disabled={loading}
                style={{flex: 1}}
              >
                Створити нову
              </button>
              <button 
                onClick={handleSaveBuild} 
                className="configurator-button"
                disabled={loading || !buildId}
                style={{flex: 1}}
              >
                Зберегти
              </button>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                onClick={handleDeleteBuild} 
                className="configurator-button delete"
                disabled={loading || !buildId}
                style={{flex: 1}}
              >
                Видалити
              </button>
              <button 
                onClick={handleClearBuild} 
                className="configurator-button"
                disabled={loading}
                style={{flex: 1}}
              >
                Очистити
              </button>
            </div>

            <button 
              onClick={handleBuyBuild} 
              className="configurator-button buy"
              disabled={loading || !buildId || Object.keys(build).length === 0}
              style={{width: '100%'}}
            >
              Купити
            </button>
          </div>

          <div style={{marginTop: 20}}>
            <b>Завантажити збірку:</b>
            <ul style={{
              maxHeight: 120, 
              overflowY: 'auto', 
              margin: '10px 0',
              padding: 0,
              listStyle: 'none'
            }}>
              {userBuilds.length === 0 ? (
                <li style={{color: '#666', textAlign: 'center'}}>
                  Немає збережених збірок
                </li>
              ) : (
                userBuilds.map(b => (
                  <li key={b.id} style={{
                    marginBottom: 5,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    backgroundColor: buildId === b.id ? '#2d2d2d' : 'transparent',
                    borderRadius: 4,
                    transition: 'all 0.2s ease'
                  }}>
                    <button 
                      onClick={() => handleLoadBuild(b.id)} 
                      disabled={loading}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        opacity: loading ? 0.5 : 1,
                        color: buildId === b.id ? '#fff' : '#888',
                        fontSize: '14px',
                        fontWeight: buildId === b.id ? 500 : 400,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: buildId === b.id ? '#00a000' : '#666',
                        flexShrink: 0
                      }}></span>
                      {b.name || `Збірка #${b.id}`}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div style={{marginTop: 10}}>
            <span>
              Статус: {' '}
              <b style={{
                color: buildStatus === 'saved' ? 'green' : 
                       buildStatus === 'draft' ? '#888' : '#A00'
              }}>
                {buildStatus === 'saved' ? '✓ Збережено' : 
                 buildStatus === 'draft' ? '◯ Чернетка' : 
                 '! Помилка'}
              </b>
            </span>
          </div>
        </aside>
      </div>
      <Footer />
    </>
  );
}
