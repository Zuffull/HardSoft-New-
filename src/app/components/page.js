'use client';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import Categories from '../../components/Categories.js';
import Footer from '../../components/Footer.js';
import { fetchComponentsAttributes, fetchComponentAttributeValues, fetchComponentsProducts, fetchComponentsSubcategories } from '../../api/componentsAPI.js';
import { ProductCardItem } from '../../components/ProductCard.js';
import '../../styles/Peripherals.css';

export default function ComponentsPage() {
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filters, setFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Завантажити підкатегорії комплектуючих
  useEffect(() => {
    fetchComponentsSubcategories().then(subs => {
      setSubcategories(subs);
      if (subs.length > 0) setSelectedSubcategory(subs[0]);
    });
  }, []);

  // Завантажити атрибути для вибраної підкатегорії
  useEffect(() => {
    if (!selectedSubcategory) return;
    setLoading(true);
    fetchComponentsAttributes(selectedSubcategory.id).then(attrs => {
      setFilters(attrs);
      Promise.all(
        attrs.map(attr =>
          fetchComponentAttributeValues(selectedSubcategory.id, attr.id).then(values => ({ [attr.id]: values }))
        )
      ).then(valuesArr => {
        const valuesObj = valuesArr.reduce((acc, v) => ({ ...acc, ...v }), {});
        setFilterValues(valuesObj);
      });
    }).finally(() => setLoading(false));
  }, [selectedSubcategory]);

  // Завантажити товари при зміні фільтрів, підкатегорії або сторінки
  useEffect(() => {
    if (!selectedSubcategory) return;
    setLoading(true);
    let filter = {};
    Object.entries(selectedFilters).forEach(([attrId, value]) => {
      if (value) filter[attrId] = value;
    });
    fetchComponentsProducts({
      filter,
      limit: 16,
      page,
      categoryId: selectedSubcategory.id,
    })
      .then(data => {
        setProducts(data);
        setTotalPages(Math.ceil((data.length ? data[0].totalCount || 100 : 100) / 16));
      })
      .finally(() => setLoading(false));
  }, [selectedFilters, page, selectedSubcategory]);

  const handleFilterChange = (attrId, value) => {
    setSelectedFilters(prev => ({ ...prev, [attrId]: value }));
    setPage(1);
  };

  const handleSubcategoryClick = (cat) => {
    setSelectedSubcategory(cat);
    setSelectedFilters({});
    setProducts([]);
    setFilters([]);
    setFilterValues({});
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
              {subcategories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`sidebar-category-btn${selectedSubcategory && selectedSubcategory.id === cat.id ? ' selected' : ''}`}
                    onClick={() => handleSubcategoryClick(cat)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {selectedSubcategory && (
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
          <h1 className="section-title">{selectedSubcategory ? selectedSubcategory.name : 'Оберіть категорію'}</h1>
          <div className="peripherals-products">
            {loading ? (
              <div>Завантаження...</div>
            ) : (
              <div className="product-grid">
                {products.length === 0 && <div>Товарів не знайдено</div>}
                {products.map(product => (
                  <ProductCardItem key={product.id} product={product} />
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
