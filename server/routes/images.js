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
    
    // Prepare the request with comprehensive analysis features
    const requests = [{
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 15 }, // Increased for more labels
        { type: 'IMAGE_PROPERTIES' },
        { type: 'OBJECT_LOCALIZATION', maxResults: 15 }, // Increased for more objects
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'TEXT_DETECTION' }, // Detect any text in image
        { type: 'FACE_DETECTION' }, // Detect faces for better people description
        { type: 'LANDMARK_DETECTION' } // Detect famous landmarks
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
  // Extract all available data
  const labels = analysis.labelAnnotations || [];
  const objects = analysis.localizedObjectAnnotations || [];
  const faces = analysis.faceAnnotations || [];
  const texts = analysis.textAnnotations || [];
  const landmarks = analysis.landmarkAnnotations || [];
  
  const allLabels = labels.map(label => label.description.toLowerCase());
  const objectNames = objects.map(obj => obj.name.toLowerCase());
  
  // Add face information
  if (faces.length > 0) {
    const faceCount = faces.length;
    if (faceCount === 1) {
      allLabels.unshift('portrait', 'person', 'face');
    } else {
      allLabels.unshift('people', 'group', 'faces');
    }
  }
  
  // Add text information
  if (texts.length > 0) {
    allLabels.push('text', 'typography', 'lettering');
  }
  
  // Add landmark information
  if (landmarks.length > 0) {
    landmarks.forEach(landmark => {
      allLabels.push(landmark.description.toLowerCase());
    });
    allLabels.push('landmark', 'famous location');
  }
  
  // Determine style and mood with enhanced data
  const style = determineStyle(allLabels, faces.length > 0, texts.length > 0);
  const mood = determineMood(allLabels, faces.length > 0);
  
  // Extract colors
  const colors = extractColors(analysis.imagePropertiesAnnotation);
  
  // Create enhanced tags
  const tags = createTags(allLabels, objectNames);
  
  // Generate comprehensive caption with all analysis data
  const caption = generateCaption(allLabels, objectNames, style, analysis, {
    faceCount: faces.length,
    hasText: texts.length > 0,
    landmarks: landmarks.map(l => l.description)
  });

  return {
    caption,
    style,
    mood,
    objects: [...new Set([...objectNames, ...allLabels.slice(0, 7)])], // More objects
    colors,
    tags: tags.slice(0, 10) // More tags
  };
}

function determineStyle(labels, hasFaces = false, hasText = false) {
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
    'modern': 'Modern design',
    'anime': 'Anime style',
    'manga': 'Manga style',
    'watercolor': 'Watercolor painting',
    'oil painting': 'Oil painting',
    'sketch': 'Sketch style'
  };

  for (const [keyword, style] of Object.entries(styleMap)) {
    if (labels.some(label => label.includes(keyword))) {
      return style;
    }
  }
  
  // Enhanced style detection based on content
  if (hasFaces && labels.some(l => l.includes('art') || l.includes('illustration'))) {
    return 'Portrait illustration';
  }
  
  if (hasText && labels.some(l => l.includes('design') || l.includes('graphic'))) {
    return 'Graphic design with typography';
  }

  if (labels.some(l => l.includes('graphic') || l.includes('design'))) {
    return 'Graphic design';
  }
  if (labels.some(l => l.includes('art') || l.includes('creative'))) {
    return 'Artistic style';
  }

  return 'Contemporary style';
}

