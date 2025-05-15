'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import Categories from '../../components/Categories.js';
import Footer from '../../components/Footer.js';
import { fetchAllCategories, fetch324Products, fetchCategoryByName } from '../../api/productApi.js';
import { fetchCategoryAttributes, fetchAttributeValues } from '../../api/systemblocksApi.js';
import { ProductCardItem } from '../../components/ProductCard.js';
import SimpleProductCard from '../../components/SimpleProductCard.js';
import '../../styles/Peripherals.css';

const PERIPHERAL_CATEGORIES = [
  'Монітори',
  'Миші',
  'Клавіатури',
  'Комплекти (миша+клавіатура)',
  'Поверхні',
  'Гарнітура',
  'Акустика',
  'Веб-камери',
  'Мережеве обладнання',
  'Різне',
];

export default function PeripheralsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [filters, setFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  // Завантажити всі категорії та знайти потрібні
  useEffect(() => {
    fetchAllCategories().then(all => {
      const filtered = all.filter(cat => PERIPHERAL_CATEGORIES.includes(cat.name));
      setCategories(filtered);
      // Автоматично вибираємо 'Монітори' при першому завантаженні
      const monitors = filtered.find(cat => cat.name === 'Монітори');
      if (monitors) setSelectedCategory(monitors);
    });
  }, []);

  // Коли вибрано категорію — завантажити її атрибути для фільтрації
  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    fetchCategoryByName(selectedCategory.name).then(cat => {
      setCategoryId(cat.id);
      fetchCategoryAttributes(cat.id).then(attrs => {
        setFilters(attrs);
        // Для кожного атрибута підвантажити значення
        Promise.all(
          attrs.map(attr =>
            fetchAttributeValues(cat.id, attr.id).then(values => ({ [attr.id]: values }))
          )
        ).then(valuesArr => {
          const valuesObj = valuesArr.reduce((acc, v) => ({ ...acc, ...v }), {});
          setFilterValues(valuesObj);
        });
      });
    }).finally(() => setLoading(false));
  }, [selectedCategory]);

  // Завантажити всі товари для категорії (без фільтрів)
  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    fetch324Products({
      categoryName: selectedCategory.name,
      limit: 1000, // завантажити максимум товарів
      page: 1,
    })
      .then(data => {
        setAllProducts(data);
        setProducts(data);
        setTotalPages(Math.ceil((data.length ? data[0].totalCount || 100 : 100) / 16));
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Фільтрація на фронті
  useEffect(() => {
    if (!allProducts.length) return;
    let filtered = allProducts.filter(product => {
      return filters.every(attr => {
        const value = selectedFilters[attr.id];
        if (!value) return true;
        return product.attributes?.[attr.name] === value;
      });
    });
    setProducts(filtered);
    setTotalPages(Math.ceil((filtered.length ? filtered[0]?.totalCount || filtered.length : 1) / 16));
    setPage(1);
  }, [selectedFilters, allProducts, filters]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedFilters({});
    setProducts([]);
    setFilters([]);
    setFilterValues({});
    setPage(1);
  };

  const handleFilterChange = (attrId, value) => {
    setSelectedFilters(prev => ({ ...prev, [attrId]: value }));
    setPage(1);
  };

  return (
    <>
      <Header />
      <Categories />
      <div className="peripherals-layout">
        <aside className="peripherals-sidebar">
          <nav className="peripherals-menu">
            <h2 className="sidebar-title">Категорії</h2>
            <ul>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`sidebar-category-btn${selectedCategory && selectedCategory.id === cat.id ? ' selected' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {selectedCategory && (
            <div className="sidebar-filters">
              <h3 className="sidebar-filters-title">Фільтрація</h3>
              {filters.map(attr => (
                <div key={attr.id} className="sidebar-filter-group">
                  <label>{attr.name}</label>
                  <select
                    value={selectedFilters[attr.id] || ''}
                    onChange={e => handleFilterChange(attr.id, e.target.value)}
                  >
                    <option value="">Всі</option>
                    {(filterValues[attr.id] || []).map((val, idx) => {
                      if (typeof val === 'object' && val !== null && 'id' in val) {
                        return <option key={val.id} value={val.value}>{val.value}</option>;
                      }
                      return <option key={val + '-' + idx} value={val}>{val}</option>;
                    })}
                  </select>
                </div>
              ))}
            </div>
          )}
        </aside>
        <main className="peripherals-main">
          <h1 className="section-title">{selectedCategory ? selectedCategory.name : 'Оберіть категорію'}</h1>
          <div className="peripherals-products">
            {loading ? (
              <div>Завантаження...</div>
            ) : (
              <div className="product-grid">
                {products.length === 0 && <div>Товарів не знайдено</div>}
                {products.map(product => (
                  <SimpleProductCard key={product.id} product={product} category={selectedCategory?.name} />
                ))}
              </div>
            )}
          </div>
          <div className="peripherals-pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={i + 1 === page ? 'active' : ''}
                onClick={() => setPage(i + 1)}
              >{i + 1}</button>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}




