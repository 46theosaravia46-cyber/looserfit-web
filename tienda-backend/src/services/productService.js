const Product = require('../models/product');
const Category = require('../models/Category');
const { SIZES_BY_CATEGORY } = require('../constants/products');
const { deleteFromCloudinary } = require('../utils/cloudinaryUtils');

const validateSizes = async (categoriaId, talles = []) => {
    if (!categoriaId || talles.length === 0) return;
    
    const cat = await Category.findById(categoriaId);
    if (!cat) throw new Error('Categoría no encontrada');

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
        
        // El usuario pide "Ignorar cualquier otro texto externo". 
        // Si hay talles que no coinciden, los filtramos o avisamos.
        // Pero para ser robustos (producción), si el admin los mandó, validamos.
        const invalid = talles.filter(t => !lowerValid.includes(String(t).toLowerCase().trim()));
        
        if (invalid.length > 0) {
            // Si detectamos talles "sucios" (como 5US / 38ARG), y estamos en Calzado, 
            // podríamos intentar extraer la parte útil, pero el usuario pidió separar campos.
            // Por ahora, lanzamos error claro para que el admin lo limpie si es basura.
            throw new Error(`Los siguientes valores no son talles válidos para ${catKey}: ${invalid.join(', ')}. Por favor eliminá el texto extra.`);
        }
    }
};

const getAllProducts = async (filtros = {}) => {
    let query = {};
    // Multi-marca: filtrar por brand si se provee
    if (filtros.brand) query.brand = filtros.brand;
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.publicado !== undefined) query.publicado = filtros.publicado;
    if (filtros.corte) query.tipo = filtros.corte;
    if (filtros.esNuevoDrop !== undefined) query.esNuevoDrop = filtros.esNuevoDrop;
    if (filtros.q) {
        query.nombre = { $regex: filtros.q, $options: 'i' };
    }

    const q = Product.find(query).populate('categoria').sort({ createdAt: -1 });
    // Solo popular 'brand' si el schema lo tiene (compatibilidad con producción)
    if (Product.schema.path('brand')) {
        q.populate('brand', 'slug name');
    }
    return await q;
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
        } catch (_e) {
            return talles.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    if (!Array.isArray(talles)) return [String(talles).trim()].filter(Boolean);
    return talles.map(s => String(s).trim()).filter(Boolean);
};

const createProduct = async (productData) => {
    productData.talles = _normalizeTalles(productData.talles);
    
    // Normalizar precioOferta
    if (productData.precioOferta === '' || productData.precioOferta === 'null' || productData.precioOferta === undefined || productData.precioOferta === null) {
        productData.precioOferta = undefined;
    } else {
        const parsed = Number(productData.precioOferta);
        productData.precioOferta = isNaN(parsed) || parsed <= 0 ? undefined : parsed;
    }
    
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

    // Normalizar precioOferta
    if (updateData.precioOferta !== undefined) {
        if (updateData.precioOferta === '' || updateData.precioOferta === 'null' || updateData.precioOferta === null) {
            updateData.precioOferta = null;
        } else {
            const parsed = Number(updateData.precioOferta);
            updateData.precioOferta = isNaN(parsed) || parsed <= 0 ? null : parsed;
        }
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

    const existing = await Product.findById(id);
    if (existing) {
        // Limpiar imágenes eliminadas de la galería
        if (updateData.imagenes) {
            const eliminadas = existing.imagenes.filter(img => !updateData.imagenes.includes(img));
            for (const imgUrl of eliminadas) {
                await deleteFromCloudinary(imgUrl);
            }
        }
        // Limpiar guía de talles si cambió
        if (updateData.guiaTalles && existing.guiaTalles && updateData.guiaTalles !== existing.guiaTalles) {
            await deleteFromCloudinary(existing.guiaTalles);
        }
    }

    return await Product.findByIdAndUpdate(id, updateData, { new: true }).populate('categoria');
};

const deleteProduct = async (id) => {
    const existing = await Product.findById(id);
    if (existing) {
        for (const imgUrl of existing.imagenes) {
            await deleteFromCloudinary(imgUrl);
        }
        if (existing.guiaTalles) {
            await deleteFromCloudinary(existing.guiaTalles);
        }
    }
    return await Product.findByIdAndDelete(id);
};

const updateStock = async (id, cantidad) => {
    return await Product.findByIdAndUpdate(id, { $inc: { stock: -cantidad } }, { new: true });
};

const toggleProductVisibility = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    return await Product.findByIdAndUpdate(
        id, 
        { $set: { publicado: !product.publicado } },
        { new: true }
    ).populate('categoria');
};

const toggleProductDrop = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    return await Product.findByIdAndUpdate(
        id,
        { $set: { esNuevoDrop: !product.esNuevoDrop } },
        { new: true }
    ).populate('categoria');
};

const bulkToggleProductDrop = async (productIds, estado) => {
    if (!Array.isArray(productIds) || productIds.length === 0) return { modifiedCount: 0 };
    return await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { esNuevoDrop: estado } }
    );
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleProductVisibility,
    toggleProductDrop,
    bulkToggleProductDrop
};
