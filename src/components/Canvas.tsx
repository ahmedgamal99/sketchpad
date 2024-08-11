import React, { useRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DrawingMode, DrawingObject, Group, Point, CanvasObject } from "../types";
import { drawObject, isPointInObject } from "../utils/drawingUtils";

interface CanvasProps {
  drawingMode: DrawingMode;
  globalColor: string;
  objects: CanvasObject[];
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
}

const Canvas: React.FC<CanvasProps> = ({ drawingMode, globalColor, objects, setObjects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<CanvasObject[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.8;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = globalColor;
        ctx.lineWidth = 2;
        ctxRef.current = ctx;
      }
    }
  }, [globalColor]);

  useEffect(() => {
    redrawCanvas();
  }, [objects, selectedObjects]);

  const redrawCanvas = () => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      objects.forEach((obj) => drawObject(ctx, obj));

      // Highlight selected objects
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      selectedObjects.forEach((obj) => drawObject(ctx, obj));

      // Reset to global color
      ctx.strokeStyle = globalColor;
      ctx.lineWidth = 2;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    if (drawingMode === "polygon") {
      setPolygonPoints([...polygonPoints, point]);
    } else if (drawingMode === "move" || drawingMode === "delete" || drawingMode === "copy") {
      const clickedObject = objects.find((obj) => isPointInObject(point, obj));
      if (clickedObject) {
        if (drawingMode === "delete") {
          setObjects(objects.filter((obj) => obj !== clickedObject));
        } else if (drawingMode === "copy") {
          const newObject = JSON.parse(JSON.stringify(clickedObject));
          newObject.id = uuidv4();
          setObjects([...objects, newObject]);
        } else {
          setSelectedObjects([clickedObject]);
        }
      } else {
        setSelectedObjects([]);
      }
    } else if (drawingMode === "group") {
      const clickedObject = objects.find((obj) => isPointInObject(point, obj));
      if (clickedObject) {
        setSelectedObjects([...selectedObjects, clickedObject]);
      }
    } else {
      setIsDrawing(true);
      setStartPoint(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    if (ctx && startPoint) {
      const currentPoint: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

      redrawCanvas();
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);

      switch (drawingMode) {
        case "freehand":
          ctx.lineTo(currentPoint.x, currentPoint.y);
          break;
        case "line":
          ctx.lineTo(currentPoint.x, currentPoint.y);
          break;
        case "rectangle":
          ctx.rect(startPoint.x, startPoint.y, currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);
          break;
        case "ellipse":
          const radiusX = Math.abs(currentPoint.x - startPoint.x) / 2;
          const radiusY = Math.abs(currentPoint.y - startPoint.y) / 2;
          ctx.ellipse(startPoint.x + (currentPoint.x - startPoint.x) / 2, startPoint.y + (currentPoint.y - startPoint.y) / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
          break;
        case "circle":
          const radius = Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2));
          ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
          break;
      }

      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);
    const endPoint: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    const newObject: DrawingObject = {
      id: uuidv4(),
      type: drawingMode,
      color: globalColor,
      points: [startPoint, endPoint],
    };

    setObjects([...objects, newObject]);
    setStartPoint(null);
  };

  const handleDoubleClick = () => {
    if (drawingMode === "polygon" && polygonPoints.length > 2) {
      const newObject: DrawingObject = {
        id: uuidv4(),
        type: "polygon",
        color: globalColor,
        points: polygonPoints,
      };
      setObjects([...objects, newObject]);
      setPolygonPoints([]);
    }
  };

  return <canvas ref={canvasRef} className="border border-gray-300 bg-white" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick} />;
};

export default Canvas;
