import { useState } from "react";
import ReactImageCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageFile: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [scale, setScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropImage = async () => {
    setIsProcessing(true);
    try {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const pixelRatio = window.devicePixelRatio || 1;

        const cropX = (crop.x || 0) * image.width / 100;
        const cropY = (crop.y || 0) * image.height / 100;
        const cropWidth = (crop.width || 100) * image.width / 100;
        const cropHeight = (crop.height || 100) * image.height / 100;

        canvas.width = cropWidth * pixelRatio * scale;
        canvas.height = cropHeight * pixelRatio * scale;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
              onCropComplete(file);
            }
            setIsProcessing(false);
          }, "image/jpeg", 0.95);
        }
      };
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
        <div className="border rounded-lg overflow-hidden bg-muted">
          <ReactImageCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1}
            circularCrop
          >
            <img 
              src={imageSrc} 
              style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
              className="w-full"
              alt="Crop preview"
            />
          </ReactImageCrop>
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
            Use the slider to zoom in/out. Drag to adjust the crop area.
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
      </CardContent>
    </Card>
  );
}
