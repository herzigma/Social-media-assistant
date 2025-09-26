import React, { useState, useCallback, useEffect } from 'react';
import { ConfigOptions, Tone, Style, Action, Platform, GeneratedResponse, Length } from './types';
import { generateAutomatedResponse } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ConfigPanel from './components/ConfigPanel';
import ResponseDisplay from './components/ResponseDisplay';
import Loader from './components/Loader';
import ImageModal from './components/ImageModal';
import { BotIcon } from './components/icons';

const SHARED_IMAGE_CACHE_NAME = 'shared-image-cache';

const App: React.FC = () => {
  const [config, setConfig] = useState<ConfigOptions>({
    tone: Tone.Professional,
    style: Style.Concise,
    action: Action.Acknowledge,
    includeEmojis: true,
    platform: Platform.General,
    length: Length.Medium,
  });

  const [uploadedImage, setUploadedImage] = useState<{data: string; mimeType: string} | null>(null);
  const [styleData, setStyleData] = useState<{filename: string, content: string} | null>(null);
  
  const [generatedResponse, setGeneratedResponse] = useState<GeneratedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Effect to check for shared image on app load
  useEffect(() => {
    const checkForSharedImage = async () => {
      try {
        const cache = await caches.open(SHARED_IMAGE_CACHE_NAME);
        const request = new Request('shared-image');
        const response = await cache.match(request);
        
        if (response) {
          const imageData = await response.json();
          if (imageData && imageData.data && imageData.mimeType) {
            handleImageUpload(imageData.data, imageData.mimeType);
            // Clean up the cache
            await cache.delete(request);
          }
        }
      } catch (err) {
        console.error("Error checking for shared image:", err);
      }
    };
    checkForSharedImage();
  }, []);


  const resetStateForNewGeneration = () => {
    setError(null);
    setGeneratedResponse(null);
  }

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError('Please upload a screenshot first.');
      return;
    }

    setIsLoading(true);
    resetStateForNewGeneration();

    try {
      const response = await generateAutomatedResponse(
        uploadedImage, 
        config,
        styleData?.content ?? null
      );
      setGeneratedResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, config, styleData]);
  
  const handleImageUpload = (base64Data: string, mimeType: string) => {
    setUploadedImage({ data: base64Data, mimeType });
    resetStateForNewGeneration();
    setError(null);
  };

  const handleStyleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        setStyleData({ filename: file.name, content });
        resetStateForNewGeneration();
        setError(null);
    };
    reader.onerror = () => {
        setError("Failed to read the style file.");
    };
    reader.readAsText(file);
  };

  const handleClearStyle = () => {
    setStyleData(null);
  }

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BotIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Social Media Assistant</h1>
              <p className="text-gray-400">Generate multiple platform-optimized responses in one click.</p>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <ImageUploader onImageUpload={handleImageUpload} onImageClick={() => setIsModalOpen(true)} uploadedImage={uploadedImage} />
              
              {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center bg-gray-900 rounded-xl p-8 min-h-[200px]">
                  <Loader />
                  <p className="text-gray-400 mt-4">Crafting response variations...</p>
                  <p className="text-gray-500 text-sm mt-2">(Optimizing for {config.platform}, enhancing, and humanizing)</p>
                </div>
              ) : (
                generatedResponse && (
                  <ResponseDisplay 
                    response={generatedResponse}
                  />
                )
              )}
            </div>

            <div className="lg:col-span-1">
              <ConfigPanel 
                config={config} 
                setConfig={setConfig} 
                onGenerate={handleGenerate}
                isLoading={isLoading}
                isImageUploaded={!!uploadedImage}
                onStyleUpload={handleStyleUpload}
                styleFilename={styleData?.filename ?? null}
                onClearStyle={handleClearStyle}
              />
            </div>
          </main>
        </div>
      </div>
      {isModalOpen && uploadedImage && (
        <ImageModal
          imageSrc={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default App;