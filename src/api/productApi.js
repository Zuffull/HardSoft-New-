const API_BASE_URL = 'http://192.168.0.105:3000';

export async function fetchProducts() {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const data = await res.json();
    return data;
}
//POST	/api/products/filter	Body: page?, limit?, sort?, filter?, brand?, category?	Філь
//id category e441c0a1-eb2b-45f7-a6b7-021288771a2a

// Отримати всі категорії
export async function fetchAllCategories() {
  const res = await fetch(`${API_BASE_URL}/api/products/categories`);
  if (!res.ok) throw new Error('Не вдалося отримати категорії');
  return res.json();
}

// Отримати категорію по назві
export async function fetchCategoryByName(name) {
  const categories = await fetchAllCategories();
  return categories.find(cat => cat.name === name);
}

export async function fetch324Products({ 
  page = 1, 
  limit = 5, 
  sort = '', 
  filter = '', 
  brand = '', 
  categoryName = '' // комп'ютери
} = {}) {
  let categoryId = '';
  if (categoryName) {
    const category = await fetchCategoryByName(categoryName);
    if (category) categoryId = category.id;
  }

  const requestBody = {
    page: Number(page),
    limit: Number(limit)
  };

  // Only add non-empty string parameters
  if (sort) requestBody.sort = sort;
  if (filter) requestBody.filter = filter;
  if (brand) requestBody.brand = brand;
  if (categoryId) requestBody.category = categoryId;

  const res = await fetch(`${API_BASE_URL}/api/products/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Fetch failed: ${res.status}. ${errorData}`);
  }

  // Fetch full product details for each product
  const data = await res.json();
  const productsWithDetails = await Promise.all(
    data.map(async (product) => {
      const detailRes = await fetch(`${API_BASE_URL}/api/products/${product.id}`);
      if (!detailRes.ok) return product;
      const detailData = await detailRes.json();
      return detailData;
    })
  );

  console.log(productsWithDetails);
  return productsWithDetails;
}
  
// (async () => {
//   const products = await fetchProducts();
//   products.map(product => {
//     console.log(product); // Log each product object
//   });
//   // console.log(products);
// })();

const products = await fetch324Products({ categoryName: "Готові ПК" });

export async function getServerSideProps() {
  const products = await fetch324Products({ categoryName: "Готові ПК" });
  return { props: { products } };
}