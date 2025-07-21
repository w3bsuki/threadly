// Simple API test script
const API_BASE = 'http://localhost:3002';

async function testAPIs() {

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();

    // Test categories endpoint
    const categoriesResponse = await fetch(`${API_BASE}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      categoriesData.data.categories.forEach((cat: any) => {
      });
    } else {
    }

    // Test products endpoint
    const productsResponse = await fetch(`${API_BASE}/api/products?limit=5`);
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      
      if (productsData.data.products.length > 0) {
        productsData.data.products.slice(0, 3).forEach((product: any) => {
        });
      }
    } else {
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run tests if this file is executed directly
testAPIs().catch(console.error);

export { testAPIs };