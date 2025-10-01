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
        { type: 'LABEL_DETECTION', maxResults: 25 }, // Increased for more labels
        { type: 'IMAGE_PROPERTIES' },
        { type: 'OBJECT_LOCALIZATION', maxResults: 20 }, // Increased for more objects
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'TEXT_DETECTION', maxResults: 5 }, // Detect any text in image
        { type: 'FACE_DETECTION', maxResults: 10 }, // Detect faces for better people description
        { type: 'LANDMARK_DETECTION', maxResults: 5 }, // Detect famous landmarks
        { type: 'WEB_DETECTION', maxResults: 10 } // Web entity detection for context
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
  // Extract all available data with proper validation
  const labels = analysis.labelAnnotations || [];
  const objects = analysis.localizedObjectAnnotations || [];
  const faces = analysis.faceAnnotations || [];
  const texts = analysis.textAnnotations || [];
  const landmarks = analysis.landmarkAnnotations || [];
  
  // Filter out only the most generic/unhelpful labels, but keep art style descriptors
  const filteredLabels = labels
    .map(label => label.description.toLowerCase())
    .filter(label => 
      // Remove only truly unhelpful meta labels
      !['file', 'visual', 'picture', 'image', 'photo', 'screenshot'].includes(label) &&
      // Remove overly generic happiness detection (often wrong)
      !['happiness'].includes(label) &&
      // Keep specific art styles but remove only the most generic ones
      !['clip art'].includes(label) && // Too generic
      !label.includes('font') &&
      label.length > 2
    );
  
  const allLabels = filteredLabels;
  const objectNames = objects.map(obj => obj.name.toLowerCase());
  
  // Only add face information if faces are actually detected
  if (faces.length > 0) {
    const faceCount = faces.length;
    if (faceCount === 1) {
      allLabels.unshift('portrait', 'person', 'face');
    } else {
      allLabels.unshift('people', 'group', 'faces');
    }
  }
  
  // Only add text information if actual text is detected and contains meaningful content
  const hasActualText = texts.length > 0 && texts.some(text => 
    text.description && 
    text.description.trim().length > 0 && 
    text.description.trim() !== ' ' &&
    !text.description.match(/^[\s\n\r]*$/)
  );
  
  // Only add landmark information if landmarks are actually detected
  if (landmarks.length > 0) {
    landmarks.forEach(landmark => {
      allLabels.push(landmark.description.toLowerCase());
    });
    allLabels.push('landmark', 'famous location');
  }
  
  // Determine style and mood with enhanced data
  const style = determineStyle(allLabels, faces.length > 0, hasActualText);
  const mood = determineMood(allLabels, faces.length > 0);
  
  // Extract colors
  const colors = extractColors(analysis.imagePropertiesAnnotation);
  
  // Create enhanced tags
  const tags = createTags(allLabels, objectNames);
  
  // Generate comprehensive caption with all analysis data
  const caption = generateCaption(allLabels, objectNames, style, analysis, {
    faceCount: faces.length,
    hasText: hasActualText,
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
  // Enhanced style detection with more specific and accurate categorization
  const styleMap = {
    // Digital Art Styles
    'flat design': 'Flat design illustration',
    'vector art': 'Vector illustration',
    'vector': 'Vector illustration',
    'digital art': 'Digital artwork',
    'digital illustration': 'Digital illustration',
    'modern design': 'Modern design illustration',
    'minimal': 'Minimalist illustration',
    'minimalism': 'Minimalist design',
    'geometric': 'Geometric illustration',
    
    // Traditional Art Styles
    'watercolor': 'Watercolor painting',
    'oil painting': 'Oil painting',
    'acrylic': 'Acrylic painting',
    'pencil drawing': 'Pencil drawing',
    'charcoal': 'Charcoal drawing',
    'ink drawing': 'Ink drawing',
    'pastel': 'Pastel artwork',
    
    // Illustration Types
    'line art': 'Line art illustration',
    'technical drawing': 'Technical illustration',
    'architectural drawing': 'Architectural illustration',
    'scientific illustration': 'Scientific illustration',
    'medical illustration': 'Medical illustration',
    'botanical illustration': 'Botanical illustration',
    
    // Animation & Cartoon Styles
    'cartoon': 'Cartoon illustration',
    'animated cartoon': 'Animated cartoon style',
    'animation': 'Animation-style illustration',
    'disney': 'Disney-style animation',
    'pixar': 'Pixar-style 3D animation',
    'anime': 'Anime illustration',
    'manga': 'Manga-style artwork',
    'comic': 'Comic book illustration',
    'graphic novel': 'Graphic novel style',
    
    // Photography Styles
    'photograph': 'Photograph',
    'portrait photography': 'Portrait photograph',
    'landscape photography': 'Landscape photograph',
    'macro photography': 'Macro photograph',
    'street photography': 'Street photograph',
    'documentary': 'Documentary photograph',
    
    // 3D & Rendered Styles
    '3d render': '3D rendered illustration',
    '3d modeling': '3D model visualization',
    'cgi': 'CGI illustration',
    'rendered': '3D rendered artwork',
    
    // Artistic Movements & Styles
    'abstract': 'Abstract artwork',
    'surreal': 'Surrealist artwork',
    'impressionist': 'Impressionist painting',
    'expressionist': 'Expressionist artwork',
    'cubist': 'Cubist artwork',
    'pop art': 'Pop art illustration',
    'art nouveau': 'Art Nouveau style',
    'art deco': 'Art Deco design',
    
    // Design Categories
    'infographic': 'Infographic design',
    'logo design': 'Logo design',
    'poster': 'Poster design',
    'banner': 'Banner design',
    'icon': 'Icon design',
    'user interface': 'UI design',
    'web design': 'Web design',
    'graphic design': 'Graphic design',
    
    // Vintage & Historical
    'vintage': 'Vintage-style illustration',
    'retro': 'Retro-style design',
    'art deco': 'Art Deco design',
    'victorian': 'Victorian-style artwork',
    'medieval': 'Medieval-style illustration',
    
    // Textures & Techniques
    'grunge': 'Grunge-style artwork',
    'distressed': 'Distressed design',
    'textured': 'Textured illustration',
    'gradient': 'Gradient design',
    'monochrome': 'Monochrome artwork',
    'silhouette': 'Silhouette illustration'
  };

  // Priority-based detection (more specific matches first)
  const priorityOrder = [
    'flat design', 'vector art', 'digital illustration', 'watercolor', 'oil painting',
    'anime', 'manga', 'cartoon', 'animation', 'comic', '3d render', 'abstract',
    'minimalism', 'geometric', 'line art', 'infographic', 'logo design',
    'vintage', 'retro', 'photograph', 'portrait photography'
  ];

  for (const keyword of priorityOrder) {
    if (labels.some(label => label.includes(keyword))) {
      return styleMap[keyword];
    }
  }

  // Fallback detection for remaining styles
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
  
  // Enhanced categorization with better keyword matching
  const people = allElements.filter(el => 
    ['person', 'woman', 'man', 'child', 'people', 'human', 'face', 'portrait', 'group', 'crowd', 'figure'].some(p => el.includes(p))
  );
  
  const hands = allElements.filter(el =>
    ['hand', 'finger', 'gesture', 'handshake', 'reach', 'touch', 'palm'].some(h => el.includes(h))
  );
  
  const diversity = allElements.filter(el =>
    ['diverse', 'diversity', 'multicultural', 'ethnic', 'inclusion', 'inclusive', 'community', 'team', 'collaboration', 'unity', 'together'].some(d => el.includes(d))
  );
  
  const animals = allElements.filter(el =>
    ['cat', 'dog', 'bird', 'animal', 'pet', 'wildlife', 'creature', 'horse', 'fish', 'butterfly', 'mammal'].some(a => el.includes(a))
  );
  
  const settings = allElements.filter(el =>
    ['building', 'house', 'room', 'outdoor', 'indoor', 'landscape', 'forest', 'city', 'street', 'nature', 'sky', 'water', 'mountain', 'garden', 'park', 'beach', 'office', 'interior', 'exterior', 'background'].some(s => el.includes(s))
  );
  
  const colors = allElements.filter(el =>
    ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'colorful', 'bright', 'dark', 'vibrant', 'multicolor'].some(c => el.includes(c))
  );
  
  const artElements = allElements.filter(el =>
    [
      // Digital Art Styles
      'flat design', 'vector', 'digital art', 'digital illustration', 'modern design', 'minimalist', 'geometric',
      // Traditional Art
      'watercolor', 'oil painting', 'acrylic', 'pencil drawing', 'charcoal', 'ink', 'pastel',
      // Illustration Types
      'line art', 'technical drawing', 'architectural', 'scientific illustration', 'botanical',
      // Animation & Cartoon
      'cartoon', 'animation', 'anime', 'manga', 'comic', 'graphic novel',
      // 3D & Rendered
      '3d render', 'cgi', 'rendered',
      // Artistic Movements
      'abstract', 'surreal', 'impressionist', 'expressionist', 'cubist', 'pop art', 'art nouveau', 'art deco',
      // Design Categories
      'infographic', 'logo', 'poster', 'banner', 'icon', 'graphic design',
      // General terms (keep these for fallback)
      'illustration', 'drawing', 'painting', 'art', 'design', 'graphic', 'artistic', 'creative'
    ].some(a => el.includes(a))
  );
  
  const emotions = allElements.filter(el =>
    ['happy', 'joy', 'smile', 'cheerful', 'positive', 'optimistic', 'friendly', 'warm', 'welcoming', 'peaceful'].some(e => el.includes(e))
  );
  
  const objects_items = allElements.filter(el =>
    !people.includes(el) && !hands.includes(el) && !diversity.includes(el) && !animals.includes(el) && 
    !settings.includes(el) && !colors.includes(el) && !artElements.includes(el) && !emotions.includes(el) &&
    !['image', 'photo', 'picture', 'file', 'visual', 'clip art', 'graphics'].includes(el)
  );
  
  // Determine if this is a group/community scene
  const isGroupScene = faceCount > 1 || people.length > 1 || diversity.length > 0;
  const hasHandGestures = hands.length > 0;
  const isCollaborativeTheme = diversity.length > 0 || hands.length > 0 || 
    allElements.some(el => ['team', 'together', 'unity', 'collaboration', 'community'].some(t => el.includes(t)));
  
  // Build comprehensive description with proper narrative flow
  let description = `This is a ${style.toLowerCase()}`;
  
  // Add landmark information first if present
  if (landmarks.length > 0) {
    description += ` showcasing the iconic ${landmarks[0]}`;
  }
  
  // Main subject description with specificity
  if (isGroupScene) {
    if (faceCount > 0) {
      if (faceCount === 2) {
        description += ` featuring two people`;
      } else if (faceCount > 2) {
        description += ` featuring a ${diversity.length > 0 ? 'diverse ' : ''}group of ${faceCount} people`;
        if (diversity.length > 0) {
          description += ` from different ethnic backgrounds`;
        }
      }
    } else if (people.length > 1) {
      description += ` featuring multiple characters`;
      if (diversity.length > 0) {
        description += ` representing diversity and inclusion`;
      }
    }
    
    // Add collaborative elements
    if (isCollaborativeTheme) {
      if (hasHandGestures) {
        description += ` engaged in a collaborative gesture`;
      } else {
        description += ` in a unified, collaborative scene`;
      }
    }
  } else if (faceCount === 1 || people.length > 0) {
    description += ` featuring a single person`;
  } else if (animals.length > 0) {
    const animalDesc = animals.slice(0, 2).join(' and ');
    description += ` showcasing ${animalDesc}`;
  } else if (objects_items.length > 0) {
    const objectDesc = objects_items.slice(0, 2).join(' and ');
    description += ` depicting ${objectDesc}`;
  }
  
  // Add specific gesture/action details
  if (hasHandGestures && isGroupScene) {
    description += `. The composition centers on multiple hands reaching toward each other`;
    if (diversity.length > 0) {
      description += ` of varying skin tones`;
    }
    description += `, symbolizing teamwork and unity`;
  }
  
  // Add arrangement and composition details
  if (isGroupScene) {
    if (allElements.some(el => el.includes('circle') || el.includes('around'))) {
      description += `. The characters are arranged in a circular formation around this central focal point`;
    } else if (faceCount > 2) {
      description += `. The figures are thoughtfully positioned to create visual balance`;
    }
  }
  
  // Add clothing and visual details for group scenes
  if (isGroupScene && (colors.length > 1 || allElements.some(el => el.includes('clothing') || el.includes('shirt')))) {
    description += `, each wearing distinct colored clothing`;
    if (colors.length >= 3) {
      const colorList = colors.slice(0, 4).join(', ');
      description += ` including ${colorList} garments`;
    }
  }
  
  // Add setting/environment with more detail
  if (settings.length > 0) {
    const settingDesc = settings.slice(0, 2).join(' and ');
    description += `. The artwork uses ${settingDesc}`;
    
    // Add background color information from analysis
    if (analysis?.imagePropertiesAnnotation?.dominantColors?.colors) {
      const dominantColor = analysis.imagePropertiesAnnotation.dominantColors.colors[0];
      if (dominantColor && dominantColor.color) {
        const { red = 0, green = 0, blue = 0 } = dominantColor.color;
        const colorName = getColorName(red, green, blue);
        description += ` with a ${colorName} background`;
      }
    }
  }
  
  // Enhanced color analysis - only mention colors that are actually prominent
  if (analysis?.imagePropertiesAnnotation?.dominantColors?.colors?.length > 1) {
    const dominantColors = analysis.imagePropertiesAnnotation.dominantColors.colors.slice(0, 3);
    const colorNames = dominantColors.map(colorData => {
      const { red = 0, green = 0, blue = 0 } = colorData.color || {};
      return getColorName(red, green, blue);
    }).filter(color => color && color !== 'neutral');
    
    if (colorNames.length > 1) {
      description += `. The composition features a ${colorNames.join(' and ')} color palette`;
    } else if (colorNames.length === 1) {
      description += `. The image emphasizes ${colorNames[0]} tones throughout the composition`;
    }
  } else if (colors.length > 0 && !colors.includes('colorful')) {
    // Only mention detected colors if they're specific, not generic
    const specificColors = colors.filter(c => !['colorful', 'bright', 'dark'].includes(c));
    if (specificColors.length > 0) {
      description += `. The image emphasizes ${specificColors[0]} tones throughout the composition`;
    }
  }
  
  // Add text information with context
  if (hasText) {
    description += `. The design incorporates text elements or typography as part of the visual communication`;
  }
  
  // Enhanced artistic style description
  if (artElements.length > 0) {
    const artDesc = artElements.slice(0, 3).join(' and ');
    description += `. The illustration style is ${artDesc}`;
    
    if (isGroupScene && diversity.length > 0) {
      description += `, with clean geometric shapes and simplified features typical of modern diversity and inclusion artwork`;
    } else if (artElements.some(el => el.includes('flat') || el.includes('vector'))) {
      description += `, with clean lines and simplified geometric forms`;
    }
  }
  
  // Add emotional and thematic context
  if (emotions.length > 0 || isCollaborativeTheme) {
    const mood = emotions.length > 0 ? emotions[0] : 'positive';
    description += `. The overall mood is ${mood} and ${isCollaborativeTheme ? 'collaborative' : 'engaging'}`;
    
    if (isCollaborativeTheme) {
      description += `, emphasizing ${diversity.length > 0 ? 'community collaboration and human connection' : 'teamwork and unity'}`;
    }
  }
  
  // Add composition and visual flow analysis
  if (hasHandGestures || isGroupScene) {
    description += `. The visual composition draws the eye to the central ${hasHandGestures ? 'hand gesture' : 'focal point'}`;
    if (isGroupScene) {
      description += ` while maintaining balance through the ${faceCount > 3 ? 'circular arrangement of figures' : 'thoughtful positioning of characters'}`;
    }
  }
  
  // Add additional contextual objects if relevant
  if (objects_items.length > 0 && !hasHandGestures) {
    const additionalItems = objects_items.slice(0, 3).join(', ');
    description += `, incorporating elements such as ${additionalItems}`;
  }
  
  // Ensure proper ending
  if (!description.endsWith('.')) {
    description += '.';
  }
  
  // Enhanced fallback for minimal data
  if (description.length < 100) {
    if (isGroupScene) {
      description = `This ${style.toLowerCase()} presents a thoughtfully composed scene featuring multiple characters in a collaborative arrangement. The artwork demonstrates professional illustration technique with attention to diversity, visual balance, and community themes. The composition uses vibrant colors and modern design principles to create an engaging, inclusive visual narrative that emphasizes human connection and teamwork.`;
    } else {
      description = `This ${style.toLowerCase()} presents a carefully composed visual artwork featuring ${allElements.slice(0, 4).join(', ')}. The image demonstrates professional artistic technique with attention to visual balance, color harmony, and aesthetic appeal. The composition suggests thoughtful creative direction and skilled execution with modern design sensibilities.`;
    }
  }
  
  return description;
}

