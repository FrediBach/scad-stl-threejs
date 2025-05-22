"use client";

import React, { useState, useEffect, useCallback } from 'react';
import init, { render as renderScad } from 'openscad-wasm-prebuilt'; // Ensure this is the prebuilt package
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Download, Loader2 } from 'lucide-react';

const ScadToStlConverter: React.FC = () => {
  const [scadCode, setScadCode] = useState<string>('// Example: A simple cube\ncube(10);');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWasmInitialized, setIsWasmInitialized] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWasm = async () => {
      try {
        console.log("Initializing OpenSCAD WASM (prebuilt)...");
        await init(); 
        setIsWasmInitialized(true);
        console.log("OpenSCAD WASM (prebuilt) Initialized.");
        showSuccess("OpenSCAD engine initialized and ready!");
      } catch (e) {
        console.error("Failed to initialize OpenSCAD WASM (prebuilt):", e);
        const message = e instanceof Error ? e.message : String(e);
        setInitError(`Failed to initialize OpenSCAD engine: ${message}. Check console for details.`);
        showError("Error initializing OpenSCAD engine.");
      }
    };
    initializeWasm();
  }, []);

  const handleConvert = useCallback(async () => {
    if (!isWasmInitialized) {
      showError("OpenSCAD engine is not ready. Please wait or refresh.");
      return;
    }
    if (!scadCode.trim()) {
      showError("OpenSCAD code cannot be empty.");
      return;
    }

    setIsLoading(true);
    const loadingToastId = showLoading("Converting to STL...");

    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      console.log("Rendering SCAD code:", scadCode);
      const stlData: Uint8Array = renderScad(scadCode);
      console.log(`STL Data generated, size: ${stlData.length} bytes`);
      
      if (stlData.length === 0) {
        throw new Error("Generated STL is empty. Your OpenSCAD code might not produce any geometry or might contain errors not caught by the WASM wrapper.");
      }

      const blob = new Blob([stlData], { type: 'application/vnd.ms-pki.stl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'model.stl';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      dismissToast(loadingToastId);
      showSuccess("Conversion Successful! STL file download started.");
    } catch (e: any) {
      console.error("Failed to convert SCAD to STL:", e);
      dismissToast(loadingToastId);
      let errorMessage = "Conversion failed. Check your OpenSCAD code and the browser console for details.";
      if (e.message) {
        errorMessage = `Conversion error: ${e.message}`;
      }
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [scadCode, isWasmInitialized]);

  return (
    <div className="space-y-6 w-full">
      <Textarea
        placeholder="Enter OpenSCAD code here..."
        value={scadCode}
        onChange={(e) => setScadCode(e.target.value)}
        rows={20}
        className="font-mono text-sm bg-gray-50 dark:bg-gray-800 shadow-sm"
        disabled={!isWasmInitialized || isLoading}
      />
      <Button
        onClick={handleConvert}
        disabled={!isWasmInitialized || isLoading}
        className="w-full py-3 text-lg"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Download className="mr-2 h-5 w-5" />
        )}
        {isLoading ? 'Converting...' : (isWasmInitialized ? 'Convert to STL' : 'Initializing Engine...')}
      </Button>
      {initError && (
        <p className="text-red-500 text-sm text-center p-2 bg-red-100 dark:bg-red-900 rounded-md">{initError}</p>
      )}
      {!isWasmInitialized && !initError && (
         <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
           <Loader2 className="mr-2 h-5 w-5 animate-spin" />
           <span>Initializing OpenSCAD engine, please wait...</span>
         </div>
      )}
       <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>Note: Complex OpenSCAD scripts may take time to process or might not be fully supported. Error reporting from WASM can be limited.</p>
        <p>Powered by <a href="https://github.com/DSchroer/openscad-wasm" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">openscad-wasm-prebuilt</a>.</p>
      </div>
    </div>
  );
};

export default ScadToStlConverter;