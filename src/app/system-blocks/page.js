'use client';
import React, { useState } from 'react';
import Header from '@/components/Header';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import '@/styles/Filters.css';

function SystemProductCard({ product }) {
  return (
    <div className="systemproduct-card">
      <img src={product.img} alt={product.title || `Product ${product.id}`} />
      <div className="systemproduct-info">
        <h3 className="systemproduct-title">{product.title || 'Без назви'}</h3>
        <p className="systemproduct-id">ID: {product.id}</p>
        <ul className="systemproduct-specs">
          <li>Процесор: {product.processor}</li>
          <li>Відеокарта: {product.gpu}</li>
          <li>Тип пам'яті: {product.memoryType}</li>
          <li>Оперативна пам'ять: {product.ram}</li>
          <li>Накопичувач: {product.storage}</li>
        </ul>
        <p className="systemproduct-price">{product.price}</p>
        <div className="systemproduct-actions">
          <a href="#" className="systemproduct-button">В кошик</a>
          <button className="favorite-btn" title="Додати в обране">
            <img src="Обране(зірочка).png" alt="Обране" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SystemBlocks() {
  const products = Array.from({ length: 35 }, (_, index) => ({
    id: index + 1,
    price: `₴${1000 + index * 100}`,
    img: `https://picsum.photos/300/200?random=${index + 1}`,
    processor: index % 2 === 0 ? 'Intel Core i5' : 'AMD Ryzen 5',
    gpu: 'NVIDIA RTX 3060',
    memoryType: 'DDR4',
    ram: '16GB',
    storage: '512GB SSD',
  }));

  const [filters, setFilters] = useState({
    price: { min: '', max: '' },
    processor: [],
    cores: [],
    gpu: [],
    motherboard: [],
    ramType: [],
    ramSize: [],
    ssd: [],
    hdd: [],
    ssdM2: [],
    os: [],
  });

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCheckboxChange = (category, value) => {
    setFilters((prevFilters) => {
      const categoryFilters = prevFilters[category];
      const updatedFilters = categoryFilters.includes(value)
        ? categoryFilters.filter((item) => item !== value)
        : [...categoryFilters, value];
      return { ...prevFilters, [category]: updatedFilters };
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      price: { ...prevFilters.price, [name]: value },
    }));
  };

  const applyFilters = () => {
    const filtered = products.filter((product) => {
      const matchesProcessor =
        filters.processor.length === 0 ||
        filters.processor.some((p) => product.processor.includes(p));

      const priceValue = parseInt(product.price.replace(/[^\d]/g, ''), 10);
      const minPrice = parseInt(filters.price.min, 10) || 0;
      const maxPrice = parseInt(filters.price.max, 10) || Infinity;
      const matchesPrice = priceValue >= minPrice && priceValue <= maxPrice;

      return matchesProcessor && matchesPrice;
    });

    setCurrentPage(1); // Повертаєшся на першу сторінку
    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setFilters({
      price: { min: '', max: '' },
      processor: [],
      cores: [],
      gpu: [],
      motherboard: [],
      ramType: [],
      ramSize: [],
      ssd: [],
      hdd: [],
      ssdM2: [],
      os: [],
    });
    setCurrentPage(1);
    setFilteredProducts(products);
  };

  return (
    <div>
      <Header />
      <Categories />
      <div className="filters-and-products" style={{ display: 'flex', gap: '20px' }}>
        {/* Фільтри */}
        <div className="filters" style={{ flex: '1' }}>
          <div className="filter-category">
            <h3>Ціна</h3>
            <div className="price-inputs">
              <input
                type="number"
                name="min"
                placeholder="Від"
                value={filters.price.min}
                onChange={handlePriceChange}
              />
              <input
                type="number"
                name="max"
                placeholder="До"
                value={filters.price.max}
                onChange={handlePriceChange}
              />
            </div>
          </div>

          <div className="filter-category">
            <h3>Процесор</h3>
            <label>
              <input
                type="checkbox"
                checked={filters.processor.includes('Intel')}
                onChange={() => handleCheckboxChange('processor', 'Intel')}
              />
              Intel
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.processor.includes('AMD')}
                onChange={() => handleCheckboxChange('processor', 'AMD')}
              />
              AMD
            </label>
          </div>

          <div className="filter-buttons">
            <button className="apply-button" onClick={applyFilters}>
              Застосувати
            </button>
            <button className="reset-button" onClick={resetFilters}>
              Скинути
            </button>
          </div>
        </div>

        {/* Товари */}
        <div style={{ flex: '3' }}>
          <div className="systemproduct-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <SystemProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>Нічого не знайдено за обраними фільтрами</p>
            )}
          </div>

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="pagination" style={{ textAlign: 'center', marginTop: '20px' }}>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  style={{
                    margin: '0 5px',
                    padding: '5px 10px',
                    backgroundColor: currentPage === index + 1 ? '#333' : '#ccc',
                    color: currentPage === index + 1 ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
        <Footer />
    </div>
  );
}
