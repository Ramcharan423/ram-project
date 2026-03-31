import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebcamCaptureProps {
  onCapture: (video: HTMLVideoElement) => void;
  isProcessing?: boolean;
  captureLabel?: string;
  showOverlay?: boolean;
}

export default function WebcamCapture({ onCapture, isProcessing, captureLabel = 'Capture Face', showOverlay = true }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current) {
      onCapture(videoRef.current);
    }
  }, [onCapture]);

  if (error) {
    return (
      <div className="webcam-frame aspect-[4/3] flex items-center justify-center bg-muted">
        <div className="text-center p-6">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={startCamera} className="mt-4" size="sm">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="webcam-frame relative aspect-[4/3] bg-foreground/5">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-xl"
        />
        {showOverlay && (
          <div className="face-overlay pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-56 border-2 border-dashed border-primary/40 rounded-[40%]" />
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center pulse-ring">
                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
              </div>
              <p className="text-sm font-medium text-primary-foreground">Analyzing face...</p>
            </div>
          </div>
        )}
      </div>
      <Button
        onClick={handleCapture}
        disabled={isProcessing}
        className="w-full gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 transition-opacity"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            {captureLabel}
          </>
        )}
      </Button>
    </div>
  );
}
