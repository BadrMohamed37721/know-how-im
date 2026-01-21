import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageFile: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropImage = async () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imageRef.current;
      const container = containerRef.current;
      
      // The "viewfinder" is a 300x300 circle in the center of the container
      const viewfinderSize = 300;
      canvas.width = viewfinderSize;
      canvas.height = viewfinderSize;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the transform-aware position
      // We want to draw the part of the image that is currently behind the viewfinder
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Draw the image onto the canvas based on its current visual state
      // This is simpler: we just map the visual representation to the canvas
      const displayedWidth = img.width * scale;
      const displayedHeight = img.height * scale;
      
      const drawX = (centerX - viewfinderSize / 2) - (centerX + position.x - displayedWidth / 2);
      const drawY = (centerY - viewfinderSize / 2) - (centerY + position.y - displayedHeight / 2);

      // Create a temporary canvas to draw the scaled image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = displayedWidth;
      tempCanvas.height = displayedHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.drawImage(img, 0, 0, displayedWidth, displayedHeight);

      // Now draw the relevant part of the scaled image onto the final canvas
      ctx.drawImage(
        tempCanvas,
        drawX, drawY, viewfinderSize, viewfinderSize,
        0, 0, viewfinderSize, viewfinderSize
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
          onCropComplete(file);
        }
        setIsProcessing(false);
      }, "image/jpeg", 0.9);
    } catch (error) {
      console.error("Crop error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-display flex items-center gap-2">
          <Move className="w-5 h-5 text-primary" />
          Adjust Your Photo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        {/* Cropping Area */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden cursor-move touch-none flex items-center justify-center border-4 border-muted"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Viewfinder Circle Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <div className="w-[300px] h-[300px] rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
          </div>

          <img
            ref={imageRef}
            src={imageSrc}
            alt="Adjust"
            draggable={false}
            className="max-w-none transition-transform duration-75 ease-out select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-2">
            <ZoomOut className="w-5 h-5 text-muted-foreground" />
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <ZoomIn className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleCropImage} disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Photo
              </Button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
