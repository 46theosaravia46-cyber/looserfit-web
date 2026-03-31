const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Datos del Producto (para saber qué compró)
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        nombre: String,
        cantidad: Number,
        precio: Number,
        talle: String,
        imagen: String
    }],
    total: { type: Number, required: true },
    
    // Lógica de Envío
    tipoEnvio: { type: String, enum: ['sucursal', 'domicilio'], required: true },
    
    // Datos del Cliente (lo que te pasó por WhatsApp)
    datosEnvio: {
        nombreCompleto: { type: String, required: true },
        provincia: { type: String, required: true },
        localidad: { type: String, required: true },
        email: { type: String, required: true },
        telefono: { type: String, required: true },
        
        // Campos específicos según el tipo
        direccionSucursal: { type: String }, // Para sucursal
        calleNumero: { type: String },       // Para domicilio
        pisoDepto: { type: String },         // Para domicilio (opcional)
        codigoPostal: { type: String }       // Para domicilio
    },
    estado: { type: String, default: 'Pendiente' }, // Pendiente, Pagado, Empaquetado, Enviado, Entregado, Cancelado
    orderNumber: { type: String, required: true, unique: true, index: true }, // Nro de orden visible para control interno y clientes
    shippingCost: { type: Number, required: true, default: 0 },
    comprobante: { type: String }, // URL de la imagen del comprobante
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional: Para usuarios registrados
    trackingNumber: { type: String }, // Número de seguimiento Correo Argentino
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);