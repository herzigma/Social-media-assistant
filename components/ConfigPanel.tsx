import React, { useRef } from 'react';
import { ConfigOptions, Tone, Style, Action, Platform, Length } from '../types';
import { GenerateIcon, DocumentTextIcon } from './icons';

interface ConfigPanelProps {
  config: ConfigOptions;
  setConfig: React.Dispatch<React.SetStateAction<ConfigOptions>>;
  onGenerate: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  onStyleUpload: (file: File) => void;
  styleFilename: string | null;
  onClearStyle: () => void;
}

type OptionProps<T> = {
  title: string;
  options: T[];
  selected: T;
  onSelect: (option: T) => void;
}

const OptionGroup = <T extends string,>({ title, options, selected, onSelect }: OptionProps<T>) => (
  <div>
    <h3 className="text-md font-semibold text-gray-300 mb-3">{title}</h3>
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-3 py-2 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500
            ${selected === option ? 'bg-indigo-600 text-white font-semibold shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  setConfig, 
  onGenerate, 
  isLoading,
  isImageUploaded,
  onStyleUpload,
  styleFilename,
  onClearStyle
}) => {
  const styleInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onStyleUpload(file);
    }
  };
  
  const getButtonText = () => {
    if (isLoading) return 'Generating...';
    return 'Generate Response';
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 sticky top-8">
      <h2 className="text-xl font-semibold text-white mb-6">2. Configure Response</h2>
      <div className="space-y-6">
        
        <div>
          <h3 className="text-md font-semibold text-gray-300 mb-3">Personalize Style (Optional)</h3>
          <div className="bg-gray-800 p-3 rounded-lg">
            <input
              type="file"
              ref={styleInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="hidden"
            />
            {!styleFilename ? (
              <button
                onClick={() => styleInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Upload Style (CSV, TXT)
              </button>
            ) : (
              <div className="flex items-center justify-between text-sm">
                  <p className="text-green-400 truncate flex-1">{styleFilename}</p>
                  <button onClick={onClearStyle} className="ml-2 text-red-500 hover:text-red-400 text-xs font-bold">CLEAR</button>
              </div>
            )}
          </div>
        </div>
        
        <OptionGroup
          title="Platform"
          options={Object.values(Platform)}
          selected={config.platform}
          onSelect={(platform) => setConfig(prev => ({ ...prev, platform }))}
        />
        <OptionGroup
          title="Tone"
          options={Object.values(Tone)}
          selected={config.tone}
          onSelect={(tone) => setConfig(prev => ({ ...prev, tone }))}
        />
         <OptionGroup
          title="Length"
          options={Object.values(Length)}
          selected={config.length}
          onSelect={(length) => setConfig(prev => ({ ...prev, length }))}
        />
        <OptionGroup
          title="Style"
          options={Object.values(Style)}
          selected={config.style}
          onSelect={(style) => setConfig(prev => ({ ...prev, style }))}
        />
        <OptionGroup
          title="Action"
          options={Object.values(Action)}
          selected={config.action}
          onSelect={(action) => setConfig(prev => ({ ...prev, action }))}
        />

        <div>
          <h3 className="text-md font-semibold text-gray-300 mb-3">Extras</h3>
          <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
            <label htmlFor="include-emojis" className="text-sm font-medium text-gray-300">Include Emojis</label>
            <button
                id="include-emojis"
                onClick={() => setConfig(prev => ({...prev, includeEmojis: !prev.includeEmojis}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500
                ${config.includeEmojis ? 'bg-indigo-600' : 'bg-gray-600'}`}
              >
              <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${config.includeEmojis ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || !isImageUploaded}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
        >
          <GenerateIcon className="w-5 h-5" />
          {getButtonText()}
        </button>
        {!isImageUploaded && <p className="text-center text-xs text-yellow-500 mt-3">Please upload an image to enable generation.</p>}
      </div>
    </div>
  );
};

export default ConfigPanel;
