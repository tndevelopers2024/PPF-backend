import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    const { manufacturer, model, year, status, search } = req.query;

    let query = {};

    // Fuzzy search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { manufacturer: searchRegex },
        { model: searchRegex },
        { generation: searchRegex }
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

    if (status) query.status = status;

    // Normal users shouldn't see draft or archived vehicles unless specified
    if (req.user && (req.user.role === 'INSTALLER' || req.user.role === 'VIEWER')) {
      query.status = 'active';
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      res.json(vehicle);
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
      generation,
      year,
      variant,
      bodyType,
      market,
      image,
      status,
      notes,
    } = req.body;

    const vehicle = new Vehicle({
      manufacturer,
      model,
      generation,
      year,
      variant,
      bodyType,
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
      vehicle.generation = req.body.generation || vehicle.generation;
      vehicle.year = req.body.year || vehicle.year;
      vehicle.variant = req.body.variant || vehicle.variant;
      vehicle.bodyType = req.body.bodyType || vehicle.bodyType;
      vehicle.market = req.body.market || vehicle.market;
      vehicle.image = req.body.image || vehicle.image;
      vehicle.status = req.body.status || vehicle.status;
      vehicle.notes = req.body.notes || vehicle.notes;

      const updatedVehicle = await vehicle.save();
      res.json(updatedVehicle);
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
      await vehicle.deleteOne();
      res.json({ message: 'Vehicle removed' });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
