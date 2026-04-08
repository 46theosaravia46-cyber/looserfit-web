const Product = require('../models/product');
const Category = require('../models/Category');
const { SIZES_BY_CATEGORY } = require('../constants/products');

const validateSizes = async (categoriaId, talles = []) => {
    if (!categoriaId) return;
    const cat = await Category.findById(categoriaId);
    if (!cat) throw new Error('Categoría no encontrada');

    // Mapear nombre de categoría a las claves de SIZES_BY_CATEGORY
    // Los nombres pueden ser "Outerwear / Abrigos", etc.
    const catName = cat.name.toLowerCase();
    let key = '';
    if (catName.includes('pantalones') || catName.includes('bottoms')) key = 'Pantalones';
    else if (catName.includes('remeras') || catName.includes('tops')) key = 'Remeras';
    else if (catName.includes('abrigos') || catName.includes('outerwear')) key = 'Abrigos';
    else if (catName.includes('calzado') || catName.includes('footwear')) key = 'Calzado';
    else if (catName.includes('accesorios') || catName.includes('accessories')) key = 'Accesorios';

    const validSizes = SIZES_BY_CATEGORY[key] || [];
    
    // Si es accesorios, no debe tener talles
    if (key === 'Accesorios' && talles.length > 0) {
        throw new Error('Los accesorios no deben tener talles');
    }

    // Validar que cada talle enviado esté en la lista permitida
    const invalid = talles.filter(t => !validSizes.includes(t));
    if (invalid.length > 0) {
        throw new Error(`Talles inválidos para la categoría ${key}: ${invalid.join(', ')}`);
    }
};

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
    await validateSizes(productData.categoria, productData.talles);
    const product = new Product(productData);
    return await product.save();
};

const updateProduct = async (id, updateData) => {
    if (updateData.categoria || updateData.talles) {
        // Para update, necesitamos ambos o usar los existentes si faltan
        const existing = await Product.findById(id);
        const catId = updateData.categoria || existing.categoria;
        const talles = updateData.talles || existing.talles;
        await validateSizes(catId, talles);
    }
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
