const categories = {
  'Sıcak İçecekler': [
    { name: 'Çay', price: 2 },
    { name: 'Kahve', price: 3 },
    { name: 'Sıcak Çikolata', price: 4 },
    { name: 'Bitki Çayı', price: 3 }
  ],
  'Soğuk İçecekler': [
    { name: 'Su', price: 1 },
    { name: 'Gazoz', price: 2 },
    { name: 'Meyve Suyu', price: 3 },
    { name: 'Soğuk Çay', price: 2 },
    { name: 'Kola', price: 3 },
    { name: 'Fanta', price: 3 }
  ],
  'Çikolata Türevleri': [
    { name: 'Çikolata', price: 2 },
    { name: 'Gofret', price: 2 },
    { name: 'Bisküvi', price: 1 },
    { name: 'Kraker', price: 1 }
  ],
  'Tost Çeşitleri': [
    { name: 'Kaşarlı Tost', price: 5 },
    { name: 'Sucuklu Tost', price: 6 },
    { name: 'Karışık Tost', price: 7 },
    { name: 'Vegan Tost', price: 6 }
  ],
  Sandviç: [
    { name: 'Tavuklu Sandviç', price: 8 },
    { name: 'Köfte Sandviç', price: 9 },
    { name: 'Ton Balıklı Sandviç', price: 7 },
    { name: 'Peynirli Sandviç', price: 6 }
  ],
  Kızartma: [
    { name: 'Patates Kızartması', price: 4 },
    { name: 'Köfte', price: 5 },
    { name: 'Tavuk Nugget', price: 6 },
    { name: 'Cips', price: 3 }
  ]
};

function getProducts() {
  // Deep copy döndür - referans sorunlarını önle
  return JSON.parse(JSON.stringify(categories));
}

function findProduct(name) {
  for (const category of Object.values(categories)) {
    const item = category.find((product) => product.name === name);
    if (item) {
      return item;
    }
  }
  return null;
}

function updateProductPrice(name, price) {
  const product = findProduct(name);
  if (!product) {
    return null;
  }
  product.price = price;
  return product;
}

module.exports = {
  getProducts,
  findProduct,
  updateProductPrice
};