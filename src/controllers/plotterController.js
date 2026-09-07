import Plotter from '../models/Plotter.js';
import Job from '../models/Job.js';

// Default initial plotters if none exist
const DEFAULT_PLOTTERS = [
  {
    name: 'Cutter Station A',
    model: 'Roland CAMM-1 GS-24',
    ipAddress: '192.168.1.101',
    port: 9100,
    status: 'online',
    filmWidth: 1524,
    location: 'Bay 1 - Main Floor',
    notes: 'Primary 60" PPF cutter for full wraps',
  },
  {
    name: 'Cutter Station B',
    model: 'Graphtec CE7000-130',
    ipAddress: '192.168.1.102',
    port: 9100,
    status: 'online',
    filmWidth: 914,
    location: 'Bay 2 - Detail Bay',
    notes: 'Secondary 36" cutter for bumpers & headlights',
  },
  {
    name: 'Cutter Station C',
    model: 'Summa S2 D75',
    ipAddress: '192.168.1.103',
    port: 9100,
    status: 'offline',
    filmWidth: 610,
    location: 'Bay 3 - Tint Room',
    notes: '24" backup cutter station',
  },
];

// @desc    Get all plotters with real-time job counts
// @route   GET /api/plotters
// @access  Private
export const getPlotters = async (req, res) => {
  try {
    let plotters = await Plotter.find().sort({ createdAt: 1 });

    // Auto-seed if database has no plotters yet
    if (plotters.length === 0) {
      await Plotter.insertMany(DEFAULT_PLOTTERS);
      plotters = await Plotter.find().sort({ createdAt: 1 });
    }

    // Get today's date range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Calculate real stats for each plotter from the Jobs collection
    const plottersWithStats = await Promise.all(
      plotters.map(async (p) => {
        const pObj = p.toObject();

        const [jobsTodayCount, allJobsForPlotter] = await Promise.all([
          Job.countDocuments({
            plotterId: p._id,
            createdAt: { $gte: startOfToday },
          }),
          Job.find({ plotterId: p._id }, 'materialUsed status'),
        ]);

        const totalMaterial = allJobsForPlotter.reduce(
          (sum, j) => sum + (j.materialUsed || 0),
          0
        );

        const hasActiveCutting = allJobsForPlotter.some(
          (j) => j.status === 'cutting' || j.status === 'processing'
        );

        return {
          ...pObj,
          jobsToday: jobsTodayCount,
          totalJobs: allJobsForPlotter.length,
          materialUsed: `${(totalMaterial / 1000).toFixed(1)}m`,
          // Reflect 'cutting' if there's an active job running on this plotter
          status: hasActiveCutting ? 'cutting' : pObj.status,
        };
      })
    );

    res.json(plottersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single plotter by ID
// @route   GET /api/plotters/:id
// @access  Private
export const getPlotterById = async (req, res) => {
  try {
    const plotter = await Plotter.findById(req.params.id);
    if (!plotter) {
      return res.status(404).json({ message: 'Plotter not found' });
    }

    const recentJobs = await Job.find({ plotterId: plotter._id })
      .populate('vehicleId', 'manufacturer model year')
      .populate('installerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      ...plotter.toObject(),
      recentJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new plotter
// @route   POST /api/plotters
// @access  Private/Admin
export const createPlotter = async (req, res) => {
  try {
    const { name, model, ipAddress, port, status, filmWidth, location, notes } = req.body;

    if (!name || !model || !ipAddress) {
      return res.status(400).json({ message: 'Name, model, and IP Address are required' });
    }

    const plotter = new Plotter({
      name,
      model,
      ipAddress,
      port: port || 9100,
      status: status || 'online',
      filmWidth: filmWidth || 1524,
      location: location || 'Bay 1',
      notes: notes || '',
      lastSeen: new Date(),
    });

    const saved = await plotter.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a plotter
// @route   PUT /api/plotters/:id
// @access  Private/Admin
export const updatePlotter = async (req, res) => {
  try {
    const plotter = await Plotter.findById(req.params.id);
    if (!plotter) {
      return res.status(404).json({ message: 'Plotter not found' });
    }

    plotter.name = req.body.name || plotter.name;
    plotter.model = req.body.model || plotter.model;
    plotter.ipAddress = req.body.ipAddress || plotter.ipAddress;
    plotter.port = req.body.port !== undefined ? req.body.port : plotter.port;
    plotter.status = req.body.status || plotter.status;
    plotter.filmWidth = req.body.filmWidth || plotter.filmWidth;
    plotter.location = req.body.location || plotter.location;
    plotter.notes = req.body.notes !== undefined ? req.body.notes : plotter.notes;
    plotter.lastSeen = new Date();

    const updated = await plotter.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a plotter
// @route   DELETE /api/plotters/:id
// @access  Private/Admin
export const deletePlotter = async (req, res) => {
  try {
    const plotter = await Plotter.findById(req.params.id);
    if (!plotter) {
      return res.status(404).json({ message: 'Plotter not found' });
    }

    await plotter.deleteOne();
    res.json({ message: 'Plotter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Test connection to a plotter (Ping simulation / HPGL probe)
// @route   POST /api/plotters/:id/test
// @access  Private
export const testPlotterConnection = async (req, res) => {
  try {
    const plotter = await Plotter.findById(req.params.id);
    if (!plotter) {
      return res.status(404).json({ message: 'Plotter not found' });
    }

    // Simulate network probe with realistic latency (15ms - 45ms)
    const latencyMs = Math.floor(Math.random() * 30) + 15;
    const isSuccess = plotter.status !== 'offline';

    if (isSuccess) {
      plotter.lastSeen = new Date();
      if (plotter.status === 'error') plotter.status = 'online';
      await plotter.save();
    }

    res.json({
      success: isSuccess,
      latencyMs,
      status: plotter.status,
      message: isSuccess
        ? `Connected to ${plotter.name} (${plotter.ipAddress}:${plotter.port}) in ${latencyMs}ms. Ready to cut.`
        : `Cannot reach ${plotter.name} at ${plotter.ipAddress}:${plotter.port}. Device appears offline.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
