import { fetchAllCategories, fetchCategoryByName, fetch324Products } from './productApi';
import { fetchCategoryAttributes, fetchAttributeValues } from './systemblocksApi';

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

export async function fetchPeripheralCategories() {
  const all = await fetchAllCategories();
  return all.filter(cat => PERIPHERAL_CATEGORIES.includes(cat.name));
}

export async function fetchPeripheralCategoryByName(name) {
  const cats = await fetchPeripheralCategories();
  return cats.find(cat => cat.name === name);
}

export async function fetchPeripheralCategoryAttributes(categoryId) {
  return fetchCategoryAttributes(categoryId);
}

export async function fetchPeripheralAttributeValues(categoryId, attributeId) {
  return fetchAttributeValues(categoryId, attributeId);
}

export async function fetchPeripheralProducts({ categoryName, filter = {}, limit = 20, sort = '', brand = '' }) {
  return fetch324Products({ categoryName, filter, limit, sort, brand });
}

export const CATEGORY_ATTRIBUTES = {
  'Монітори': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Діагональ', label: 'Діагональ' },
    { key: 'Роздільна здатність', label: 'Роздільна здатність' },
    { key: 'Тип матриці', label: 'Тип матриці' },
    { key: 'Час відгуку', label: 'Час відгуку' },
    { key: 'Максимальна частота оновлення', label: 'Частота оновлення' },
  ],
  'Миші': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип сенсора', label: 'Тип сенсора' },
    { key: 'Кількість кнопок', label: 'Кнопок' },
    { key: 'DPI', label: 'DPI' },
    { key: 'Підключення', label: 'Підключення' },
  ],
  'Клавіатури': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип перемикачів', label: 'Перемикачі' },
    { key: 'Підсвічування', label: 'Підсвічування' },
    { key: 'Підключення', label: 'Підключення' },
    { key: 'Форм-фактор', label: 'Форм-фактор' },
  ],
  'Комплекти (миша+клавіатура)': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип клавіатури', label: 'Тип клавіатури' },
    { key: 'Тип миші', label: 'Тип миші' },
    { key: 'Підключення', label: 'Підключення' },
  ],
  'Поверхні': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Матеріал', label: 'Матеріал' },
    { key: 'Розмір', label: 'Розмір' },
    { key: 'Тип поверхні', label: 'Тип поверхні' },
  ],
  'Гарнітура': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип', label: 'Тип' },
    { key: 'Підключення', label: 'Підключення' },
    { key: 'Мікрофон', label: 'Мікрофон' },
    { key: 'Частотний діапазон', label: 'Частотний діапазон' },
  ],
  'Акустика': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип', label: 'Тип' },
    { key: 'Потужність', label: 'Потужність' },
    { key: 'Підключення', label: 'Підключення' },
  ],
  'Веб-камери': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Роздільна здатність', label: 'Роздільна здатність' },
    { key: 'Мікрофон', label: 'Мікрофон' },
    { key: 'Підключення', label: 'Підключення' },
  ],
  'Мережеве обладнання': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип', label: 'Тип' },
    { key: 'Швидкість', label: 'Швидкість' },
    { key: 'Інтерфейс', label: 'Інтерфейс' },
  ],
  'Різне': [
    { key: 'Виробник', label: 'Виробник' },
    { key: 'Тип', label: 'Тип' },
    { key: 'Сумісність', label: 'Сумісність' },
  ],
};
