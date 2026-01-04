
import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, Eye, Info, CheckCircle, AlertCircle, Ruler, Zap, Target, Divide } from 'lucide-react';
import { ScanStatus, IPDResult } from './types';
import { analyzeIPD } from './services/geminiService';

const Header = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <Eye size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">VisionMetric</span>
      </div>
      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
        Geometric Averaging Method
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="mt-12 py-8 px-4 border-t border-slate-200 text-center text-slate-500 text-sm">
    <p>© 2026 VisionMetric. Clinical Dual-Referenced IPD Analysis.</p>
  </footer>
);

export default function App() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<IPDResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setStatus('capturing');
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please check permissions.");
      setStatus('idle');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
        processImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        processImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (dataUrl: string) => {
    try {
      setStatus('analyzing');
      const base64 = dataUrl.split(',')[1];
      const analysis = await analyzeIPD(base64);
      setResult(analysis);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setError("Geometric resolution failed. Ensure iris borders and pupils are clearly defined.");
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setCapturedImage(null);
    setError(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Clinical IPD Averaging</h1>
          <p className="text-slate-600 max-w-lg mx-auto">Calculating mean value from dual benchmarks: Limbus-to-Limbus and Pupil-to-Pupil Euclidean distances.</p>
        </div>

        {status === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button 
              onClick={startCamera}
              className="flex flex-col items-center justify-center p-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl transition-all shadow-xl hover:shadow-indigo-200 group"
            >
              <Camera size={48} className="mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold">Live anatomical scan</span>
              <span className="text-indigo-100 text-sm mt-1">Real-time landmark detection</span>
            </button>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-700 rounded-3xl transition-all group h-full">
                <Upload size={48} className="mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-lg font-semibold">Upload Photo</span>
                <span className="text-slate-500 text-sm mt-1">Process existing image</span>
              </div>
            </div>
          </div>
        )}

        {status === 'capturing' && (
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500 scanner-line opacity-50"></div>
              <div className="absolute inset-0 border-[80px] border-black/40 pointer-events-none flex items-center justify-center">
                 <div className="w-56 h-72 border-2 border-indigo-400/50 rounded-[4rem]"></div>
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={reset} className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button onClick={captureFrame} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700">Capture</button>
            </div>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="max-w-md mx-auto text-center py-24">
            <div className="relative inline-block mb-8">
              <RefreshCw size={72} className="text-indigo-600 animate-spin" />
              <Divide className="absolute inset-0 m-auto text-indigo-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Averaging Measurements</h2>
            <p className="text-slate-500 mt-3">Synthesizing Limbus and Pupil datasets with Euclidean factor scaling...</p>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Image Preview with Markers */}
            <div className="lg:col-span-5 relative aspect-square bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src={capturedImage!} alt="Scan" className="w-full h-full object-cover opacity-90" />
              
              {/* Limbus Points */}
              <div className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full bg-emerald-500" style={{ left: `${result.rightOuterLimbus[0]/10}%`, top: `${result.rightOuterLimbus[1]/10}%` }}></div>
              <div className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full bg-emerald-500" style={{ left: `${result.leftInnerLimbus[0]/10}%`, top: `${result.leftInnerLimbus[1]/10}%` }}></div>
              
              {/* Pupil Points */}
              <div className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full bg-indigo-400" style={{ left: `${result.rightPupilCenter[0]/10}%`, top: `${result.rightPupilCenter[1]/10}%` }}></div>
              <div className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full bg-indigo-400" style={{ left: `${result.leftPupilCenter[0]/10}%`, top: `${result.leftPupilCenter[1]/10}%` }}></div>

              {/* Measurement Lines (Simplified visual) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line 
                  x1={`${result.rightOuterLimbus[0]/10}%`} y1={`${result.rightOuterLimbus[1]/10}%`} 
                  x2={`${result.leftInnerLimbus[0]/10}%`} y2={`${result.leftInnerLimbus[1]/10}%`} 
                  stroke="white" strokeWidth="2" strokeDasharray="4 2"
                />
                <line 
                  x1={`${result.rightPupilCenter[0]/10}%`} y1={`${result.rightPupilCenter[1]/10}%`} 
                  x2={`${result.leftPupilCenter[0]/10}%`} y2={`${result.leftPupilCenter[1]/10}%`} 
                  stroke="#818cf8" strokeWidth="2"
                />
              </svg>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Final Averaged Result</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4 uppercase text-xs tracking-widest">
                  <Ruler size={16} /> IPD Measurement
                </div>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{result.ipdMm.toFixed(1)}</span>
                  <span className="text-3xl font-bold text-slate-300">mm</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Target size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Limbus Distance</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{result.limbusDistanceMm.toFixed(2)}<span className="text-sm font-medium ml-1">mm</span></div>
                    <p className="text-[10px] text-slate-400 mt-1">Right Outer to Left Inner</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Pupil Distance</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{result.pupilDistanceMm.toFixed(2)}<span className="text-sm font-medium ml-1">mm</span></div>
                    <p className="text-[10px] text-slate-400 mt-1">Center to Center</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[3rem] text-slate-300 shadow-xl">
                <div className="flex gap-4">
                  <Info size={24} className="text-indigo-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold mb-2">Geometric Breakdown</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{result.explanation}</p>
                    <div className="mt-6 flex flex-wrap gap-4 text-[11px] font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Scaled: {result.scalingFactor.toFixed(5)} mm/px</div>
                        <div className="flex items-center gap-1.5"><Divide size={14} className="text-indigo-400" /> Mean Calculation Applied</div>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={reset} className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group">
                <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /> New Measurement
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-100 p-10 rounded-[3rem] text-center">
            <AlertCircle size={56} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-900">Marker Misalignment</h2>
            <p className="text-red-700 mt-3 mb-8">{error}</p>
            <button onClick={reset} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors">Restart Scan</button>
          </div>
        )}

        {status === 'idle' && (
          <div className="mt-20 max-w-4xl mx-auto border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Divide size={24} />
              </div>
              Calculation Methodology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="font-bold text-slate-800 mb-2">1. Limbus Scale</div>
                <p className="text-slate-500 text-sm">We measure Right Outer Limbus to Left Inner Limbus, a robust anatomical proxy often used in clinical manual measurements.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="font-bold text-slate-800 mb-2">2. Pupil Center</div>
                <p className="text-slate-500 text-sm">Direct Euclidean distance between the centers of both pupils, calculated using coordinate geometry from facial landmarks.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="font-bold text-slate-800 mb-2">3. Mean IPD</div>
                <p className="text-slate-500 text-sm">By averaging both datasets, we minimize perspective distortion and detection variance, yielding a high-confidence final result.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
