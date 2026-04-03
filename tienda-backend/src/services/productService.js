const Product = require('../models/product');

const getAllProducts = async (filtros = {}) => {
    let query = {};
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.publicado !== undefined) query.publicado = filtros.publicado;
    if (filtros.corte) query.tipo = filtros.corte;
    if (filtros.esNuevoDrop !== undefined) query.esNuevoDrop = filtros.esNuevoDrop;

    return await Product.find(query).populate('categoria').sort({ createdAt: -1 });
};

const searchProducts = async (q, categoriaId) => {
    let filter = { publicado: true };
    if (categoriaId) filter.categoria = categoriaId;
    if (q) {
        filter.nombre = { $regex: q, $options: 'i' };
    }
    return await Product.find(filter).populate('categoria').sort({ createdAt: -1 });
};

const getProductById = async (id) => {
    return await Product.findById(id).populate('categoria');
};

const createProduct = async (productData) => {
    const product = new Product(productData);
    return await product.save();
};

const updateProduct = async (id, updateData) => {
    return await Product.findByIdAndUpdate(id, updateData, { new: true }).populate('categoria');
};

const deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

const updateStock = async (id, cantidad) => {
    return await Product.findByIdAndUpdate(id, { $inc: { stock: -cantidad } }, { new: true });
};

module.exports = {
    getAllProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
};
