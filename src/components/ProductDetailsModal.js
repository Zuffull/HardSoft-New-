import React, { useEffect, useState } from 'react';
import '../styles/AuthModal.css';
import { fetchProductSpecs } from '../api/productApiV2.js';

export default function ProductDetailsModal({ product, onClose }) {
  const [specs, setSpecs] = useState(null);
  useEffect(() => {
    if (!product?.id) return;
    fetchProductSpecs(product.id)
      .then(setSpecs)
      .catch(() => setSpecs(null));
  }, [product]);

  if (!product) return null;
  console.log('Product in modal:', product);
  const attrs = product.attributes || {};
  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal product-details-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="pdm-content">
          <div className="pdm-image-block">
            <img
              className="auth-modal-product-image pdm-big-image"
              src={product.img || product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              style={{ width: '100%', maxWidth: 350, maxHeight: 350, objectFit: 'contain', background: '#f5f5f5', borderRadius: 12 }}
            />
          </div>
          <div className="pdm-main-info">
            <h2 className="pdm-title">{product.name}</h2>
            <div className="pdm-meta">
              <span className="pdm-sku">Код: {product.sku}</span>
              <span className="pdm-rating">★ {product.averageRating} / 5</span>
            </div>
            <div className="pdm-price-row">
              <span className="pdm-price">{Number(product.price).toLocaleString('uk-UA')} ₴</span>
              <button className="pdm-cart-btn">В кошик</button>
            </div>
            <div style={{margin: '16px 0 8px 0', fontWeight: 600, color: '#ff8001', fontSize: '1.1em'}}>Характеристики</div>
            <div style={{maxHeight: 350, overflowY: 'auto', borderRadius: 8, background: '#23272f'}}>
              {specs ? (
                <table className="pdm-specs-table" style={{width: '100%'}}>
                  <tbody>
                    {Object.entries(specs).map(([key, value], i) => (
                      <tr key={i}>
                        <td className="pdm-spec-label">{key}</td>
                        <td className="pdm-spec-value">{value || 'Не вказано'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{color: '#bbb', padding: 12}}>Характеристики не знайдено</div>
              )}
            </div>
            <div style={{margin: '18px 0 0 0', fontWeight: 600, color: '#ff8001', fontSize: '1.1em'}}>Опис</div>
            <div className="pdm-description" style={{color: '#fff', background: '#23272f', borderRadius: 8, padding: '12px 16px', marginTop: 4, minHeight: 32}}>
              {product.description
                ? product.description
                : (() => {
                    let mainSpecs = specs ? Object.entries(specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
                    return `Комп'ютер "${product.name}"${mainSpecs ? ` (${mainSpecs})` : ''} за ціною ${Number(product.price).toLocaleString('uk-UA')} ₴ — чудовий вибір для вашої роботи чи розваг!`;
                  })()
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 