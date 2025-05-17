const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if user already exists
        const username = 'benjamingonzalez197160551';
        const email = 'benjamin.gonzalez@example.com';
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('User already exists:', username);
            return;
        }

        // Hash the password
        const password = 'YZYsll808$';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            balance: 10000,
            rouletteSpins: 5,
            fruitSpins: 5,
            diceRolls: 5,
            isAdmin: true
        });

        // Save user to database
        await adminUser.save();
        console.log('Admin user created successfully:', username);

        // Close connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser();