const Category = require('../models/Category');
const Service = require('../models/Service');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../debug_category.log');
const log = (msg, data = '') => {
    const timestamp = new Date().toISOString();
    const message = `${timestamp} - ${msg} ${typeof data === 'object' ? JSON.stringify(data) : data}\n`;
    fs.appendFileSync(logPath, message);
};

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('order');

        // Find corresponding services for each category
        const categoryIds = categories.map(cat => cat.name);
        const services = await Service.find({
            category: { $in: categoryIds },
            isActive: true
        });

        // Merge service info into categories
        const categoriesWithServices = categories.map(category => {
            const service = services.find(s => s.category === category.name);
            return {
                ...category.toObject(),
                serviceId: service?._id || null,
                hasService: !!service
            };
        });

        res.status(200).json({
            status: 'success',
            results: categoriesWithServices.length,
            data: {
                categories: categoriesWithServices
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        log('createCategory Request Body:', req.body);
        log('createCategory Request File:', req.file);

        if (req.file) {
            req.body.image = req.file.path;
        } else if (!req.body.image) {
            delete req.body.image; // Allow default if empty
        }

        log('Creating Category with data:', req.body);
        const newCategory = await Category.create(req.body);
        log('Category Created:', newCategory);

        // Auto-create a corresponding service for this category
        log('Creating associated Service...');
        const newService = await Service.create({
            title: newCategory.name,
            description: newCategory.description || `Professional ${newCategory.name} service`,
            category: newCategory.name, // Using name as ID/Category identifier
            price: newCategory.price || 0,
            originalPrice: newCategory.originalPrice,
            headerImage: newCategory.image,
            isActive: newCategory.isActive,
            rating: newCategory.rating || 0
            // technician: null // Global service
        });
        log('Service Created:', newService);

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory,
                service: newService
            }
        });
    } catch (err) {
        log('createCategory Error:', err.message);
        log('Full Error Stack:', err.stack);
        next(err);
    }
};

exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('No category found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return next(new AppError('No category found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return next(new AppError('No category found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
