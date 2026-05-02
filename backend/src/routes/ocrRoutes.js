const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { scanDocument, saveEntry } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, JPEG, and PNG supported.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Scan document using OCR
// @route   POST /api/ocr/scan-document
// @access  Private
router.post('/scan-document', protect, upload.single('document'), scanDocument);

// @desc    Save confirmed transaction
// @route   POST /api/ocr/save-entry
// @access  Private
router.post('/save-entry', protect, saveEntry);

module.exports = router;
