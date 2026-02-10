const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('./models/Category');
const Service = require('./models/Service');

const listData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database');

        const categories = await Category.find({});
        console.log('\n--- Categories ---');
        if (categories.length === 0) {
            console.log('No categories found.');
        } else {
            categories.forEach((cat, index) => {
                console.log(`${index + 1}. Name: ${cat.name}`);
                console.log(`   Description: ${cat.description || 'N/A'}`);
                console.log(`   IsActive: ${cat.isActive}`);
                console.log(`   ID: ${cat._id}`);
                console.log('------------------');
            });
        }

        const services = await Service.find({});
        console.log('\n--- Services ---');
        if (services.length === 0) {
            console.log('No services found.');
        } else {
            services.forEach((serv, index) => {
                console.log(`${index + 1}. Title: ${serv.title}`);
                console.log(`   Category: ${serv.category}`);
                console.log(`   IsActive: ${serv.isActive}`);
                console.log(`   ID: ${serv._id}`);
                console.log('------------------');
            });
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

listData();
