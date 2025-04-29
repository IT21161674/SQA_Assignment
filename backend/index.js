const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the data/images directory at /api/products/images
app.use('/api/products/images', express.static(path.join(__dirname, 'data/images')));

// Import file storage utils
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductImage
} = require('./utils/fileStorage');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Basic Route
app.get('/', (req, res) => {
  res.send("E-Commerce API Running");
});

// Product Routes
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = getProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product image - this is now deprecated since we serve the images directory directly
app.get('/api/products/images/:imageName', async (req, res) => {
  try {
    const image = getProductImage(req.params.imageName);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const contentType = path.extname(req.params.imageName) === '.png' ? 'image/png' : 
                        path.extname(req.params.imageName) === '.jpg' || 
                        path.extname(req.params.imageName) === '.jpeg' ? 'image/jpeg' : 
                        'application/octet-stream';
                        
    res.set('Content-Type', contentType);
    res.send(image.data);
  } catch (error) {
    console.error('Error fetching product image:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Received image:', req.file ? 'Yes' : 'No');
    
    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      description: req.body.description,
      category: req.body.category
    };
    
    console.log('Creating product with data:', productData);
    const newProduct = addProduct(productData, req.file);
    console.log('Product created successfully:', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Update data:', req.body);
    
    const updateData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      description: req.body.description,
      category: req.body.category
    };

    const updatedProduct = updateProduct(req.params.id, updateData, req.file);
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product updated successfully:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    const result = deleteProduct(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));