const Product = require('../models/product');
const Category = require('../models/Category');
const { SIZES_BY_CATEGORY } = require('../constants/products');

const validateSizes = async (categoriaId, talles = []) => {
    if (!categoriaId || talles.length === 0) return;
    
    // Lista maestra de todos los talles permitidos en el sistema
    const allValidSizes = [...new Set(Object.values(SIZES_BY_CATEGORY).flat())];

    // Validar que cada talle enviado esté en la lista maestra
    const invalid = talles.filter(t => !allValidSizes.includes(t));
    if (invalid.length > 0) {
        throw new Error(`Talles no reconocidos por el sistema: ${invalid.join(', ')}. Por favor contactá a soporte si necesitás agregar uno nuevo.`);
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

const _normalizeTalles = (talles) => {
    if (talles === undefined || talles === null) return [];
    if (typeof talles === 'string') {
        try {
            const parsed = JSON.parse(talles);
            return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
        } catch {
            return [talles].filter(Boolean);
        }
    }
    if (!Array.isArray(talles)) return [talles].filter(Boolean);
    return talles;
};

const createProduct = async (productData) => {
    productData.talles = _normalizeTalles(productData.talles);
    await validateSizes(productData.categoria, productData.talles);
    const product = new Product(productData);
    return await product.save();
};

const updateProduct = async (id, updateData) => {
    if (updateData.talles !== undefined) {
        updateData.talles = _normalizeTalles(updateData.talles);
    }

    if (updateData.categoria !== undefined || updateData.talles !== undefined) {
        const existing = await Product.findById(id);
        const catId  = updateData.categoria  || existing.categoria;
        const talles = updateData.talles !== undefined ? updateData.talles : (existing.talles || []);
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
