import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const router = express.Router();
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|svg|dxf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/dxf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Supported files only (JPG, PNG, WEBP, SVG, DXF)!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = req.file.path;

  // If the file is an SVG, sanitize it
  if (path.extname(req.file.originalname).toLowerCase() === '.svg') {
    try {
      const svgContent = fs.readFileSync(filePath, 'utf8');
      const cleanSvg = purify.sanitize(svgContent, { USE_PROFILES: { svg: true } });
      fs.writeFileSync(filePath, cleanSvg, 'utf8');
    } catch (err) {
      console.error('Failed to sanitize SVG:', err);
      return res.status(500).json({ message: 'Error processing SVG file' });
    }
  }

  res.send({
    message: 'File Uploaded',
    url: `/${filePath.replace(/\\/g, '/')}`,
  });
});

export default router;
