
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/product');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find().populate('categoria');
        console.log(`Found ${products.length} products`);
        products.forEach(p => {
            console.log(`- ${p.nombre} (${p.categoria?.name}):`, JSON.stringify(p.talles));
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

check();
