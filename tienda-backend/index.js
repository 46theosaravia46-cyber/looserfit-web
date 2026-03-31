require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- 1. Lo importás acá arriba con los demás


// 1. IMPORTAMOS LAS RUTAS (Acá le avisamos que existe el archivo de rutas)
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <--- NUEVO: Gestiones internas admin
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();

// Middleware para entender JSON (importante para recibir productos)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', // <--- AGREGADO: Nueva variante de puerto Vite
    'http://192.168.0.14:5173',
    'https://looserfit-app-final.loca.lt', // <--- NUEVO: Túnel remoto definitivo
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
app.use(express.json());

// 2. USAMOS LAS RUTAS (Acá le decimos: "Cualquier link que empiece con /api/products, mandalo al ayudante")
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // <--- NUEVO: Newsletter y otros
app.use('/api/payments', paymentRoutes);

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