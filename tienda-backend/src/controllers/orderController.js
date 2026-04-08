const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        // Validar que venga el comprobante
        if (!req.file) {
            return res.status(400).json({ mensaje: 'El comprobante de pago es obligatorio' });
        }

        // En multipart/form-data, los objetos complejos a veces vienen como strings
        let { productos, datosEnvio, total, tipoEnvio } = req.body;
        
        if (typeof productos === 'string') productos = JSON.parse(productos);
        if (typeof datosEnvio === 'string') datosEnvio = JSON.parse(datosEnvio);

        const orderData = { 
            productos, 
            datosEnvio, 
            total, 
            tipoEnvio, 
            usuario: req.user._id,
            comprobante: req.file.path // Guardar URL de Cloudinary
        };

        const order = await orderService.createOrder(orderData);
        res.status(201).json({ mensaje: 'Ticket generado con éxito', pedido: order });
    } catch (error) {
        console.error('Error createOrder:', error);
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

const getOrdersMine = async (req, res) => {
    try {
        const orders = await orderService.getOrdersByUser(req.user._id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener tus pedidos', error: error.message });
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
    getOrdersMine,
    getOrderById,
    updateStatus,
    updateTracking,
    uploadComprobante
};
