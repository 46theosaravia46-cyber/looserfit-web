const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/product');
const upload = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { enviarEmailPedido, enviarEmailSeguimiento, enviarEmailNotificacionAdmin } = require('../config/email');

// Subir comprobante de pago
router.post('/upload-comprobante/:id', upload.single('comprobante'), async (req, res) => {
    try {
        const pedido = await Order.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        if (!req.file || !req.file.path) {
            return res.status(400).json({ mensaje: 'No se recibió el comprobante' });
        }

        pedido.comprobante = req.file.path;
        await pedido.save();

        res.json({ mensaje: 'Comprobante subido con éxito', pedido });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al subir comprobante', error: error.message });
    }
});

// Crear un nuevo pedido (El Ticket)
router.post('/create', async (req, res) => {
    try {
        const { productos = [], total, tipoEnvio, datosEnvio, usuario } = req.body;

        // Validaciones básicas del checkout
        const localidad = String(datosEnvio?.localidad || '').trim()
        const direccionSucursal = String(datosEnvio?.direccionSucursal || '').trim()
        const calleNumero = String(datosEnvio?.calleNumero || '').trim()

        const localidadValida = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,}$/
        if (!localidadValida.test(localidad)) {
            return res.status(400).json({ mensaje: 'Localidad inválida. Ingresá una localidad real.' })
        }

        if (tipoEnvio === 'sucursal') {
            if (!direccionSucursal || direccionSucursal.trim().length < 3) {
                return res.status(400).json({ mensaje: 'Dirección de sucursal inválida. Debe ser una dirección válida.' })
            }
        }

        if (tipoEnvio === 'domicilio' && !calleNumero) {
            return res.status(400).json({ mensaje: 'Calle y número son obligatorios para envío a domicilio.' })
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ mensaje: 'El pedido no tiene productos.' });
        }

        // Validar stock real y armar snapshot de productos usando datos de DB
        const productosPedido = [];
        let totalCalculado = 0;

        for (const item of productos) {
            const productoDB = await Product.findById(item.productoId);
            if (!productoDB) {
                return res.status(404).json({ mensaje: `Producto no encontrado: ${item.productoId}` });
            }

            const cantidad = Number(item.cantidad) || 0;
            if (cantidad <= 0) {
                return res.status(400).json({ mensaje: `Cantidad invalida para ${productoDB.nombre}` });
            }

            if ((productoDB.stock || 0) < cantidad) {
                return res.status(400).json({
                    mensaje: `Stock insuficiente para ${productoDB.nombre}. Disponible: ${productoDB.stock || 0}`
                });
            }

            productosPedido.push({
                productoId: productoDB._id,
                nombre: productoDB.nombre,
                cantidad,
                precio: productoDB.precio,
                talle: item.talle || '',
                imagen: item.imagen || productoDB.imagenes?.[0] || ''
            });

            totalCalculado += productoDB.precio * cantidad;
        }

        // Descontar stock
        for (const item of productosPedido) {
            await Product.findByIdAndUpdate(
                item.productoId,
                { $inc: { stock: -item.cantidad } }
            );
        }

        // Generar número de orden secuencial (#001, #002, ...)
        const totalPedidos = await Order.countDocuments();
        const orderNumber = `#${String(totalPedidos + 1).padStart(3, '0')}`

        const shippingCost = tipoEnvio === 'domicilio' ? 9500 : 6500
        const totalFinal = totalCalculado + shippingCost

        const nuevoPedido = new Order({
            productos: productosPedido,
            total: totalFinal,
            tipoEnvio,
            datosEnvio,
            usuario, // Nuevo: Vincular al usuario registrado
            estado: 'Pendiente',
            orderNumber,
            shippingCost
        });
        await nuevoPedido.save();
        
        // Enviar email de confirmación de pedido al cliente (asincrónico, sin esperar)
        enviarEmailPedido(datosEnvio, nuevoPedido).catch(err => 
            console.error('Error enviando email:', err)
        );

        // Enviar notificación al admin
        enviarEmailNotificacionAdmin(nuevoPedido).catch(err => 
            console.error('Error enviando notificación al admin:', err)
        );
        
        res.status(201).json({ mensaje: 'Ticket generado con éxito', pedido: nuevoPedido });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al generar el ticket', error: error.message });
    }
});

// Ver todos los pedidos (Solo Admin)
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const pedidos = await Order.find().sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos' });
    }
});

// Ver pedido por ID
router.get('/:id', async (req, res) => {
    try {
        const pedido = await Order.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedido', error: error.message });
    }
});

// Cambiar estado del pedido (Solo Admin)
router.patch('/:id/estado', protect, adminOnly, async (req, res) => {
    try {
        const { estado } = req.body;
        const permitidos = ['Pendiente', 'Pagado', 'Empaquetado', 'Enviado', 'Entregado', 'Cancelado'];
        if (!permitidos.includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado no valido' });
        }

        const pedido = await Order.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        res.json({ mensaje: 'Estado actualizado', pedido });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
    }
});

// Actualizar número de seguimiento (Solo Admin)
router.patch('/:id/tracking', protect, adminOnly, async (req, res) => {
    try {
        const { trackingNumber } = req.body;
        const pedido = await Order.findByIdAndUpdate(
            req.params.id,
            { trackingNumber },
            { new: true }
        );

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // Enviar email de seguimiento (asincrónico)
        if (trackingNumber) {
            enviarEmailSeguimiento(pedido.datosEnvio, trackingNumber, pedido.orderNumber).catch(err => 
                console.error('Error enviando email de seguimiento:', err)
            );
        }

        res.json({ mensaje: 'Seguimiento actualizado', pedido });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar seguimiento', error: error.message });
    }
});

module.exports = router;