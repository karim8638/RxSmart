import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Scan, Flashlight, FlashlightOff, RotateCcw, CheckCircle } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (barcode: string, medicineData?: any) => void;
}

interface MedicineData {
  name: string;
  batch_no: string;
  expiry_date: string;
  manufacturer?: string;
  category?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [medicineData, setMedicineData] = useState<MedicineData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock medicine database for demo
  const medicineDatabase: Record<string, MedicineData> = {
    '1234567890123': {
      name: 'Paracetamol 500mg',
      batch_no: 'PCM2024001',
      expiry_date: '2025-12-31',
      manufacturer: 'PharmaCorp',
      category: 'Pain Relief',
    },
    '9876543210987': {
      name: 'Amoxicillin 250mg',
      batch_no: 'AMX2024002',
      expiry_date: '2025-06-30',
      manufacturer: 'MediLab',
      category: 'Antibiotics',
    },
    '5555666677778': {
      name: 'Ibuprofen 400mg',
      batch_no: 'IBU2024003',
      expiry_date: '2024-03-15',
      manufacturer: 'HealthCare Inc',
      category: 'Pain Relief',
    },
  };

  useEffect(() => {
    if (isOpen) {
      requestCameraPermission();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
    }
  };

  const startBarcodeDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Simulate barcode detection (in real app, use a library like ZXing or QuaggaJS)
          const mockBarcode = simulateBarcodeDetection();
          if (mockBarcode) {
            handleBarcodeDetected(mockBarcode);
          }
        }
      }
    }, 500);
  };

  const simulateBarcodeDetection = (): string | null => {
    // Simulate random barcode detection for demo
    const barcodes = Object.keys(medicineDatabase);
    if (Math.random() > 0.95) { // 5% chance of detection per scan
      return barcodes[Math.floor(Math.random() * barcodes.length)];
    }
    return null;
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (scanResult === barcode) return; // Avoid duplicate scans
    
    setScanResult(barcode);
    setLoading(true);
    
    // Stop scanning temporarily
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    try {
      // Look up medicine data
      const data = medicineDatabase[barcode];
      if (data) {
        setMedicineData(data);
        
        // Auto-close after 2 seconds and return data
        setTimeout(() => {
          onScanResult(barcode, data);
          onClose();
        }, 2000);
      } else {
        // Unknown barcode - still return it
        setTimeout(() => {
          onScanResult(barcode);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanResult(null);
    setMedicineData(null);
    setFlashlightOn(false);
  };

  const toggleFlashlight = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn }],
          });
          setFlashlightOn(!flashlightOn);
        } catch (error) {
          console.error('Flashlight not supported:', error);
        }
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    stopScanning();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const handleManualInput = () => {
    const barcode = prompt('Enter barcode manually:');
    if (barcode) {
      handleBarcodeDetected(barcode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Scan className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Barcode Scanner</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="relative">
          {hasPermission === null && (
            <div className="p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Requesting camera permission...</p>
            </div>
          )}

          {hasPermission === false && (
            <div className="p-8 text-center">
              <Camera className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Denied</h3>
              <p className="text-gray-600 mb-4">
                Please allow camera access to scan barcodes. You can also enter the barcode manually.
              </p>
              <button
                onClick={handleManualInput}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enter Manually
              </button>
            </div>
          )}

          {hasPermission === true && (
            <div className="relative">
              {/* Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover bg-black"
              />
              
              {/* Hidden canvas for barcode detection */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              {isScanning && !scanResult && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning Frame */}
                    <div className="w-48 h-32 border-2 border-white border-opacity-50 relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="w-full h-0.5 bg-blue-500 animate-pulse"></div>
                      </div>
                    </div>
                    
                    <p className="text-white text-center mt-4 bg-black bg-opacity-50 px-3 py-1 rounded">
                      Position barcode within the frame
                    </p>
                  </div>
                </div>
              )}

              {/* Scan Result */}
              {scanResult && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="bg-white rounded-xl p-6 mx-4 text-center max-w-sm">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Barcode Detected!</h3>
                    <p className="text-gray-600 mb-4 font-mono text-sm">{scanResult}</p>
                    
                    {medicineData ? (
                      <div className="space-y-2 text-left">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="font-semibold text-blue-900">{medicineData.name}</p>
                          <p className="text-sm text-blue-700">Batch: {medicineData.batch_no}</p>
                          <p className="text-sm text-blue-700">Expires: {medicineData.expiry_date}</p>
                          {medicineData.manufacturer && (
                            <p className="text-sm text-blue-700">Mfg: {medicineData.manufacturer}</p>
                          )}
                        </div>
                        <p className="text-green-600 text-sm font-medium">✓ Auto-filling form...</p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          Medicine not found in database. You can add details manually.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Camera Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button
                  onClick={toggleFlashlight}
                  className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  {flashlightOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={switchCamera}
                  className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Point your camera at a medicine barcode to scan
            </p>
            <button
              onClick={handleManualInput}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              Or enter barcode manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;