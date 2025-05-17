const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

// Get all users
router.get('/users', auth.admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
});

// Update user
router.put('/users/:id', auth.admin, async (req, res) => {
    const { username, email, balance, rouletteSpins, fruitSpins, diceRolls, isAdmin } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        user.username = username || user.username;
        user.email = email || user.email;
        user.balance = balance !== undefined ? balance : user.balance;
        user.rouletteSpins = rouletteSpins !== undefined ? rouletteSpins : user.rouletteSpins;
        user.fruitSpins = fruitSpins !== undefined ? fruitSpins : user.fruitSpins;
        user.diceRolls = diceRolls !== undefined ? diceRolls : user.diceRolls;
        user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
        await user.save();
        res.json({ message: 'Usuario actualizado.', user: user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
});

// Delete user
router.delete('/users/:id', auth.admin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Usuario eliminado.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
});

// Get all payments
router.get('/payments', auth.admin, async (req, res) => {
    try {
        const payments = await Payment.find().populate('userId', 'username email');
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error al obtener pagos.' });
    }
});

// Approve/Reject payment
router.put('/payments/:id', auth.admin, async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Estado inválido.' });
    }
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Pago no encontrado.' });
        }
        payment.status = status;
        await payment.save();
        if (status === 'approved') {
            const user = await User.findById(payment.userId);
            if (payment.game === 'roulette') user.rouletteSpins += payment.count;
            if (payment.game === 'fruits') user.fruitSpins += payment.count;
            if (payment.game === 'dice') user.diceRolls += payment.count;
            await user.save();
        }
        res.json({ message: `Pago ${status === 'approved' ? 'aprobado' : 'rechazado'}.` });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ message: 'Error al actualizar pago.' });
    }
});

// Get game statistics
router.get('/stats', auth.admin, async (req, res) => {
    try {
        const users = await User.find();
        const payments = await Payment.find();
        const stats = {
            totalUsers: users.length,
            totalBets: users.reduce((sum, user) => sum + (user.balance < 10000 ? 10000 - user.balance : 0), 0),
            totalWinnings: users.reduce((sum, user) => sum + (user.balance > 10000 ? user.balance - 10000 : 0), 0),
            totalSpins: {
                roulette: users.reduce((sum, user) => sum + (5 - user.rouletteSpins), 0),
                fruits: users.reduce((sum, user) => sum + (5 - user.fruitSpins), 0),
                dice: users.reduce((sum, user) => sum + (5 - user.diceRolls), 0)
            },
            totalPayments: payments.length,
            pendingPayments: payments.filter(p => p.status === 'pending').length
        };
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas.' });
    }
});

module.exports = router;