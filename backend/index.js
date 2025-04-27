const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Import Product model
const Product = require('./models/Product');

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
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product image
app.get('/api/products/:id/image', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      return res.status(404).json({ message: 'Product or image not found' });
    }
    res.set('Content-Type', product.image.contentType);
    res.send(product.image.data);
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
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      } : null
    };
    
    console.log('Creating product with data:', productData);
    const product = new Product(productData);
    const newProduct = await product.save();
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
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    console.log('Product updated successfully:', product);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    await Product.findByIdAndDelete(req.params.id);
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));