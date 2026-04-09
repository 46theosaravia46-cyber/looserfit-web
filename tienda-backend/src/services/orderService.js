const Order = require('../models/Order');
const Product = require('../models/product');
const crypto = require('crypto');
const { enviarEmailPedido, enviarEmailSeguimiento, enviarEmailNotificacionAdmin } = require('../config/email');

const createOrder = async (orderData) => {
    const { productos = [], total, tipoEnvio, datosEnvio, usuario } = orderData;
    
    const productosPedido = [];
    let totalCalculado = 0;

    for (const item of productos) {
        const productoDB = await Product.findById(item.productoId);
        if (!productoDB) throw new Error(`Producto no encontrado: ${item.productoId}`);

        const cantidad = Number(item.cantidad) || 0;
        if (cantidad <= 0) throw new Error(`Cantidad inválida para ${productoDB.nombre}`);
        if ((productoDB.stock || 0) < cantidad) throw new Error(`Stock insuficiente para ${productoDB.nombre}`);

        productosPedido.push({
            productoId: productoDB._id,
            nombre: productoDB.nombre,
            cantidad,
            precio: productoDB.precio,
            talle: item.talle || '',
            imagen: item.imagen || (productoDB.imagenes && productoDB.imagenes[0]) || ''
        });

        totalCalculado += productoDB.precio * cantidad;
    }

    // El stock ya no se descuenta aquí, sino en el webhook tras el pago.
    // Solo mantenemos la verificación inicial de stock arriba.

    const totalPedidos = await Order.countDocuments();
    const orderNumber = `#${String(totalPedidos + 1).padStart(3, '0')}`;
    const shippingCost = tipoEnvio === 'domicilio' ? 9500 : 6500;
    const totalFinal = totalCalculado + shippingCost;
    const trackingToken = crypto.randomBytes(16).toString('hex');

    const nuevoPedido = new Order({
        productos: productosPedido,
        total: totalFinal,
        tipoEnvio,
        datosEnvio,
        usuario,
        estado: 'Pendiente',
        orderNumber,
        trackingToken,
        shippingCost,
        comprobante: orderData.comprobante
    });

    await nuevoPedido.save();

    // Enviar email al cliente (asincrónico)
    enviarEmailPedido(datosEnvio, nuevoPedido).catch(console.error);

    return nuevoPedido;
};

const getAllOrders = async () => {
    return await Order.find().sort({ createdAt: -1 });
};

const getOrdersByUser = async (usuarioId) => {
    return await Order.find({ usuario: usuarioId }).sort({ createdAt: -1 });
};

const getOrderById = async (id) => {
    return await Order.findById(id);
};

const getOrderByToken = async (token) => {
    return await Order.findOne({ trackingToken: token });
};

const updateOrderStatus = async (id, estado) => {
    const pedido = await Order.findByIdAndUpdate(id, { estado }, { new: true });
    
    if (pedido) {
        const { datosEnvio } = pedido;
        if (estado === 'Empaquetado') {
            const { enviarEmailEmpaquetado } = require('../config/email');
            enviarEmailEmpaquetado(datosEnvio, pedido).catch(console.error);
        } else if (estado === 'Pagado') {
            const { enviarEmailPagoAprobado, enviarEmailNotificacionAdmin } = require('../config/email');
            enviarEmailPagoAprobado(datosEnvio, pedido).catch(console.error);
            // Notificar al admin también que un pago fue aprobado
            enviarEmailNotificacionAdmin(pedido).catch(console.error);
        }
    }
    
    return pedido;
};

const updateTracking = async (id, trackingNumber) => {
    const pedido = await Order.findByIdAndUpdate(id, { trackingNumber }, { new: true });
    if (pedido && trackingNumber) {
        enviarEmailSeguimiento(pedido.datosEnvio, trackingNumber, pedido.orderNumber).catch(console.error);
    }
    return pedido;
};

const uploadComprobante = async (id, comprobantePath) => {
    return await Order.findByIdAndUpdate(id, { comprobante: comprobantePath }, { new: true });
};

const deleteOrder = async (id) => {
    return await Order.findByIdAndDelete(id);
};

const bulkDeleteOrders = async (ids) => {
    return await Order.deleteMany({ _id: { $in: ids } });
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrdersByUser,
    getOrderById,
    getOrderByToken,
    updateOrderStatus,
    updateTracking,
    uploadComprobante,
    deleteOrder,
    bulkDeleteOrders
};
