const API_BASE_URL = 'http://192.168.0.104:3000';

export async function fetchProducts() {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const data = await res.json();
    return data;
}

export async function fetchFilteredProducts({ limit = 5, category = '' } = {}) {
    const res = await fetch(`${API_BASE_URL}/api/products/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit,
        category,
      }),
    });
  
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }
  
    const data = await res.json();
    return data;
  }
  
// (async () => {
//   const products = await fetchProducts();
//   products.map(product => {
//     console.log(product); // Log each product object
//   });
//   // console.log(products);
// })();