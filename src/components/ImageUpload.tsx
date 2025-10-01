import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader, AlertCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageAnalysis {
  caption?: string;
  style?: string;
  mood?: string;
  objects?: string[];
  colors?: Array<{ hex: string; percentage: number }>;
  tags?: string[];
}

interface UploadedImage {
  url: string;
  publicId: string;
  analysis?: ImageAnalysis;
}

interface ImageUploadProps {
  onImageUploaded: (image: UploadedImage) => void;
  onImageRemoved: () => void;
  uploadedImage?: UploadedImage;
  isAnalyzing?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  uploadedImage,
  isAnalyzing = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await response.json();
      
      // Analyze the uploaded image
      const analysisResponse = await fetch('/api/images/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: uploadResult.url }),
      });

      let analysis: ImageAnalysis | undefined;
      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        analysis = analysisResult.analysis;
      }

      const uploadedImageData: UploadedImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        analysis
      };

      onImageUploaded(uploadedImageData);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageRemoved();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        onClick={handleUploadClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isUploading ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'}
          ${error ? 'border-red-500 bg-red-900/20' : ''}
          ${uploadedImage ? 'border-green-500 bg-green-900/20' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-blue-400">Uploading and analyzing image...</p>
            </motion.div>
          ) : uploadedImage ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-2"
            >
              <Image className="w-8 h-8 text-green-400" />
              <p className="text-green-400">Image uploaded successfully</p>
              <p className="text-sm text-slate-500">Click to upload a different image</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-slate-300">Upload Reference Image</p>
              <p className="text-sm text-slate-500">Supports JPG, PNG, WebP (max 10MB)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-500 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Image Preview */}
      <AnimatePresence>
        {uploadedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative group">
              <img
                src={uploadedImage.url}
                alt="Uploaded reference"
                className="w-full max-w-sm mx-auto rounded-lg border border-slate-700 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {uploadedImage.analysis && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAnalysis(!showAnalysis);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Loading */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-blue-900/50 border border-blue-500 rounded-lg"
          >
            <Loader className="w-5 h-5 animate-spin text-blue-400" />
            <p className="text-blue-400">Analyzing image style...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {uploadedImage?.analysis && showAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Style Analysis</h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-slate-300">Description:</label>
                <p className="text-slate-200">{uploadedImage.analysis.caption || 'No description available'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Style:</label>
                <p className="text-slate-200">{uploadedImage.analysis.style || 'Style not detected'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Mood:</label>
                <p className="text-slate-200">{uploadedImage.analysis.mood || 'Mood not detected'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Key Objects:</label>
                <div className="flex flex-wrap gap-1">
                  {uploadedImage.analysis.objects?.map((object, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm"
                    >
                      {object}
                    </span>
                  )) || <span className="text-slate-500 text-sm">No objects detected</span>}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Color Palette:</label>
                <div className="flex flex-wrap gap-2">
                  {uploadedImage.analysis.colors?.map((color, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div
                        className="w-4 h-4 rounded border border-slate-600"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm text-slate-400">{color.percentage}%</span>
                    </div>
                  )) || <span className="text-slate-500 text-sm">No colors detected</span>}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Tags:</label>
                <div className="flex flex-wrap gap-1">
                  {uploadedImage.analysis.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-sm"
                    >
                      #{tag}
                    </span>
                  )) || <span className="text-slate-500 text-sm">No tags detected</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;