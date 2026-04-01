const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json({ mensaje: 'Ticket generado con éxito', pedido: order });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al generar el ticket', error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedido', error: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        const permitidos = ['Pendiente', 'Pagado', 'Empaquetado', 'Enviado', 'Entregado', 'Cancelado'];
        if (!permitidos.includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado no válido' });
        }

        const order = await orderService.updateOrderStatus(req.params.id, estado);
        if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        res.json({ mensaje: 'Estado actualizado', pedido: order });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
    }
};

const updateTracking = async (req, res) => {
    try {
        const { trackingNumber } = req.body;
        const order = await orderService.updateTracking(req.params.id, trackingNumber);
        if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        res.json({ mensaje: 'Seguimiento actualizado', pedido: order });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar seguimiento', error: error.message });
    }
};

const uploadComprobante = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ mensaje: 'No se recibió el comprobante' });
        }
        const order = await orderService.uploadComprobante(req.params.id, req.file.path);
        if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        res.json({ mensaje: 'Comprobante subido con éxito', pedido: order });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al subir comprobante', error: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateStatus,
    updateTracking,
    uploadComprobante
};
