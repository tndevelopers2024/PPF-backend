import fs from 'fs';
import path from 'path';
import dxf from 'dxf';
import Pattern from '../models/Pattern.js';

// @desc    Get all patterns
// @route   GET /api/patterns
// @access  Private
export const getPatterns = async (req, res) => {
  try {
    const { vehicleId, part, status } = req.query;

    let query = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (part) query.part = part;
    if (status) query.status = status;

    // Installers/viewers only see published patterns
    if (req.user.role === 'INSTALLER' || req.user.role === 'VIEWER') {
      query.status = 'published';
    }

    const patterns = await Pattern.find(query).populate('vehicleId', 'manufacturer model year variant').sort({ createdAt: -1 });
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pattern by ID
// @route   GET /api/patterns/:id
// @access  Private
export const getPatternById = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id).populate('vehicleId', 'manufacturer model year');

    if (pattern) {
      res.json(pattern);
    } else {
      res.status(404).json({ message: 'Pattern not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a pattern
// @route   POST /api/patterns
// @access  Private/Admin
export const createPattern = async (req, res) => {
  try {
    const {
      vehicleId,
      name,
      part,
      patternType,
      files,
      preview,
      dimensions,
      notes,
      status
    } = req.body;

    const pattern = new Pattern({
      vehicleId,
      name,
      part,
      patternType,
      files,
      preview,
      dimensions,
      notes,
      status,
      version: 1,
      createdBy: req.user._id,
    });

    const createdPattern = await pattern.save();
    res.status(201).json(createdPattern);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a pattern
// @route   PUT /api/patterns/:id
// @access  Private/Admin
export const updatePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);

    if (pattern) {
      // If it's published, usually we should bump the version or prevent overwrites.
      // We will handle version logic explicitly via another route if needed,
      // but for now simple updates.
      if (pattern.status === 'published' && req.body.status !== 'archived') {
         // Create new version logic would go here, for MVP we just update it
         pattern.version += 1;
      }

      pattern.name = req.body.name || pattern.name;
      pattern.vehicleId = req.body.vehicleId || pattern.vehicleId;
      pattern.part = req.body.part || pattern.part;
      pattern.patternType = req.body.patternType || pattern.patternType;
      pattern.files = req.body.files || pattern.files;
      pattern.preview = req.body.preview || pattern.preview;
      pattern.dimensions = req.body.dimensions || pattern.dimensions;
      pattern.status = req.body.status || pattern.status;
      pattern.notes = req.body.notes !== undefined ? req.body.notes : pattern.notes;

      const updatedPattern = await pattern.save();
      res.json(updatedPattern);
    } else {
      res.status(404).json({ message: 'Pattern not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a pattern
// @route   DELETE /api/patterns/:id
// @access  Private/Admin
export const deletePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);

    if (pattern) {
      await pattern.deleteOne();
      res.json({ message: 'Pattern removed' });
    } else {
      res.status(404).json({ message: 'Pattern not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Upload SVG or DXF file for a pattern
// @route   POST /api/patterns/:id/upload
// @access  Private/Admin
export const uploadPatternFile = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ message: 'Pattern not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const fileUrl = `/uploads/patterns/${req.file.filename}`;

    if (ext === 'svg') {
      pattern.files = pattern.files || {};
      pattern.files.svg = { url: fileUrl, key: req.file.filename };
    } else if (ext === 'dxf') {
      pattern.files = pattern.files || {};
      pattern.files.dxf = { url: fileUrl, key: req.file.filename };

      // Automatically convert DXF to SVG for browser rendering
      try {
        const dxfContent = fs.readFileSync(req.file.path, 'utf8');
        const parsed = dxf.parseString(dxfContent);
        let svgContent = dxf.toSVG(parsed);
        svgContent = svgContent
          .replace(/stroke-width="[^"]*"/g, 'stroke-width="0.08" vector-effect="non-scaling-stroke"')
          .replace(/stroke="rgb\(255, 0, 63\)"/g, 'stroke="#14b8a6"')
          .replace(/stroke="#000000"/g, 'stroke="#14b8a6"');
        const svgFilename = `${req.file.filename}.svg`;
        const svgFilePath = path.join(path.dirname(req.file.path), svgFilename);
        fs.writeFileSync(svgFilePath, svgContent, 'utf8');
        const svgUrl = `/uploads/patterns/${svgFilename}`;
        pattern.files.svg = { url: svgUrl, key: svgFilename };
      } catch (err) {
        console.error('DXF to SVG conversion failed:', err);
      }
    }

    const updated = await pattern.save();
    res.json({ message: 'File uploaded successfully', pattern: updated, url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
