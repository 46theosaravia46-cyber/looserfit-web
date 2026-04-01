const Category = require('../models/Category');

const getAllCategories = async () => {
    return await Category.find().sort({ name: 1 });
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
