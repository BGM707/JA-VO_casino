const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Por favor proporciona usuario, correo y contraseña.' });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ message: 'Correo electrónico inválido.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (username.length < 3) {
        return res.status(400).json({ message: 'El nombre de usuario debe tener al menos 3 caracteres.' });
    }

    try {
        // Check for existing user
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'El usuario o correo ya está registrado.' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password,
            balance: 10000, // Initial balance
            rouletteSpins: 5,
            fruitSpins: 5,
            diceRolls: 5
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, message: 'Usuario creado exitosamente.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error al crear el usuario. Intenta de nuevo.' });
    }
});

// Login (unchanged from previous)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
});

// Profile (unchanged)
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener perfil.' });
    }
});

// Play routes (unchanged, included for completeness)
router.post('/play/roulette', auth, async (req, res) => {
    const { bet } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.rouletteSpins <= 0) {
            return res.status(400).json({ message: 'No te quedan giros.' });
        }
        if (user.balance < bet) {
            return res.status(400).json({ message: 'Saldo insuficiente.' });
        }
        user.balance -= bet;
        user.rouletteSpins -= 1;
        const result = Math.floor(Math.random() * 3); // Simplified for 3 sections
        let winnings = 0;
        if (result === 1) winnings = bet * 2; // Example win condition
        user.balance += winnings;
        await user.save();
        res.json({ result, winnings, newBalance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al jugar ruleta.' });
    }
});

router.post('/play/fruits', auth, async (req, res) => {
    const { bet } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.fruitSpins <= 0) {
            return res.status(400).json({ message: 'No te quedan giros.' });
        }
        if (user.balance < bet) {
            return res.status(400).json({ message: 'Saldo insuficiente.' });
        }
        user.balance -= bet;
        user.fruitSpins -= 1;
        const slots = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
        let winnings = 0;
        if (slots[0] === slots[1] && slots[1] === slots[2]) {
            const multipliers = [10, 5, 3, 2, 1.5];
            winnings = bet * multipliers[slots[0]];
        }
        user.balance += winnings;
        await user.save();
        res.json({ winnings, newBalance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al jugar frutillas.' });
    }
});

router.post('/play/dice', auth, async (req, res) => {
    const { bet, option } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.diceRolls <= 0) {
            return res.status(400).json({ message: 'No te quedan lanzamientos.' });
        }
        if (user.balance < bet) {
            return res.status(400).json({ message: 'Saldo insuficiente.' });
        }
        user.balance -= bet;
        user.diceRolls -= 1;
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        const total = roll1 + roll2;
        let winnings = 0;
        if (option === 'over7' && total > 7) winnings = bet * 2;
        else if (option === 'under7' && total < 7) winnings = bet * 2;
        else if (option === 'exact7' && total === 7) winnings = bet * 4;
        else if (option === 'doubles' && roll1 === roll2) winnings = bet * 5;
        user.balance += winnings;
        await user.save();
        res.json({ roll1, roll2, winnings, newBalance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al jugar dados.' });
    }
});

module.exports = router;