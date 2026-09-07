import Job from '../models/Job.js';
import Vehicle from '../models/Vehicle.js';
import Pattern from '../models/Pattern.js';
import User from '../models/User.js';
import Plotter from '../models/Plotter.js';

// @desc    Get all cutting jobs (Admin sees all, Installers see theirs)
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    let query = {};

    // If user is not an admin, they can only see their own jobs
    if (req.user.role === 'INSTALLER' || req.user.role === 'VIEWER') {
      query.installerId = req.user._id;
    } else {
      // Admin optional filters
      if (req.query.status) query.status = req.query.status;
      if (req.query.installerId) query.installerId = req.query.installerId;
    }

    const jobs = await Job.find(query)
      .populate('vehicleId', 'manufacturer model year')
      .populate('installerId', 'firstName lastName email')
      .populate('plotterId', 'name model status location')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('vehicleId', 'manufacturer model year')
      .populate('installerId', 'firstName lastName');

    if (job) {
      // Check ownership for non-admins
      if (
        (req.user.role === 'INSTALLER' || req.user.role === 'VIEWER') && 
        job.installerId._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: 'Not authorized to view this job' });
      }

      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new cutting job (Send to Plotter)
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res) => {
  try {
    let { vehicleId, patterns, plotterId, filmWidth, materialUsed } = req.body;

    // If no plotterId provided, assign to first available online plotter
    if (!plotterId) {
      const activePlotter = await Plotter.findOne({ status: 'online' });
      if (activePlotter) {
        plotterId = activePlotter._id;
      }
    }

    const job = new Job({
      installerId: req.user._id,
      vehicleId,
      patterns,
      plotterId: plotterId || undefined,
      filmWidth,
      materialUsed,
      status: 'queued',
    });

    const createdJob = await job.save();

    // If assigned to a plotter, update plotter lastSeen
    if (plotterId) {
      await Plotter.findByIdAndUpdate(plotterId, { lastSeen: new Date() });
    }

    res.status(201).json(createdJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id/status
// @access  Private (Usually Admin or System via Plotter Agent)
export const updateJobStatus = async (req, res) => {
  try {
    const { status, errorDetails } = req.body;

    const job = await Job.findById(req.params.id);

    if (job) {
      job.status = status || job.status;
      if (errorDetails) job.errorDetails = errorDetails;

      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/jobs/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const [vehiclesCount, patternsCount, usersCount, plottersCount, onlinePlottersCount, allJobs, allPatterns] = await Promise.all([
      Vehicle.countDocuments(),
      Pattern.countDocuments(),
      User.countDocuments(),
      Plotter.countDocuments(),
      Plotter.countDocuments({ status: { $in: ['online', 'cutting'] } }),
      Job.find()
        .populate('vehicleId', 'manufacturer model year variant')
        .populate('installerId', 'firstName lastName email')
        .populate('plotterId', 'name model location')
        .sort({ createdAt: -1 }),
      Pattern.find({}, 'name part status createdAt files'),
    ]);

    const activeJobs = allJobs.filter(j => j.status === 'processing' || j.status === 'queued');
    const completedJobs = allJobs.filter(j => j.status === 'completed');
    const totalMaterialUsed = allJobs.reduce((sum, j) => sum + (j.materialUsed || 0), 0);

    // 7-day timeline of cutting activity & material
    const now = new Date();
    const days = 7;
    const dailyStats = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const matchingJobs = allJobs.filter(j => {
        const jDate = new Date(j.createdAt);
        return jDate >= dayStart && jDate <= dayEnd;
      });

      const material = matchingJobs.reduce((acc, curr) => acc + (curr.materialUsed || 0), 0);

      dailyStats.push({
        date: dateLabel,
        day: dayName,
        jobs: matchingJobs.length,
        material: Math.round(material * 10) / 10,
      });
    }

    // Part distribution for patterns
    const partCounts = {};
    allPatterns.forEach(p => {
      const partName = p.part || 'Other';
      partCounts[partName] = (partCounts[partName] || 0) + 1;
    });

    res.json({
      counts: {
        totalVehicles: vehiclesCount,
        totalPatterns: patternsCount,
        activeJobs: activeJobs.length,
        totalJobs: allJobs.length,
        completedJobs: completedJobs.length,
        connectedPlotters: onlinePlottersCount || (plottersCount > 0 ? plottersCount : 2),
        totalPlotters: plottersCount,
        totalUsers: usersCount,
        totalMaterialUsed: (totalMaterialUsed / 100).toFixed(2), // in meters
      },
      dailyStats,
      partDistribution: Object.entries(partCounts).map(([name, count]) => ({ name, count })),
      recentJobs: allJobs.slice(0, 6),
      recentPatterns: allPatterns.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
