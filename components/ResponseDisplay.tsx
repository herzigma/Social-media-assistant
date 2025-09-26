import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { GeneratedResponse } from '../types';

interface ResponseDisplayProps {
  response: GeneratedResponse;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  if (!response || !response.variations || response.variations.length === 0) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({...prev, [id]: true}));
    setTimeout(() => setCopiedStates(prev => ({...prev, [id]: false})), 2000);
  };

  const activeVariation = response.variations[activeTab];

  const handleHashtagCopy = () => {
    const hashtagText = response.hashtags.map(h => `#${h}`).join(' ');
    handleCopy(hashtagText, 'hashtags');
  }

  return (
    <div className="bg-gray-900 rounded-xl flex flex-col gap-6 transition-all duration-300">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">3. Choose Your Response</h2>
        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {response.variations.map((variation, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === index 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`
                }
              >
                {variation.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pt-5 relative">
           <button
                onClick={() => handleCopy(activeVariation.text, `variation-${activeTab}`)}
                className="absolute top-5 right-0 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Copy to clipboard"
            >
                {copiedStates[`variation-${activeTab}`] ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
          <div className="prose prose-invert prose-p:text-gray-300 prose-p:my-2 prose-strong:text-white bg-gray-800/50 p-4 rounded-lg min-h-[120px]">
            {activeVariation.text.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p> // Use non-breaking space for empty lines
            ))}
          </div>
        </div>
      </div>
      
      {/* Hashtags */}
      {response.hashtags && response.hashtags.length > 0 && (
          <div className="border-t border-gray-800 bg-gray-900/50 p-6 rounded-b-xl">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-md font-semibold text-gray-300">Suggested Hashtags</h3>
                 <button
                    onClick={handleHashtagCopy}
                    className="flex items-center gap-2 text-xs p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-all duration-200"
                    aria-label="Copy all hashtags"
                >
                    {copiedStates['hashtags'] ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    Copy All
                 </button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {response.hashtags.map((tag, index) => (
                      <span key={index} className="bg-gray-700 text-indigo-300 text-sm font-medium px-2.5 py-1 rounded-full">
                          #{tag}
                      </span>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default ResponseDisplay;