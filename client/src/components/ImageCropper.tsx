import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageFile: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropImage = async () => {
    setIsProcessing(true);
    try {
      if (!imageRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imageRef.current;
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      canvas.width = size * scale;
      canvas.height = size * scale;

      ctx.drawImage(img, x, y, size, size, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
          onCropComplete(file);
        }
        setIsProcessing(false);
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Error cropping image:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crop & Scale Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <img
            ref={imageRef}
            src={imageSrc}
            style={{
              maxWidth: "400px",
              maxHeight: "400px",
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
            alt="Crop preview"
            onLoad={() => {
              // Reset on load
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Scale: {Math.round(scale * 100)}%</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Use the slider to zoom in/out before cropping.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleCropImage} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : ""}
            Apply Crop
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
