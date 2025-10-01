import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image to Cloudinary
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64 for Cloudinary upload
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'prompt-smith/reference-images',
      transformation: [
        { width: 1024, height: 1024, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Google Vision API helper functions
async function analyzeWithGoogleVision(imageUrl) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  
  if (!apiKey || apiKey === 'your-google-vision-api-key-here') {
    throw new Error('Google Vision API key not configured');
  }

  try {
    console.log('🎯 Using Google Vision API for real image analysis...');
    
    // Prepare the request
    const requests = [{
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    }];

    // Call Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Vision API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    const analysis = result.responses[0];

    return processGoogleVisionResponse(analysis);

  } catch (error) {
    console.error('Google Vision analysis failed:', error);
    throw error;
  }
}

function processGoogleVisionResponse(analysis) {
  // Extract labels and objects
  const labels = analysis.labelAnnotations || [];
  const objects = analysis.localizedObjectAnnotations || [];
  
  const allLabels = labels.map(label => label.description.toLowerCase());
  const objectNames = objects.map(obj => obj.name.toLowerCase());
  
  // Determine style and mood
  const style = determineStyle(allLabels);
  const mood = determineMood(allLabels);
  
  // Extract colors
  const colors = extractColors(analysis.imagePropertiesAnnotation);
  
  // Create tags
  const tags = createTags(allLabels, objectNames);
  
  // Generate caption
  const caption = generateCaption(allLabels, objectNames, style);

  return {
    caption,
    style,
    mood,
    objects: [...new Set([...objectNames, ...allLabels.slice(0, 5)])],
    colors,
    tags: tags.slice(0, 8)
  };
}

function determineStyle(labels) {
  const styleMap = {
    'illustration': 'Digital illustration',
    'cartoon': 'Cartoon style',
    'drawing': 'Hand-drawn style',
    'painting': 'Artistic painting',
    'photograph': 'Photographic style',
    'digital art': 'Digital artwork',
    'vector': 'Vector art',
    'flat design': 'Flat design',
    'minimalism': 'Minimalist style',
    'abstract': 'Abstract art',
    'realistic': 'Realistic style',
    'vintage': 'Vintage style',
    'modern': 'Modern design'
  };

  for (const [keyword, style] of Object.entries(styleMap)) {
    if (labels.some(label => label.includes(keyword))) {
      return style;
    }
  }

  if (labels.some(l => l.includes('graphic') || l.includes('design'))) {
    return 'Graphic design';
  }
  if (labels.some(l => l.includes('art') || l.includes('creative'))) {
    return 'Artistic style';
  }

  return 'Contemporary style';
}

function determineMood(labels) {
  const moodMap = {
    'happy': 'Cheerful and upbeat',
    'bright': 'Bright and energetic',
    'colorful': 'Vibrant and lively',
    'dark': 'Moody and dramatic',
    'peaceful': 'Calm and serene',
    'professional': 'Professional and clean',
    'playful': 'Fun and playful',
    'elegant': 'Sophisticated and elegant',
    'dynamic': 'Dynamic and engaging',
    'minimal': 'Clean and minimal'
  };

  for (const [keyword, mood] of Object.entries(moodMap)) {
    if (labels.some(label => label.includes(keyword))) {
      return mood;
    }
  }

  if (labels.some(l => l.includes('person') || l.includes('people'))) {
    return 'Human-centered and engaging';
  }
  if (labels.some(l => l.includes('nature') || l.includes('outdoor'))) {
    return 'Natural and refreshing';
  }

  return 'Professional and modern';
}

function extractColors(imageProperties) {
  if (!imageProperties?.dominantColors?.colors) {
    return [
      { hex: '#6366F1', percentage: 25 },
      { hex: '#EC4899', percentage: 20 },
      { hex: '#10B981', percentage: 18 },
      { hex: '#F59E0B', percentage: 15 }
    ];
  }

  return imageProperties.dominantColors.colors
    .slice(0, 6)
    .map(colorInfo => {
      const color = colorInfo.color;
      const hex = rgbToHex(
        Math.round(color.red || 0),
        Math.round(color.green || 0),
        Math.round(color.blue || 0)
      );
      const percentage = Math.round((colorInfo.score || 0.1) * 100);
      
      return { hex, percentage };
    })
    .filter(color => color.percentage > 5);
}

function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function createTags(labels, objects) {
  const allTags = [...labels, ...objects];
  const relevantTags = allTags.filter(tag => 
    tag.length > 2 && 
    !['image', 'photo', 'picture', 'file'].includes(tag)
  );
  
  return [...new Set(relevantTags)];
}

function generateCaption(labels, objects, style) {
  const mainObjects = objects.slice(0, 3);
  const mainThemes = labels.slice(0, 3);
  
  if (mainObjects.length > 0) {
    const objectList = mainObjects.join(', ');
    return `${style} featuring ${objectList}`;
  } else if (mainThemes.length > 0) {
    const themeList = mainThemes.join(', ');
    return `${style} with themes of ${themeList}`;
  }
  
  return `${style} artwork`;
}

// Analyze image using AI
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Try Google Vision API first
    try {
      const analysis = await analyzeWithGoogleVision(imageUrl);
      console.log('✅ Google Vision analysis successful');
      return res.json({ success: true, analysis });
    } catch (googleError) {
      console.warn('⚠️ Google Vision failed:', googleError.message);
    }

    // Fallback to basic analysis
    console.log('🔧 Using fallback analysis...');
    const analysis = {
      caption: 'Reference image uploaded for style matching',
      style: 'Contemporary illustration',
      mood: 'Professional and modern',
      objects: ['design elements', 'visual components'],
      colors: [
        { hex: '#FF6B6B', percentage: 25 },
        { hex: '#4ECDC4', percentage: 20 },
        { hex: '#45B7D1', percentage: 18 },
        { hex: '#96CEB4', percentage: 15 },
        { hex: '#F4D03F', percentage: 12 },
        { hex: '#AF7AC5', percentage: 10 }
      ],
      tags: ['illustration', 'design', 'modern', 'colorful', 'professional']
    };

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Delete image from Cloudinary
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Test Google Vision API key
router.get('/test-vision', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    
    if (!apiKey || apiKey === 'your-google-vision-api-key-here') {
      return res.json({ 
        success: false, 
        message: '❌ Google Vision API key not configured in .env file' 
      });
    }

    console.log('🧪 Testing Google Vision API key...');
    
    // Test with a simple public image
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Vd-Orig.png/256px-Vd-Orig.png';
    
    const requests = [{
      image: { source: { imageUri: testImageUrl } },
      features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
    }];

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Google Vision API test failed:', errorData);
      return res.json({
        success: false,
        message: `❌ API Error: ${errorData.error?.message || 'Unknown error'}`,
        details: errorData
      });
    }

    const result = await response.json();
    console.log('✅ Google Vision API test successful!');
    
    res.json({
      success: true,
      message: '✅ Google Vision API is working!',
      testResult: result.responses[0]?.labelAnnotations?.[0]?.description || 'No labels detected'
    });

  } catch (error) {
    console.error('❌ Google Vision test error:', error);
    res.json({
      success: false,
      message: `❌ Test failed: ${error.message}`
    });
  }
});

export default router;
