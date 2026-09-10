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

    console.log('Inserting Vehicles across categories with variants...');
    const vehiclesData = [
      // Exterior Of Car
      {
        category: 'Exterior Of Car',
        manufacturer: 'Porsche',
        model: '911',
        variant: 'GT3 RS',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Porsche',
        model: '911',
        variant: 'Turbo S',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Porsche',
        model: '911',
        variant: 'Carrera 4S',
        year: 2023,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Tesla',
        model: 'Model 3',
        variant: 'Performance',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Tesla',
        model: 'Model 3',
        variant: 'Long Range',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Tesla',
        model: 'Model S',
        variant: 'Plaid',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'BMW',
        model: 'M3',
        variant: 'Competition xDrive',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'BMW',
        model: 'M4',
        variant: 'CSL',
        year: 2023,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Chevrolet',
        model: 'Corvette',
        variant: 'Z06',
        year: 2023,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Exterior Of Car',
        manufacturer: 'Chevrolet',
        model: 'Corvette',
        variant: 'Stingray 3LT',
        year: 2023,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // Car Interior
      {
        category: 'Car Interior',
        manufacturer: 'Mercedes-Benz',
        model: 'S-Class',
        variant: 'Maybach S680',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Car Interior',
        manufacturer: 'Porsche',
        model: 'Taycan',
        variant: 'Turbo Cross Turismo',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Car Interior',
        manufacturer: 'Tesla',
        model: 'Model X',
        variant: 'Plaid Six-Seat',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // Motorcycles
      {
        category: 'Motorcycles',
        manufacturer: 'Ducati',
        model: 'Panigale V4',
        variant: 'V4 S',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Motorcycles',
        manufacturer: 'BMW Motorrad',
        model: 'S 1000 RR',
        variant: 'M Package',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Motorcycles',
        manufacturer: 'Harley-Davidson',
        model: 'Fat Boy',
        variant: '114 Special',
        year: 2023,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // Window Film
      {
        category: 'Window Film',
        manufacturer: 'Audi',
        model: 'RS6 Avant',
        variant: 'Performance',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Window Film',
        manufacturer: 'Toyota',
        model: 'Land Cruiser',
        variant: 'GR Sport',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // Mobile electronic equipment
      {
        category: 'Mobile electronic equipment',
        manufacturer: 'Apple',
        model: 'iPhone 15 Pro Max',
        variant: 'Titanium Edition',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
      {
        category: 'Mobile electronic equipment',
        manufacturer: 'Samsung',
        model: 'Galaxy S24 Ultra',
        variant: '512GB Ceramic',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // Pattern Logo Engraving
      {
        category: 'Pattern Logo Engraving',
        manufacturer: 'Custom Emblem',
        model: 'Signature Badge',
        variant: 'Gloss Carbon Cut',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // Car partial protection kit
      {
        category: 'Car partial protection kit',
        manufacturer: 'Ford',
        model: 'Mustang Dark Horse',
        variant: 'Track Pack (Hood & Mirrors)',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },

      // External sunroof tint film
      {
        category: 'External sunroof tint film',
        manufacturer: 'Tesla',
        model: 'Model Y',
        variant: 'Panoramic Roof High Heat',
        year: 2024,
        status: 'active',
        createdBy: superAdmin._id,
      },
    ];

    const createdVehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`Inserted ${createdVehicles.length} vehicles.`);

    console.log('Inserting 1 Pattern per Vehicle with verified DXF/SVG vector assets...');
    const patterns = [];

    // Real file paths available in backend/uploads/patterns
    const sampleDxf = '/uploads/patterns/1788790180589-379676948.dxf';
    const sampleSvg = '/uploads/patterns/1788790180589-379676948.dxf.svg';

    for (const v of createdVehicles) {
      patterns.push({
        vehicleId: v._id,
        name: `${v.manufacturer} ${v.model} ${v.variant ? `(${v.variant}) ` : ''}Complete Pattern`,
        part: 'Full Vehicle Kit',
        patternType: v.category === 'Window Film' ? 'Window Film' : 'Paint Protection Film',
        status: 'published',
        files: {
          dxf: { url: sampleDxf, key: '1788790180589-379676948.dxf' },
          svg: { url: sampleSvg, key: '1788790180589-379676948.dxf.svg' },
        },
        dimensions: {
          width: 1524,
          height: 3200,
          unit: 'mm',
        },
        version: 1,
        createdBy: superAdmin._id,
      });
    }

    const createdPatterns = await Pattern.insertMany(patterns);
    console.log(`Inserted ${createdPatterns.length} cutting patterns (1:1 with vehicles).`);

    console.log('Inserting Initial Jobs...');
    await Job.insertMany([
      {
        installerId: installer._id,
        vehicleId: createdVehicles[0]._id, // Porsche 911 GT3 RS
        patterns: [
          { patternId: createdPatterns[0]._id, name: createdPatterns[0].name }
        ],
        filmWidth: 60,
        materialUsed: 140,
        status: 'completed',
      },
      {
        installerId: installer._id,
        vehicleId: createdVehicles[3]._id, // Tesla Model 3
        patterns: [
          { patternId: createdPatterns[3]._id, name: createdPatterns[3].name }
        ],
        filmWidth: 60,
        materialUsed: 110,
        status: 'processing',
      },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
