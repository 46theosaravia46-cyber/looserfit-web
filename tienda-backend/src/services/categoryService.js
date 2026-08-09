const Category = require('../models/Category');

const getAllCategories = async (brandId) => {
    const query = {};
    // Multi-marca: si se provee brandId, filtrar por marca
    if (brandId) query.brand = brandId;
    const categories = await Category.find(query).sort({ name: 1 });
    
    // Asegurar que "Deportivo" quede siempre al final
    return categories.sort((a, b) => {
        const aIsDeportivo = a.name.toLowerCase().includes('deportivo');
        const bIsDeportivo = b.name.toLowerCase().includes('deportivo');
        if (aIsDeportivo && !bIsDeportivo) return 1;
        if (!aIsDeportivo && bIsDeportivo) return -1;
        return 0;
    });
};

const getCategoryById = async (id) => {
    return await Category.findById(id);
};

const findByName = async (name) => {
    return await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
};

const createCategory = async (categoryData) => {
    return await Category.create(categoryData);
};

const updateCategory = async (id, categoryData) => {
    return await Category.findByIdAndUpdate(id, categoryData, { new: true });
};

const deleteCategory = async (id) => {
    return await Category.findByIdAndDelete(id);
};

module.exports = {
    getAllCategories,
    getCategoryById,
    findByName,
    createCategory,
    updateCategory,
    deleteCategory
};
