const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Order = require('../models/Order');
const Product = require('../models/product');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// Crear Preferencia de Pago
router.post('/create-preference', async (req, res) => {
    try {
        const { orderId } = req.body;
        const pedido = await Order.findById(orderId);

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // --- VERIFICAR STOCK ANTES DE MERCADO PAGO ---
        for (const item of pedido.productos) {
            const productoDB = await Product.findById(item.productoId);
            if (!productoDB) {
                return res.status(400).json({ mensaje: `Producto no encontrado: ${item.nombre}` });
            }
            if (productoDB.stock < item.cantidad) {
                return res.status(400).json({ 
                    mensaje: `Lo sentimos, ya no queda stock suficiente de "${item.nombre}". Stock disponible: ${productoDB.stock}` 
                });
            }
        }

        const items = pedido.productos.map(p => ({
            id: p.productoId.toString(),
            title: p.nombre,
            quantity: p.cantidad,
            unit_price: p.precio,
            currency_id: 'ARS'
        }));

        if (pedido.shippingCost && pedido.shippingCost > 0) {
            items.push({
                id: 'shipping',
                title: 'Costo de envío',
                quantity: 1,
                unit_price: pedido.shippingCost,
                currency_id: 'ARS'
            });
        }

        const preference = new Preference(client);
        const frontendUrl = process.env.FRONTEND_URL || 'https://looserfit-app-final.loca.lt';
        const body = {
            items,
            back_urls: {
                success: `${frontendUrl}/pedido-exito`,
                failure: `${frontendUrl}/carrito`,
                pending: `${frontendUrl}/pedido-exito`
            },
            auto_return: 'all',
            external_reference: orderId,
            notification_url: `${process.env.BACKEND_URL || 'https://looserfit-api.onrender.com'}/api/payments/webhook`
        };

        console.log('Enviando body a Mercado Pago:', JSON.stringify(body, null, 2));

        const result = await preference.create({ body });

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('Error al crear preferencia:', error);
        res.status(500).json({ mensaje: 'Error al crear la preferencia de pago', error: error.message });
    }
});

// Webhook para recibir notificaciones de Mercado Pago
router.post('/webhook', async (req, res) => {
    const topic = req.query.topic || req.query.type || req.body.type || req.body.topic;
    const paymentId = req.query.id || req.query['data.id'] || req.body.id || req.body['data.id'] || req.body.data?.id;

    try {
        if (topic === 'payment' && paymentId) {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mercado Pago API error: ${response.status} ${errorText}`);
            }

            const paymentData = await response.json();
            const orderId = paymentData.external_reference || req.body.data?.object?.external_reference || req.body.external_reference;

            console.log(`[Webhook MP] Pago ${paymentId} - Estado: ${paymentData.status} - Detalle: ${paymentData.status_detail}`);

            if (!orderId) {
                console.warn('Webhook recibido sin external_reference válido:', paymentId);
                return res.sendStatus(200);
            }

            if (paymentData.status === 'approved') {
                const pedido = await Order.findById(orderId);
                if (pedido && pedido.estado !== 'Pagado') {
                    // --- DESCONTAR STOCK AL CONFIRMAR PAGO ---
                    for (const item of pedido.productos) {
                        await Product.findByIdAndUpdate(item.productoId, { 
                            $inc: { stock: -item.cantidad } 
                        });
                    }

                    const orderService = require('../services/orderService');
                    await orderService.updateOrderStatus(orderId, 'Pagado');
                    console.log(`✅ [Webhook MP] Pedido ${orderId} marcado como Pagado.`);
                }
            } else if (['pending', 'in_process'].includes(paymentData.status)) {
                console.log(`⏳ [Webhook MP] Pedido ${orderId} está pendiente de acreditación (${paymentData.status_detail})`);
            } else {
                console.log(`❌ [Webhook MP] Pedido ${orderId} falló o fue rechazado: ${paymentData.status}`);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error en webhook:', error);
        res.sendStatus(200);
    }
});

module.exports = router;
