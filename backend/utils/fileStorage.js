const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Paths
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');
const IMAGES_DIR = path.join(__dirname, '../data/images');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(PRODUCTS_FILE))) {
  fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Read products from file
const getProducts = () => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
};

// Write products to file
const saveProducts = (products) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
};

// Get a product by ID
const getProductById = (id) => {
  const products = getProducts();
  return products.find(product => product.id === id);
};

// Add a new product
const addProduct = (productData, imageFile = null) => {
  try {
    const products = getProducts();
    const newProduct = {
      id: uuidv4(),
      ...productData,
      createdAt: new Date().toISOString()
    };

    // Handle image file if provided
    if (imageFile) {
      const imageExtension = path.extname(imageFile.originalname);
      const imageName = `${newProduct.id}${imageExtension}`;
      const imagePath = path.join(IMAGES_DIR, imageName);
      
      fs.writeFileSync(imagePath, imageFile.buffer);
      newProduct.imagePath = `/api/products/images/${imageName}`;
      newProduct.contentType = imageFile.mimetype;
    }

    products.push(newProduct);
    saveProducts(products);
    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update a product
const updateProduct = (id, updateData, imageFile = null) => {
  try {
    const products = getProducts();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedProduct = {
      ...products[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Handle image file if provided
    if (imageFile) {
      const imageExtension = path.extname(imageFile.originalname);
      const imageName = `${updatedProduct.id}${imageExtension}`;
      const imagePath = path.join(IMAGES_DIR, imageName);
      
      fs.writeFileSync(imagePath, imageFile.buffer);
      updatedProduct.imagePath = `/api/products/images/${imageName}`;
      updatedProduct.contentType = imageFile.mimetype;
    }

    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product
const deleteProduct = (id) => {
  try {
    const products = getProducts();
    const productToDelete = products.find(product => product.id === id);
    
    if (!productToDelete) {
      return false;
    }

    // Delete associated image if exists
    if (productToDelete.imagePath) {
      const imageName = path.basename(productToDelete.imagePath);
      const imagePath = path.join(IMAGES_DIR, imageName);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get image file
const getProductImage = (imageName) => {
  const imagePath = path.join(IMAGES_DIR, imageName);
  
  if (!fs.existsSync(imagePath)) {
    return null;
  }
  
  return {
    data: fs.readFileSync(imagePath),
    path: imagePath
  };
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductImage
}; 