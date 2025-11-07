import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { generateProductImage, applyLogoToImage } from './services/geminiService';
import { fileToBase64, parseDataUrl } from './utils/imageUtils';
import { UploadIcon, CheckCircleIcon, ArrowRightIcon, RefreshIcon, XCircleIcon } from './components/icons';

type ImageState = {
  url: string;
  parsed: {
    data: string;
    mimeType: string;
  };
} | null;

const promptSuggestions = [
  'a white t-shirt on a hanger',
  'a black coffee mug on a wooden table',
  'a canvas tote bag with neutral colors',
  'a stainless steel water bottle',
  'a baseball cap on a clean background',
  'a dark grey hoodie folded neatly',
  'a simple smartphone case',
  'a spiral notebook with a pen beside it',
];

const ImageDisplay: React.FC<{ title: string; imageSrc: string | null; isLoading: boolean }> = ({ title, imageSrc, isLoading }) => (
  <div className="w-full aspect-square bg-dark-card rounded-lg flex items-center justify-center p-4 shadow-lg border border-dark-border">
    {isLoading ? (
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-medium-text">Generating...</p>
      </div>
    ) : imageSrc ? (
      <img src={imageSrc} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
    ) : (
      <div className="text-center text-medium-text">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <p className="mt-2 text-sm">{title}</p>
      </div>
    )}
  </div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const [mockupPrompt, setMockupPrompt] = useState('a white t-shirt on a hanger');
  const [editPrompt, setEditPrompt] = useState('Place the logo on the center of the t-shirt');
  const [mockupImage, setMockupImage] = useState<ImageState>(null);
  const [logoImage, setLogoImage] = useState<ImageState>(null);
  const [finalImage, setFinalImage] = useState<ImageState>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateMockup = useCallback(async () => {
    if (!mockupPrompt) {
      setError('Please enter a prompt for the mockup.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMockupImage(null);

    try {
      const imageData = await generateProductImage(mockupPrompt);
      const dataUrl = `data:image/jpeg;base64,${imageData}`;
      setMockupImage({
        url: dataUrl,
        parsed: { data: imageData, mimeType: 'image/jpeg' },
      });
      setStep(2);
    } catch (e) {
      console.error(e);
      setError('Failed to generate mockup image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mockupPrompt]);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToBase64(file);
        const parsed = parseDataUrl(dataUrl);
        setLogoImage({ url: dataUrl, parsed });
        setError(null);
      } catch (e) {
        console.error(e);
        setError('Failed to read logo file.');
      }
    }
  }, []);

  const handleApplyLogo = useCallback(async () => {
    if (!mockupImage || !logoImage || !editPrompt) {
      setError('Please ensure mockup, logo, and edit prompt are ready.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFinalImage(null);

    try {
      const finalImageData = await applyLogoToImage(mockupImage.parsed, logoImage.parsed, editPrompt);
      const dataUrl = `data:image/png;base64,${finalImageData}`;
      setFinalImage({
        url: dataUrl,
        parsed: { data: finalImageData, mimeType: 'image/png' },
      });
      setStep(3);
    } catch (e) {
      console.error(e);
      setError('Failed to apply logo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mockupImage, logoImage, editPrompt]);

  const handleReset = () => {
    setStep(1);
    setMockupImage(null);
    setLogoImage(null);
    setFinalImage(null);
    setIsLoading(false);
    setError(null);
    setMockupPrompt('a white t-shirt on a hanger');
    setEditPrompt('Place the logo on the center of the t-shirt');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3" role="alert">
              <XCircleIcon />
              <span className="block sm:inline">{error}</span>
              <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-light-text">Step 1: Generate a Mockup</h2>
                <p className="text-medium-text mb-6">Describe the product you want to create a mockup for.</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mockup-prompt" className="block text-sm font-medium text-medium-text mb-2">Product Description</label>
                    <textarea
                      id="mockup-prompt"
                      rows={3}
                      className="w-full bg-dark-input border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                      value={mockupPrompt}
                      onChange={(e) => setMockupPrompt(e.target.value)}
                      placeholder="e.g., a black coffee mug on a wooden table"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-medium-text mb-3">Or try one of these:</p>
                    <div className="flex flex-wrap gap-2">
                        {promptSuggestions.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => setMockupPrompt(prompt)}
                                className="bg-dark-input hover:bg-dark-border text-light-text text-xs font-medium py-2 px-3 rounded-full transition duration-200"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateMockup}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Generating...' : 'Generate Mockup'} <ArrowRightIcon />
                  </button>
                </div>
              </div>
              <ImageDisplay title="Mockup will appear here" imageSrc={mockupImage?.url ?? null} isLoading={isLoading} />
            </div>
          )}

          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-6">
                 <div>
                    <h2 className="text-2xl font-bold mb-1 text-light-text">Step 2: Add Your Logo</h2>
                    <p className="text-medium-text">Upload your logo and tell the AI how to place it.</p>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="cursor-pointer bg-dark-card border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-brand-primary transition duration-200"
                  >
                    {logoImage ? (
                      <div className="flex flex-col items-center gap-3">
                         <img src={logoImage.url} alt="Logo preview" className="max-h-24 object-contain rounded-md bg-white p-1" />
                         <div className="flex items-center gap-2 text-green-400">
                           <CheckCircleIcon /> 
                           <p className="font-semibold">Logo Uploaded</p>
                         </div>
                         <p className="text-sm text-medium-text">Click to choose a different logo</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-medium-text">
                        <UploadIcon />
                        <p className="font-semibold text-light-text">Click to upload your logo</p>
                        <p className="text-sm">PNG, JPG, WEBP</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit-prompt" className="block text-sm font-medium text-medium-text mb-2">Instructions</label>
                    <textarea
                      id="edit-prompt"
                      rows={3}
                      className="w-full bg-dark-input border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., place the logo on the front of the mug"
                    />
                  </div>
                  
                  <button
                    onClick={handleApplyLogo}
                    disabled={isLoading || !logoImage}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Applying Logo...' : 'Create Final Image'}
                  </button>
                </div>
              </div>
              <ImageDisplay title="Your Mockup" imageSrc={mockupImage?.url ?? null} isLoading={false} />
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-light-text">Step 3: Your Final Product!</h2>
                <p className="text-medium-text mb-6">Here is your final product mockup with the logo applied.</p>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  <RefreshIcon /> Create Another Mockup
                </button>
              </div>
              <ImageDisplay title="Final Product" imageSrc={finalImage?.url ?? null} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}