function determineMood(labels, hasFaces = false) {
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
    'minimal': 'Clean and minimal',
    'mysterious': 'Mysterious and intriguing',
    'romantic': 'Romantic and dreamy',
    'energetic': 'High-energy and vibrant',
    'serene': 'Peaceful and tranquil'
  };

  for (const [keyword, mood] of Object.entries(moodMap)) {
    if (labels.some(label => label.includes(keyword))) {
      return mood;
    }
  }
  
  // Enhanced mood detection
  if (hasFaces) {
    if (labels.some(l => l.includes('smile') || l.includes('joy'))) {
      return 'Joyful and expressive';
    }
    return 'Human-centered and engaging';
  }

  if (labels.some(l => l.includes('person') || l.includes('people'))) {
    return 'Human-centered and engaging';
  }
  if (labels.some(l => l.includes('nature') || l.includes('outdoor'))) {
    return 'Natural and refreshing';
  }
  if (labels.some(l => l.includes('city') || l.includes('urban'))) {
    return 'Urban and contemporary';
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

function generateCaption(labels, objects, style, analysis, extraInfo = {}) {
  // Create a comprehensive, detailed description
  const allElements = [...new Set([...objects, ...labels])];
  const { faceCount = 0, hasText = false, landmarks = [] } = extraInfo;
  
  // Categorize elements for better description
  const people = allElements.filter(el => 
    ['person', 'woman', 'man', 'child', 'people', 'human', 'face', 'portrait'].some(p => el.includes(p))
  );
  
  const animals = allElements.filter(el =>
    ['cat', 'dog', 'bird', 'animal', 'pet', 'wildlife', 'creature', 'horse', 'fish', 'butterfly'].some(a => el.includes(a))
  );
  
  const settings = allElements.filter(el =>
    ['building', 'house', 'room', 'outdoor', 'indoor', 'landscape', 'forest', 'city', 'street', 'nature', 'sky', 'water', 'mountain', 'garden', 'park', 'beach', 'office', 'interior', 'exterior'].some(s => el.includes(s))
  );
  
  const colors = allElements.filter(el =>
    ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'colorful', 'bright', 'dark', 'vibrant'].some(c => el.includes(c))
  );
  
  const artElements = allElements.filter(el =>
    ['illustration', 'drawing', 'painting', 'art', 'design', 'graphic', 'pattern', 'texture', 'abstract', 'creative', 'artistic'].some(a => el.includes(a))
  );
  
  const objects_items = allElements.filter(el =>
    !people.includes(el) && !animals.includes(el) && !settings.includes(el) && 
    !colors.includes(el) && !artElements.includes(el) &&
    !['image', 'photo', 'picture', 'file', 'visual'].includes(el)
  );
  
  // Build comprehensive description
  let description = `This is a ${style.toLowerCase()}`;
  
  // Add landmark information first if present
  if (landmarks.length > 0) {
    description += ` showcasing ${landmarks[0]}`;
  }
  
  // Add main subjects with face count specificity
  if (faceCount > 0) {
    if (faceCount === 1) {
      description += description.includes('showcasing') ? ' featuring a person' : ' featuring a single person';
    } else {
      description += description.includes('showcasing') ? ` featuring ${faceCount} people` : ` featuring a group of ${faceCount} people`;
    }
  } else if (people.length > 0) {
    const peopleDesc = people.slice(0, 2).join(' and ');
    description += description.includes('showcasing') ? ` with ${peopleDesc}` : ` featuring ${peopleDesc}`;
  } else if (animals.length > 0) {
    const animalDesc = animals.slice(0, 2).join(' and ');
    description += description.includes('showcasing') ? ` with ${animalDesc}` : ` showcasing ${animalDesc}`;
  } else if (objects_items.length > 0) {
    const objectDesc = objects_items.slice(0, 2).join(' and ');
    description += description.includes('showcasing') ? ` with ${objectDesc}` : ` depicting ${objectDesc}`;
  }
  
  // Add setting/environment
  if (settings.length > 0) {
    const settingDesc = settings.slice(0, 2).join(' and ');
    if (description.includes('featuring') || description.includes('showcasing') || description.includes('depicting')) {
      description += ` set in ${settingDesc}`;
    } else {
      description += ` taking place in ${settingDesc}`;
    }
  }
  
  // Add text information
  if (hasText) {
    description += `. The image includes text elements or typography`;
  }
  
  // Add color information with more detail
  if (colors.length > 0) {
    const colorDesc = colors.slice(0, 3).join(', ');
    description += `. The composition features ${colorDesc} color scheme`;
  }
  
  // Add additional objects/elements
  if (objects_items.length > 2) {
    const additionalItems = objects_items.slice(2, 5).join(', ');
    description += `, incorporating additional elements such as ${additionalItems}`;
  }
  
  // Add artistic qualities with more detail
  if (artElements.length > 0) {
    const artDesc = artElements.slice(0, 3).join(' and ');
    description += `. The artwork demonstrates ${artDesc} characteristics`;
  }
  
  // Get color palette info for richer description
  if (analysis?.imagePropertiesAnnotation?.dominantColors?.colors) {
    const dominantColor = analysis.imagePropertiesAnnotation.dominantColors.colors[0];
    if (dominantColor && dominantColor.color) {
      const { red = 0, green = 0, blue = 0 } = dominantColor.color;
      const colorName = getColorName(red, green, blue);
      if (!description.includes('color')) {
        description += `, with a dominant ${colorName} color palette`;
      }
    }
  }
  
  // Add style-specific details
  if (style.toLowerCase().includes('portrait') && faceCount > 0) {
    description += `. The portrait composition focuses on facial features and expression`;
  }
  
  if (style.toLowerCase().includes('landscape') || settings.some(s => s.includes('nature'))) {
    description += `. The landscape composition emphasizes environmental elements and spatial depth`;
  }
  
  // Ensure proper ending
  if (!description.endsWith('.')) {
    description += '.';
  }
  
  // Fallback for minimal data
  if (description.length < 80) {
    description = `This ${style.toLowerCase()} presents a carefully composed visual artwork featuring ${allElements.slice(0, 4).join(', ')}. The image demonstrates professional artistic technique with attention to visual balance, color harmony, and aesthetic appeal. The composition suggests thoughtful creative direction and skilled execution.`;
  }
  
  return description;
}

function getColorName(red, green, blue) {
  // Simple color name mapping based on RGB values
  if (red > 200 && green < 100 && blue < 100) return 'red';
  if (red < 100 && green > 200 && blue < 100) return 'green';
  if (red < 100 && green < 100 && blue > 200) return 'blue';
  if (red > 200 && green > 200 && blue < 100) return 'yellow';
  if (red > 200 && green < 100 && blue > 200) return 'purple';
  if (red > 200 && green > 150 && blue < 100) return 'orange';
  if (red > 200 && green > 200 && blue > 200) return 'light';
  if (red < 50 && green < 50 && blue < 50) return 'dark';
  if (red > 150 && green > 150 && blue > 150) return 'neutral';
  return 'colorful';
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
      caption: 'This is a creative visual artwork uploaded as a reference image. The image appears to showcase artistic design elements with professional composition and contemporary styling. The visual presentation suggests careful attention to color harmony and aesthetic appeal, making it suitable for style reference and creative inspiration.',
      style: 'Contemporary illustration',
      mood: 'Professional and modern',
      objects: ['design elements', 'visual components', 'artistic elements'],
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
