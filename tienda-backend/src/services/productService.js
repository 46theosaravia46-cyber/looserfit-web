const Product = require('../models/product');
const Category = require('../models/Category');
const { SIZES_BY_CATEGORY } = require('../constants/products');

const validateSizes = async (categoriaId, talles = []) => {
    if (!categoriaId || talles.length === 0) return;
    
    const cat = await Category.findById(categoriaId);
    if (!cat) throw new Error('Categoría no encontrada');

    // Mapeo de nombre de DB a clave de constante
    const DB_CAT_TO_KEY = {
        'Outerwear / Abrigos': 'Abrigos',
        'Tops / Remeras': 'Remeras',
        'Bottoms / Pantalones': 'Pantalones',
        'Footwear / Calzado': 'Calzado',
        'Accessories / Accesorios': 'Accesorios'
    };

    const catKey = DB_CAT_TO_KEY[cat.name] || cat.name;
    const validSizesForCat = SIZES_BY_CATEGORY[catKey] || [];

    if (validSizesForCat.length > 0) {
        const lowerValid = validSizesForCat.map(s => s.toLowerCase().trim());
        const invalid = talles.filter(t => !lowerValid.includes(String(t).toLowerCase().trim()));
        
        if (invalid.length > 0) {
            throw new Error(`Los siguientes talles no son válidos para la categoría ${catKey}: ${invalid.join(', ')}.`);
        }
    } else {
        // Fallback: Lista maestra de todos los talles si la categoría no tiene lista específica
        const allValidSizes = [...new Set(Object.values(SIZES_BY_CATEGORY).flat())].map(s => s.toLowerCase().trim());
        const invalid = talles.filter(t => !allValidSizes.includes(String(t).toLowerCase().trim()));
        
        if (invalid.length > 0) {
            throw new Error(`Talles no reconocidos: ${invalid.join(', ')}.`);
        }
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
    
    // Auto-corrección básica pre-validación
    if (productData.categoria) {
        const cat = await Category.findById(productData.categoria);
        if (cat && cat.name.includes('Pantalones')) {
            productData.talles = productData.talles.map(t => /^\d+$/.test(t) ? t + 'ARG' : t);
        }
    }

    await validateSizes(productData.categoria, productData.talles);
    const product = new Product(productData);
    return await product.save();
};

const updateProduct = async (id, updateData) => {
    if (updateData.talles !== undefined) {
        updateData.talles = _normalizeTalles(updateData.talles);
    }

    if (updateData.categoria !== undefined || updateData.talles !== undefined) {
        const existing = await Product.findById(id).populate('categoria');
        if (!existing) throw new Error('Producto no encontrado');

        const cat = updateData.categoria ? await Category.findById(updateData.categoria) : existing.categoria;
        const talles = updateData.talles !== undefined ? updateData.talles : (existing.talles || []);

        // Auto-corrección en update
        let finalTalles = talles;
        if (cat && cat.name.includes('Pantalones')) {
            finalTalles = talles.map(t => /^\d+$/.test(t) ? t + 'ARG' : t);
            if (updateData.talles !== undefined) updateData.talles = finalTalles;
        }

        await validateSizes(cat?._id || cat, finalTalles);
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
