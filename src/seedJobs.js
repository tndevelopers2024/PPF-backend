import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function addSampleJobs() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  const vehicles = await db.collection('vehicles').find({}).toArray();
  const patterns = await db.collection('patterns').find({}).toArray();

  if (users.length === 0 || vehicles.length === 0) {
    console.log('Missing users or vehicles');
    await mongoose.disconnect();
    return;
  }

  const installer = users.find(u => u.role === 'INSTALLER') || users[0];
  const now = new Date();

  // Create jobs for past days if not already present
  const existingJobsCount = await db.collection('jobs').countDocuments();
  if (existingJobsCount <= 2) {
    const historicalJobs = [
      {
        installerId: installer._id,
        vehicleId: vehicles[0]._id,
        patterns: [{ patternId: patterns[0]._id, name: patterns[0].name, part: patterns[0].part }],
        filmWidth: 1524,
        materialUsed: 240,
        status: 'completed',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        installerId: installer._id,
        vehicleId: vehicles[1] ? vehicles[1]._id : vehicles[0]._id,
        patterns: [{ patternId: patterns[1]._id, name: patterns[1].name, part: patterns[1].part }],
        filmWidth: 1524,
        materialUsed: 310,
        status: 'completed',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        installerId: installer._id,
        vehicleId: vehicles[2] ? vehicles[2]._id : vehicles[0]._id,
        patterns: [{ patternId: patterns[0]._id, name: patterns[0].name, part: patterns[0].part }],
        filmWidth: 1524,
        materialUsed: 190,
        status: 'completed',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        installerId: installer._id,
        vehicleId: vehicles[0]._id,
        patterns: [{ patternId: patterns[2] ? patterns[2]._id : patterns[0]._id, name: 'Full Hood', part: 'Hood' }],
        filmWidth: 1524,
        materialUsed: 280,
        status: 'completed',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    await db.collection('jobs').insertMany(historicalJobs);
    console.log('Added 4 historical jobs for rich chart data');
  }

  await mongoose.disconnect();
}

addSampleJobs().catch(console.error);
