import { useCallback, useEffect, useState } from 'react';

export type CameraPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export function useCameraPosition(initialPosition: CameraPosition = 'bottom-left') {
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const handleCameraDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleCameraDrag = useCallback(
    (e: React.MouseEvent, containerRef: HTMLDivElement | null) => {
      if (!isDragging || !containerRef) return;

      const container = containerRef.getBoundingClientRect();
      const centerX = container.width / 2;
      const centerY = container.height / 2;
      const mouseX = e.clientX - container.left;
      const mouseY = e.clientY - container.top;

      let newPosition: CameraPosition;

      if (mouseX < centerX && mouseY < centerY) {
        newPosition = 'top-left';
      } else if (mouseX >= centerX && mouseY < centerY) {
        newPosition = 'top-right';
      } else if (mouseX < centerX && mouseY >= centerY) {
        newPosition = 'bottom-left';
      } else {
        newPosition = 'bottom-right';
      }

      setCameraPosition(newPosition);
    },
    [isDragging]
  );

  const handleCameraDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const getCameraPositionClasses = useCallback(() => {
    switch (cameraPosition) {
      case 'top-left':
        return 'top-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-right':
        return 'bottom-6 right-6';
      default:
        return 'bottom-6 left-6';
    }
  }, [cameraPosition]);

  const getCameraCanvasPosition = useCallback(() => {
    const cameraWidth = 320;
    const cameraHeight = 240;
    const padding = 24;
    const canvasWidth = 1920;
    const canvasHeight = 1080;

    switch (cameraPosition) {
      case 'top-left':
        return { x: padding, y: padding };
      case 'top-right':
        return { x: canvasWidth - cameraWidth - padding, y: padding };
      case 'bottom-left':
        return { x: padding, y: canvasHeight - cameraHeight - padding };
      case 'bottom-right':
        return { x: canvasWidth - cameraWidth - padding, y: canvasHeight - cameraHeight - padding };
      default:
        return { x: padding, y: canvasHeight - cameraHeight - padding };
    }
  }, [cameraPosition]);

  return {
    cameraPosition,
    isDragging,
    handleCameraDragStart,
    handleCameraDrag,
    handleCameraDragEnd,
    getCameraPositionClasses,
    getCameraCanvasPosition,
  };
}