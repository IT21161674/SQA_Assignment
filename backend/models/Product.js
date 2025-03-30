const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: {
        data: { type: Buffer },
        contentType: { type: String }
    },
    category: { type: String },
  });
  module.exports = mongoose.model('Product', productSchema);