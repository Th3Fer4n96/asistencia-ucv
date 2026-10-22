import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  subtitle?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 280,
  className = '',
  subtitle,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // high DPI
      margin: 2,
      color: {
        dark: '#002F6C', // Institutional UCV Navy Blue
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setDataUrl(url);
        setError(null);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        setError('Error al generar código QR.');
      });
  }, [value, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative p-4 bg-white rounded-2xl shadow-xl border border-slate-200 ring-4 ring-blue-50/50">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Código QR de Asistencia UCV"
            width={size}
            height={size}
            className="rounded-lg transition-transform duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 rounded-lg animate-pulse"
          >
            <span className="text-xs text-slate-400 font-mono">Generando QR...</span>
          </div>
        )}

        {/* Institutional UCV Center Seal */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 bg-white/95 rounded-full shadow-md border-2 border-red-600 flex items-center justify-center backdrop-blur-xs">
            <span className="text-[11px] font-black text-red-600 tracking-tighter">UCV</span>
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="mt-3 text-xs text-slate-500 font-medium text-center max-w-xs">{subtitle}</p>
      )}
    </div>
  );
};
