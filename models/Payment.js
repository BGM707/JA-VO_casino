const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rut: { type: String, required: true },
    email: { type: String, required: true },
    game: { type: String, required: true },
    count: { type: Number, required: true },
    prize: { type: String, required: true },
    comments: { type: String },
    receiptUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);