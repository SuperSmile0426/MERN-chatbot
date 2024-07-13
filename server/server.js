const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection


mongoose.connect('mongodb://localhost:27017/your-database-name')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const analysisSchema = new mongoose.Schema({
  imageData: Buffer,
  text: String,
  analysisResult: String,
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// API endpoint to handle image and text analysis
app.post('/api/analyze', upload.single('image'), (req, res) => {
  const { text } = req.body;
  const imageData = req.file.buffer;

  Tesseract.recognize(imageData, 'eng')
    .then(({ data: { text: imageText } }) => {
      const result = {
        uploadedText: text,
        extractedText: imageText,
      };

      const analysis = new Analysis({
        imageData,
        text,
        analysisResult: JSON.stringify(result),
      });

      analysis.save((err, savedAnalysis) => {
        if (err) return res.status(500).send(err);
        res.json(result);
      });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