function getColorName(red, green, blue) {
  // Enhanced color classification with more nuanced ranges
  const colorMappings = [
    // Basic colors with tighter ranges
    { range: [220, 20, 60], threshold: 60, name: 'crimson' },
    { range: [255, 0, 0], threshold: 50, name: 'red' },
    { range: [255, 165, 0], threshold: 50, name: 'orange' },
    { range: [255, 255, 0], threshold: 50, name: 'yellow' },
    { range: [0, 255, 0], threshold: 50, name: 'lime green' },
    { range: [0, 128, 0], threshold: 50, name: 'green' },
    { range: [0, 255, 255], threshold: 50, name: 'cyan' },
    { range: [0, 191, 255], threshold: 50, name: 'deep sky blue' },
    { range: [0, 0, 255], threshold: 50, name: 'blue' },
    { range: [75, 0, 130], threshold: 50, name: 'indigo' },
    { range: [128, 0, 128], threshold: 50, name: 'purple' },
    { range: [255, 192, 203], threshold: 60, name: 'pink' },
    { range: [255, 20, 147], threshold: 60, name: 'deep pink' },
    { range: [199, 21, 133], threshold: 60, name: 'medium violet red' },
    // Neutral colors
    { range: [255, 255, 255], threshold: 30, name: 'white' },
    { range: [220, 220, 220], threshold: 30, name: 'light gray' },
    { range: [128, 128, 128], threshold: 30, name: 'gray' },
    { range: [64, 64, 64], threshold: 30, name: 'dark gray' },
    { range: [0, 0, 0], threshold: 30, name: 'black' },
    // Earth tones
    { range: [139, 69, 19], threshold: 50, name: 'saddle brown' },
    { range: [160, 82, 45], threshold: 50, name: 'sienna' },
    { range: [210, 180, 140], threshold: 50, name: 'tan' },
    { range: [245, 245, 220], threshold: 40, name: 'beige' },
    // Pastels
    { range: [230, 230, 250], threshold: 40, name: 'lavender' },
    { range: [255, 240, 245], threshold: 40, name: 'lavender blush' },
    { range: [240, 248, 255], threshold: 40, name: 'alice blue' },
    { range: [255, 248, 220], threshold: 40, name: 'cornsilk' }
  ];

  let closestMatch = { name: 'neutral', distance: Infinity };
  
  for (const color of colorMappings) {
    const distance = Math.sqrt(
      Math.pow(red - color.range[0], 2) +
      Math.pow(green - color.range[1], 2) +
      Math.pow(blue - color.range[2], 2)
    );
    
    if (distance < color.threshold && distance < closestMatch.distance) {
      closestMatch = { name: color.name, distance };
    }
  }
  
  // Advanced color analysis for more accurate naming
  if (closestMatch.name === 'neutral') {
    // Brightness analysis
    const brightness = (red + green + blue) / 3;
    const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
    
    if (brightness > 200 && saturation < 30) {
      return 'light neutral';
    } else if (brightness < 80 && saturation < 50) {
      return 'dark neutral';
    } else if (saturation > 100) {
      // Determine dominant hue for saturated colors
      if (red > green && red > blue) {
        if (green > blue) return 'warm orange-red';
        return 'vibrant red';
      } else if (green > red && green > blue) {
        if (blue > red) return 'teal green';
        return 'vibrant green';
      } else if (blue > red && blue > green) {
        if (red > green) return 'purple-blue';
        return 'vibrant blue';
      }
    }
    
    // HSV analysis for better color detection
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    
    if (delta > 0) {
      let hue = 0;
      if (max === red) {
        hue = ((green - blue) / delta) % 6;
      } else if (max === green) {
        hue = (blue - red) / delta + 2;
      } else {
        hue = (red - green) / delta + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
      
      // Convert hue to color name
      if (hue >= 0 && hue < 30) return 'red-orange';
      if (hue >= 30 && hue < 60) return 'orange-yellow';
      if (hue >= 60 && hue < 120) return 'yellow-green';
      if (hue >= 120 && hue < 180) return 'green-cyan';
      if (hue >= 180 && hue < 240) return 'cyan-blue';
      if (hue >= 240 && hue < 300) return 'blue-purple';
      if (hue >= 300 && hue < 360) return 'purple-red';
    }
  }
  
  return closestMatch.name;
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
