const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
  });
  module.exports = mongoose.model('Order', orderSchema);