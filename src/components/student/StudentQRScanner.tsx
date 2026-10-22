import React, { useState, useEffect, useRef } from 'react';
import { store } from '../../services/store';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, X, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceStatus } from '../../types/academic';

interface StudentQRScannerProps {
  studentId: string;
  onClose: () => void;
  onScanSuccess?: () => void;
}

export const StudentQRScanner: React.FC<StudentQRScannerProps> = ({
  studentId,
  onClose,
  onScanSuccess,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status?: AttendanceStatus;
    message: string;
    courseName?: string;
    weekNumber?: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start real camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Tu navegador no soporta acceso a la cámara en este entorno.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('No se pudo acceder a la cámara (permiso denegado o dispositivo sin cámara). Puedes ingresar el código o utilizar la sesión activa.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Validate scanned QR code through the store
  const handleValidateCode = (codeToTest: string) => {
    if (!codeToTest || isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = store.scanQRCode(studentId, codeToTest.trim());
      setIsProcessing(false);
      setScanResult(res);

      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
        });
        if (onScanSuccess) onScanSuccess();
      }
    }, 600);
  };

  // Helper to grab the active session's current token for instant testing
  const activeSessionWithToken = store.attendanceSessions.find(
    (s) => s.estado === 'en_curso' && s.codigo_qr_actual
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-xs">
              UCV
            </div>
            <div>
              <h3 className="font-extrabold text-base">Escanear Asistencia QR</h3>
              <p className="text-[11px] text-blue-200">AsisQR Institucional • Validación en Servidor</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Result Banner if already processed */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-start gap-3 ${
                scanResult.success
                  ? scanResult.status === 'presente'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : scanResult.status === 'tardanza'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {scanResult.success
                    ? `Registro Exitoso: ${scanResult.status?.toUpperCase()}`
                    : 'Registro Rechazado'}
                </div>
                <p className="text-xs opacity-90 leading-relaxed">{scanResult.message}</p>
                {scanResult.courseName && (
                  <div className="text-[11px] font-mono text-slate-700 bg-white/60 p-2 rounded-lg mt-2">
                    Curso: {scanResult.courseName} | Semana {scanResult.weekNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Camera Viewport */}
          <div className="relative aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-xs max-w-xs">{cameraError || 'Cámara desactivada'}</p>
                <button
                  onClick={startCamera}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                >
                  Intentar reconectar
                </button>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-red-500/80 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-red-600" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-red-600" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-red-600" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-red-600" />

                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50 animate-pulse" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-xs">
                Enfoca el código QR de la pantalla del profesor
              </span>
            </div>
          </div>

          {/* Instant Demo Scanner (One-click) */}
          {activeSessionWithToken && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>Sesión activa detectada en el aula</span>
                </div>
                <p className="text-[11px] text-blue-800/80">
                  Código temporal activo listo para registrar en 1 clic:
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleValidateCode(activeSessionWithToken.codigo_qr_actual || '')}
                disabled={isProcessing}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Validando...' : 'Escanear QR Activo'}
              </button>
            </div>
          )}

          {/* Manual Token / Code Entry */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              O ingresa el código QR de la pantalla manualmente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Pega el token o código dinámico..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleValidateCode(manualCode)}
                disabled={!manualCode || isProcessing}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Validar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
            <span>Verificación criptográfica y tolerancia por sesión</span>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
          >
            Cerrar escáner
          </button>
        </div>
      </div>
    </div>
  );
};
