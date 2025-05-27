'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import Categories from '../../components/Categories.js';
import Footer from '../../components/Footer.js';
import { fetchAllCategories, fetchCategoryAttributes, fetchAttributeValues, filterProducts } from '../../api/productApiV2.js';
import { ProductCardItem } from '../../components/ProductCards.js';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import '../../styles/Filters.css';

// ID головної категорії комплектуючих
const COMPONENTS_CATEGORY_ID = 'a02319b0-0924-4aac-be21-365014a0af69';

export default function ComponentsPage() {
  const [allCategories, setAllCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [attrValues, setAttrValues] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  // Draft стани для фільтрів
  const [draftSelectedFilters, setDraftSelectedFilters] = useState({});
  const [draftPriceMin, setDraftPriceMin] = useState('');
  const [draftPriceMax, setDraftPriceMax] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Завантажити всі категорії та підкатегорії комплектуючих
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchAllCategories();
        console.log('Всі категорії:', cats);
        setAllCategories(cats);
        const subs = cats.filter(cat => cat.parent_id === COMPONENTS_CATEGORY_ID);
        console.log('Підкатегорії комплектуючих:', subs);
        setSubcategories(subs);
        if (subs.length > 0) setSelectedSubcategory(subs[0]);
      } catch (e) { console.error(e); }
    }
    loadCategories();
  }, []);

  // Завантажити атрибути для підкатегорії
  useEffect(() => {
    async function loadAttributes() {
      if (!selectedSubcategory?.id) return;
      console.log('Вибрана підкатегорія:', selectedSubcategory);
      try {
        const attrs = await fetchCategoryAttributes(selectedSubcategory.id);
        setAttributes(attrs);
      } catch (e) { console.error(e); }
    }
    loadAttributes();
  }, [selectedSubcategory]);

  // Завантажити значення для кожного атрибута
  useEffect(() => {
    async function loadValues() {
      if (!selectedSubcategory?.id) return;
      const valuesObj = {};
      for (const attr of attributes) {
        try {
          valuesObj[attr.id] = await fetchAttributeValues(selectedSubcategory.id, attr.id);
        } catch (e) { valuesObj[attr.id] = []; }
      }
      setAttrValues(valuesObj);
    }
    if (attributes.length && selectedSubcategory?.id) loadValues();
  }, [attributes, selectedSubcategory]);

  // Фільтрація товарів
  useEffect(() => {
    if (!selectedSubcategory?.id) return;
    setLoading(true);
    // Формуємо фільтр по атрибутах тільки з непорожніми значеннями
    let attributeFilters = {};
    attributes.forEach(attr => {
      const value = selectedFilters[attr.id];
      if (value) attributeFilters[attr.id] = value;
    });
    filterProducts({
      category: selectedSubcategory.id,
      page,
      limit: 16,
      minPrice: priceMin || undefined,
      maxPrice: priceMax || undefined,
      attributeFilters,
    })
      .then(data => {
        console.log('Товари:', data);
        const products = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [];
        setProducts(products);
        setTotalPages(Math.ceil((data.totalCount || products.length || 1) / 16));
      })
      .catch(error => {
        setProducts([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [selectedFilters, attributes, priceMin, priceMax, page, selectedSubcategory]);

  // Зміна підкатегорії
  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedFilters({});
    setDraftSelectedFilters({});
    setPriceMin('');
    setPriceMax('');
    setDraftPriceMin('');
    setDraftPriceMax('');
    setPage(1);
  };

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

  // Синхронізуємо драфтові стани з основними при зміні атрибутів/фільтрів
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
        <aside className="filters" style={{
          position: 'sticky',
          top: '20px',
          height: 'calc(100vh - 40px)',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#FF8001 #23242a'
        }}>
          <h2>Фільтри</h2>
          {/* Підкатегорії комплектуючих */}
          <div className="filter-category" style={{ marginBottom: '16px' }}>
            <h3>Підкатегорії</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px',
              marginTop: '8px'
            }}>
              {subcategories.map(sub => (
                <button
                  key={sub.id}
                  className={`filter-button${selectedSubcategory?.id === sub.id ? ' active' : ''}`}
                  onClick={() => handleSubcategoryChange(sub)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: selectedSubcategory?.id === sub.id ? '#FF8001' : '#23242a',
                    color: '#f7f7fa',
                    fontSize: '14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    fontWeight: selectedSubcategory?.id === sub.id ? '600' : '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
          {/* Ціна */}
          <div className="filter-category" style={{ marginBottom: '16px' }}>
            <h3>Ціна, ₴</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="number"
                min="0"
                placeholder="від"
                value={draftPriceMin}
                onChange={e => setDraftPriceMin(e.target.value)}
                style={{
                  width: '50%',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: '#23242a',
                  color: '#f7f7fa',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.18s'
                }}
              />
              <input
                type="number"
                min="0"
                placeholder="до"
                value={draftPriceMax}
                onChange={e => setDraftPriceMax(e.target.value)}
                style={{
                  width: '50%',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: '#23242a',
                  color: '#f7f7fa',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.18s'
                }}
              />
            </div>
          </div>
          {/* Атрибути */}
          <div style={{
            maxHeight: 'calc(100vh - 380px)',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#FF8001 #23242a',
            padding: '4px'
          }}>
            {attributes.map(attr => (
              <div className="filter-category" key={attr.id} style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '6px' }}>{attr.name}</h3>
                <select
                  value={draftSelectedFilters[attr.id] || ''}
                  onChange={e => handleDraftFilterChange(attr.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: '#23242a',
                    color: '#f7f7fa',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Всі</option>
                  {(attrValues[attr.id] || []).map((val, idx) => (
                    <option key={`${val}-${idx}`} value={val}>{val}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {/* Кнопки фільтрів */}
          <div className="filter-buttons" style={{
            position: 'sticky',
            bottom: 0,
            background: '#18191c',
            padding: '16px 0 0 0',
            marginTop: '16px'
          }}>
            <button className="apply-button" onClick={handleApply}>
              Застосувати
            </button>
            <button className="reset-button" onClick={handleReset}>
              Скинути
            </button>
          </div>
        </aside>
        <main style={{ flex: 1 }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              fontSize: '18px',
              color: '#f7f7fa'
            }}>
              Завантаження...
            </div>
          ) : (
            <>
              <div className="systemproduct-grid">
                {products && products.length > 0 ? products.map(product => (
                  <ProductCardItem
                    key={product.id}
                    product={product}
                    category={selectedSubcategory?.name}
                    onClick={() => setSelectedProduct(product)}
                  />
                )) : (
                  <div style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '40px',
                    fontSize: '18px',
                    color: '#f7f7fa',
                    background: '#18191c',
                    borderRadius: '12px'
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
