'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import Categories from '../../components/Categories.js';
import Footer from '../../components/Footer.js';
import { ProductCardItem } from '../../components/ProductCard.js';
import '../../styles/Filters.css';
import { fetch324Products, fetchCategoryByName } from '../../api/productApi.js';
import { fetchCategoryAttributes, fetchAttributeValues } from '../../api/systemblocksApi.js';

const CATEGORY_NAME = 'Готові ПК';

const FILTER_ATTRS = [
  'Процесор',
  'Кількість ядер',
  'Відеокарта',
  'Материнська плата',
  "Тип пам'яті",
  "Оперативна пам'ять",
  'Накопичувач SSD',
  'Накопичувач HDD',
  'SSD m.2',
  'Операційна система',
];

export default function SystemBlocksPage() {
  const [attributes, setAttributes] = useState([]);
  const [attrValues, setAttrValues] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  // Draft стани для фільтрів
  const [draftSelectedFilters, setDraftSelectedFilters] = useState({});
  const [draftPriceMin, setDraftPriceMin] = useState('');
  const [draftPriceMax, setDraftPriceMax] = useState('');

  // Завантаження id категорії по назві
  useEffect(() => {
    async function loadCategoryId() {
      try {
        const category = await fetchCategoryByName(CATEGORY_NAME);
        if (category) setCategoryId(category.id);
      } catch (e) { console.error(e); }
    }
    loadCategoryId();
  }, []);

  // Завантаження атрибутів категорії
  useEffect(() => {
    async function loadAttributes() {
      if (!categoryId) return;
      try {
        const attrs = await fetchCategoryAttributes(categoryId);
        setAttributes(attrs.filter(a => FILTER_ATTRS.includes(a.name)));
      } catch (e) { console.error(e); }
    }
    loadAttributes();
  }, [categoryId]);

  // Завантаження значень для кожного атрибута
  useEffect(() => {
    async function loadValues() {
      if (!categoryId) return;
      const valuesObj = {};
      for (const attr of attributes) {
        try {
          valuesObj[attr.id] = await fetchAttributeValues(categoryId, attr.id);
        } catch (e) { valuesObj[attr.id] = []; }
      }
      setAttrValues(valuesObj);
    }
    if (attributes.length && categoryId) loadValues();
  }, [attributes, categoryId]);

  // Завантаження товарів з фільтрами
  useEffect(() => {
    async function loadProducts() {
      if (!categoryId) return;
      setLoading(true);
      try {
        const attributesFilter = Object.entries(selectedFilters)
          .filter(([k, v]) => v && v.length)
          .map(([attributeId, value]) => ({ attributeId, value }));
        const filterObj = {};
        if (attributesFilter.length) filterObj.attributes = attributesFilter;
        if (priceMin) filterObj.priceMin = Number(priceMin);
        if (priceMax) filterObj.priceMax = Number(priceMax);
        // Логування filterObj перед запитом
        console.log('filterObj для fetch324Products:', filterObj);
        const data = await fetch324Products({
          page,
          limit: 16,
          categoryName: CATEGORY_NAME,
          filter: filterObj,
        });
        setProducts(data);
        setTotalPages(Math.ceil((data.length ? data[0].totalCount || 100 : 100) / 16));
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedFilters, page, priceMin, priceMax, categoryId]);

  // Зміна фільтра (оновлює лише драфтовий стан)
  const handleDraftFilterChange = (attrId, value) => {
    setDraftSelectedFilters((prev) => ({ ...prev, [attrId]: value }));
  };

  // Скидання фільтрів
  const handleReset = () => {
    setSelectedFilters({});
    setPriceMin('');
    setPriceMax('');
    setDraftSelectedFilters({});
    setDraftPriceMin('');
    setDraftPriceMax('');
    setPage(1);
  };

  // Застосування фільтрів
  const handleApply = () => {
    // Логування значень фільтрів
    console.log('Застосовані фільтри:', draftSelectedFilters);
    console.log('Мінімальна ціна:', draftPriceMin);
    console.log('Максимальна ціна:', draftPriceMax);
    setSelectedFilters(draftSelectedFilters);
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setPage(1);
  };

  // Синхронізуємо драфтові стани з основними при зміні категорії (або при першому завантаженні)
  useEffect(() => {
    setDraftSelectedFilters(selectedFilters);
    setDraftPriceMin(priceMin);
    setDraftPriceMax(priceMax);
  }, [attributes, selectedFilters, priceMin, priceMax]);

  return (
    <>
      <Header />
      <Categories />
      <div className="filters-and-products">
        <aside className="filters">
          <h2>Фільтри</h2>
          {attributes.map(attr => (
            <div className="filter-category" key={attr.id}>
              <h3>{attr.name}</h3>
              <select
                value={draftSelectedFilters[attr.id] || ''}
                onChange={e => handleDraftFilterChange(attr.id, e.target.value)}
              >
                <option value="">Всі</option>
                {(attrValues[attr.id] || []).map(val => (
                  <option value={val} key={val}>{val}</option>
                ))}
              </select>
            </div>
          ))}
          <div className="filter-category">
            <h3>Ціна, ₴</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min="0"
                placeholder="від"
                value={draftPriceMin}
                onChange={e => setDraftPriceMin(e.target.value)}
                style={{ width: '50%', padding: '7px', borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#fafafa', fontSize: 15 }}
              />
              <input
                type="number"
                min="0"
                placeholder="до"
                value={draftPriceMax}
                onChange={e => setDraftPriceMax(e.target.value)}
                style={{ width: '50%', padding: '7px', borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#fafafa', fontSize: 15 }}
              />
            </div>
          </div>
          <div className="filter-buttons">
            <button className="apply-button" onClick={handleApply}>Застосувати</button>
            <button className="reset-button" onClick={handleReset}>Скинути</button>
          </div>
        </aside>
        <main style={{ flex: 1 }}>
          {loading ? (
            <div>Завантаження...</div>
          ) : (
            <>
              <div className="systemproduct-grid">
                {products.length ? products.map(product => (
                  <ProductCardItem product={product} key={product.id} />
                )) : <div>Товарів не знайдено</div>}
              </div>
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={i + 1 === page ? 'active' : ''}
                    onClick={() => setPage(i + 1)}
                  >{i + 1}</button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

