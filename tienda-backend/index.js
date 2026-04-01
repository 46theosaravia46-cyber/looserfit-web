require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- 1. Lo importás acá arriba con los demás


// 1. IMPORTAMOS LAS RUTAS (Acá le avisamos que existe el archivo de rutas)
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // <--- NUEVO: Gestiones internas admin
const paymentRoutes = require('./src/routes/paymentRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes'); // <--- NUEVO: Entidad categorías
const app = express();

// Middleware para entender JSON (importante para recibir productos)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.0.14:5173',
    'https://looserfit-web-eight.vercel.app',
    'https://looserfit.com',
    'https://www.looserfit.com',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permite herramientas como Postman/same-origin sin header Origin
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origen no permitido por CORS'));
    }
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. USAMOS LAS RUTAS (Acá le decimos: "Cualquier link que empiece con /api/products, mandalo al ayudante")
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // <--- NUEVO: Newsletter y otros
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes); // <--- NUEVO

// --- Conexión MongoDB ---
const linkSeguro = process.env.MONGO_URI;

if (!linkSeguro) {
    console.error('❌ MONGO_URI no configurada en .env');
    process.exit(1);
}

mongoose.connect(linkSeguro)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => console.error('❌ Error de conexión:', err));
// -------------------------------------------------------

app.get('/', (req, res) => {
    res.send('Servidor de Losserfit funcionando 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});