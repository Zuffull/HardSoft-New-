'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import Categories from '../../components/Categories.js';
import Footer from '../../components/Footer.js';
import { ProductCardItem } from '../../components/ProductCards.js';
import '../../styles/Filters.css';
import { filterProducts, fetchCategoryByName, fetchCategoryAttributes, fetchAttributeValues } from '../../api/productApiV2.js';
import ProductDetailsModal from '../../components/ProductDetailsModal';


const CATEGORY_NAME = 'Готові ПК';

const FILTER_ATTRS = [
  'Процесор',
  'Кількість ядер',
  'Відеокарта',
  'Материнська плата',
  "Тип пам'яті",
  'Оперативна пам’ять',
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
  const [category, setCategory] = useState(null);
  // Draft стани для фільтрів
  const [draftSelectedFilters, setDraftSelectedFilters] = useState({});
  const [draftPriceMin, setDraftPriceMin] = useState('');
  const [draftPriceMax, setDraftPriceMax] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Завантаження категорії по назві
  useEffect(() => {
    async function loadCategory() {
      try {
        const cat = await fetchCategoryByName(CATEGORY_NAME);
        if (cat) setCategory(cat);
      } catch (e) { console.error(e); }
    }
    loadCategory();
  }, []);

  // Завантаження атрибутів категорії
  useEffect(() => {
    async function loadAttributes() {
      if (!category?.id) return;
      try {
        const attrs = await fetchCategoryAttributes(category.id);
        setAttributes(attrs.filter(a => FILTER_ATTRS.includes(a.name)));
      } catch (e) { console.error(e); }
    }
    loadAttributes();
  }, [category]);

  // Завантаження значень для кожного атрибута
  useEffect(() => {
    async function loadValues() {
      if (!category?.id) return;
      const valuesObj = {};
      for (const attr of attributes) {
        try {
          valuesObj[attr.id] = await fetchAttributeValues(category.id, attr.id);
        } catch (e) { valuesObj[attr.id] = []; }
      }
      setAttrValues(valuesObj);
    }
    if (attributes.length && category?.id) loadValues();
  }, [attributes, category]);

  // Завантаження всіх товарів для категорії (без фільтрів)
  useEffect(() => {
    if (!category?.id) return;
    setLoading(true);
    console.log('Loading products for category:', category.id);
    filterProducts({
      category: category.id,
      limit: 1000,
      page: 1,
    })
      .then(data => {
        console.log('Received products:', data);
        if (Array.isArray(data.products)) {
          setAllProducts(data.products);
          setProducts(data.products.slice(0, 16));
          setTotalPages(Math.ceil(data.products.length / 16));
        } else if (Array.isArray(data)) {
          setAllProducts(data);
          setProducts(data.slice(0, 16));
          setTotalPages(Math.ceil(data.length / 16));
        } else {
          console.error('Unexpected data format:', data);
          setAllProducts([]);
          setProducts([]);
          setTotalPages(1);
        }
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setAllProducts([]);
        setProducts([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [category]);

  // Фільтрація через API
  useEffect(() => {
    if (!category?.id) return;
    setLoading(true);

    // Формуємо фільтр по атрибутах тільки з непорожніми значеннями
    let attributeFilters = {};
    attributes.forEach(attr => {
      const value = selectedFilters[attr.id];
      if (value) attributeFilters[attr.id] = value;
    });

    filterProducts({
      category: category.id,
      page,
      limit: 16,
      minPrice: priceMin || undefined,
      maxPrice: priceMax || undefined,
      attributeFilters,
    })
      .then(data => {
        const products = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [];
        setProducts(products);
        setTotalPages(Math.ceil((data.totalCount || products.length || 1) / 16));
      })
      .catch(error => {
        console.error('Error filtering products:', error);
        setProducts([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [selectedFilters, attributes, priceMin, priceMax, page, category]);

  // Зміна фільтра (оновлює лише драфтові стани)
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
                {console.log('Rendering products:', products)}
                {products && products.length > 0 ? products.map(product => {
                  console.log('Rendering product:', product);
                  return (
                    <ProductCardItem 
                      product={product} 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                    />
                  );
                }) : (
                  <div style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: '18px'
                  }}>
                    Товарів не знайдено
                  </div>
                )}
              </div>
              {products && products.length > 0 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={i + 1 === page ? 'active' : ''}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
              {selectedProduct && (
                <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

