import GarageItem from '../models/GarageItem.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles in the current user's garage
// @route   GET /api/garage
// @access  Private
export const getGarageItems = async (req, res) => {
  try {
    const query = { userId: req.user._id };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const items = await GarageItem.find(query)
      .populate('vehicleId')
      .sort({ updatedAt: -1, createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch garage items' });
  }
};

// @desc    Add a vehicle to garage
// @route   POST /api/garage
// @access  Private
export const addToGarage = async (req, res) => {
  try {
    const {
      vehicleId,
      customerName,
      customerPhone,
      licensePlate,
      vin,
      selectedPackage,
      status,
      priority,
      notes,
    } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: 'Vehicle ID is required' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const item = await GarageItem.create({
      userId: req.user._id,
      vehicleId,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      licensePlate: licensePlate || '',
      vin: vin || '',
      selectedPackage: selectedPackage || 'Full Front PPF',
      status: status || 'in_shop',
      priority: priority || 'normal',
      notes: notes || '',
    });

    const populated = await GarageItem.findById(item._id).populate('vehicleId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add vehicle to garage' });
  }
};

// @desc    Update a garage item
// @route   PUT /api/garage/:id
// @access  Private
export const updateGarageItem = async (req, res) => {
  try {
    const item = await GarageItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Garage item not found' });
    }

    // Ensure the user owns this garage item (or is an admin)
    if (
      item.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'SUPER_ADMIN' &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this garage item' });
    }

    const {
      customerName,
      customerPhone,
      licensePlate,
      vin,
      selectedPackage,
      status,
      priority,
      notes,
    } = req.body;

    if (customerName !== undefined) item.customerName = customerName;
    if (customerPhone !== undefined) item.customerPhone = customerPhone;
    if (licensePlate !== undefined) item.licensePlate = licensePlate;
    if (vin !== undefined) item.vin = vin;
    if (selectedPackage !== undefined) item.selectedPackage = selectedPackage;
    if (status !== undefined) item.status = status;
    if (priority !== undefined) item.priority = priority;
    if (notes !== undefined) item.notes = notes;

    await item.save();
    const populated = await GarageItem.findById(item._id).populate('vehicleId');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update garage item' });
  }
};

// @desc    Remove a vehicle from garage
// @route   DELETE /api/garage/:id
// @access  Private
export const deleteGarageItem = async (req, res) => {
  try {
    const item = await GarageItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Garage item not found' });
    }

    if (
      item.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'SUPER_ADMIN' &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Not authorized to remove this garage item' });
    }

    await item.deleteOne();
    res.json({ message: 'Vehicle removed from garage' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete garage item' });
  }
};

// @desc    Check if vehicle is already in user's garage
// @route   GET /api/garage/check/:vehicleId
// @access  Private
export const checkInGarage = async (req, res) => {
  try {
    const existing = await GarageItem.findOne({
      userId: req.user._id,
      vehicleId: req.params.vehicleId,
    });
    res.json({ inGarage: Boolean(existing), garageItemId: existing?._id || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
