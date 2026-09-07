import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Pattern from './models/Pattern.js';
import Job from './models/Job.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Job.deleteMany();
    await Pattern.deleteMany();
    await Vehicle.deleteMany();
    await User.deleteMany();

    console.log('Inserting Users...');
    const superAdmin = await User.create({
      email: 'admin@ppfcutting.com',
      passwordHash: 'adminppf@pass123',
      firstName: 'TN',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    });

    const installer = await User.create({
      email: 'user@ppfcutting.com',
      passwordHash: 'userppf@pass321',
      firstName: 'Elite',
      lastName: 'Installer',
      role: 'INSTALLER',
    });

    console.log('Inserting Vehicles...');
    const vehicles = await Vehicle.insertMany([
      {
        manufacturer: 'Tesla',
        model: 'Model 3',
        generation: 'Highland',
        year: 2024,
        bodyType: 'Sedan',
        status: 'active',
        createdBy: superAdmin._id
      },
      {
        manufacturer: 'Porsche',
        model: '911',
        generation: '992',
        year: 2023,
        bodyType: 'Coupe',
        status: 'active',
        createdBy: superAdmin._id
      },
      {
        manufacturer: 'BMW',
        model: 'M3',
        generation: 'G80',
        year: 2024,
        bodyType: 'Sedan',
        status: 'active',
        createdBy: superAdmin._id
      },
      {
        manufacturer: 'Chevrolet',
        model: 'Corvette',
        generation: 'C8',
        year: 2023,
        bodyType: 'Coupe',
        status: 'active',
        createdBy: superAdmin._id
      }
    ]);

    console.log('Inserting Patterns...');
    const patterns = [];
    for (const vehicle of vehicles) {
      patterns.push({
        vehicleId: vehicle._id,
        name: 'Full Front',
        part: 'Full Front Package',
        patternType: 'Paint Protection Film',
        status: 'published',
        createdBy: superAdmin._id
      });
      patterns.push({
        vehicleId: vehicle._id,
        name: 'Track Package',
        part: 'Track Package',
        patternType: 'Paint Protection Film',
        status: 'published',
        createdBy: superAdmin._id
      });
    }
    
    const createdPatterns = await Pattern.insertMany(patterns);

    console.log('Inserting Jobs...');
    await Job.insertMany([
      {
        installerId: installer._id,
        vehicleId: vehicles[0]._id, // Tesla
        patterns: [
          { patternId: createdPatterns[0]._id, name: 'Full Front' }
        ],
        filmWidth: 60,
        materialUsed: 120,
        status: 'completed'
      },
      {
        installerId: installer._id,
        vehicleId: vehicles[1]._id, // Porsche
        patterns: [
          { patternId: createdPatterns[3]._id, name: 'Track Package' }
        ],
        filmWidth: 60,
        materialUsed: 80,
        status: 'processing'
      }
    ]);

    console.log('Data successfully seeded!');
    process.exit();
  } catch (error) {
    console.error('Error with data import: ', error);
    process.exit(1);
  }
};

seedData();
