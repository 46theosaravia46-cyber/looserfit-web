const Product = require('../models/product');
const Category = require('../models/Category');
const { SIZES_BY_CATEGORY } = require('../constants/products');

const validateSizes = async (categoriaId, talles = []) => {
    if (!categoriaId || talles.length === 0) return;
    
    // Lista maestra de todos los talles permitidos en el sistema (en minúsculas para comparar)
    const allValidSizes = [...new Set(Object.values(SIZES_BY_CATEGORY).flat())].map(s => s.toLowerCase().trim());

    // Validar que cada talle enviado esté en la lista maestra
    const invalid = talles.filter(t => !allValidSizes.includes(String(t).toLowerCase().trim()));
    
    if (invalid.length > 0) {
        throw new Error(`Talles no reconocidos por el sistema: ${invalid.join(', ')}. Por favor verificá que el talle seleccionado sea válido.`);
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
    if (talles === undefined || talles === null || talles === '' || talles === 'undefined') return [];
    if (typeof talles === 'string') {
        // Si viene como string, intentamos parsear JSON (por si viene "['S','M']")
        // o split por coma (por si viene "S, M")
        try {
            const parsed = JSON.parse(talles);
            return Array.isArray(parsed) ? parsed.map(s => String(s).trim()) : [String(parsed).trim()].filter(Boolean);
        } catch (e) {
            return talles.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    if (!Array.isArray(talles)) return [String(talles).trim()].filter(Boolean);
    return talles.map(s => String(s).trim()).filter(Boolean);
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
        if (!existing) throw new Error('Producto no encontrado');

        // catId puede ser el ID string o el objeto si estaba poblado (aunque aquí findById no puebla)
        const catId  = updateData.categoria || (existing.categoria?._id || existing.categoria);
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
