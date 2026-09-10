import Vehicle from '../models/Vehicle.js';
import Pattern from '../models/Pattern.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    const { manufacturer, model, year, status, category, search } = req.query;

    let query = {};

    // Fuzzy search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { manufacturer: searchRegex },
        { model: searchRegex },
        { variant: searchRegex }
      ];
      // If search string is numeric and looks like a year
      if (!isNaN(search) && search.length === 4) {
        query.$or.push({ year: parseInt(search) });
      }
    } else {
      if (manufacturer) query.manufacturer = new RegExp(manufacturer, 'i');
      if (model) query.model = new RegExp(model, 'i');
      if (year) query.year = year;
    }

    if (category) query.category = category;
    if (status) query.status = status;

    // Normal users shouldn't see draft or archived vehicles unless specified
    if (req.user && (req.user.role === 'INSTALLER' || req.user.role === 'VIEWER')) {
      query.status = 'active';
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 }).lean();

    // Attach pattern for each vehicle (1 car = 1 pattern)
    const vehicleIds = vehicles.map((v) => v._id);
    const patterns = await Pattern.find({ vehicleId: { $in: vehicleIds } }).lean();
    const patternMap = {};
    patterns.forEach((p) => {
      patternMap[p.vehicleId.toString()] = p;
    });

    const vehiclesWithPattern = vehicles.map((v) => ({
      ...v,
      pattern: patternMap[v._id.toString()] || null,
    }));

    res.json(vehiclesWithPattern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();

    if (vehicle) {
      const pattern = await Pattern.findOne({ vehicleId: vehicle._id }).lean();
      res.json({
        ...vehicle,
        pattern: pattern || null,
      });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res) => {
  try {
    const {
      manufacturer,
      model,
      year,
      variant,
      category,
      market,
      image,
      status,
      notes,
    } = req.body;

    const vehicle = new Vehicle({
      manufacturer,
      model,
      year,
      variant,
      category: category || 'Exterior Of Car',
      market,
      image,
      status,
      notes,
      createdBy: req.user._id,
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      vehicle.manufacturer = req.body.manufacturer || vehicle.manufacturer;
      vehicle.model = req.body.model || vehicle.model;
      vehicle.year = req.body.year || vehicle.year;
      vehicle.variant = req.body.variant !== undefined ? req.body.variant : vehicle.variant;
      vehicle.category = req.body.category || vehicle.category;
      vehicle.market = req.body.market || vehicle.market;
      vehicle.image = req.body.image || vehicle.image;
      vehicle.status = req.body.status || vehicle.status;
      vehicle.notes = req.body.notes || vehicle.notes;

      const updatedVehicle = await vehicle.save();
      const pattern = await Pattern.findOne({ vehicleId: updatedVehicle._id }).lean();
      res.json({
        ...updatedVehicle.toObject(),
        pattern: pattern || null,
      });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      await Pattern.deleteMany({ vehicleId: vehicle._id });
      await vehicle.deleteOne();
      res.json({ message: 'Vehicle and associated pattern removed' });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
