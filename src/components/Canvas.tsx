import React, { useRef, useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { DrawingMode, DrawingObject, Point, CanvasObject, Group } from "../types";
import { drawObject, isPointInObject } from "../utils/drawingUtils";

interface CanvasProps {
  drawingMode: DrawingMode;
  globalColor: string;
  objects: CanvasObject[];
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
  groupObjects: (objectsToGroup: CanvasObject[]) => void;
  ungroupObjects: (group: Group) => void;
}

const Canvas: React.FC<CanvasProps> = ({ drawingMode, globalColor, objects, setObjects, groupObjects, ungroupObjects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<CanvasObject[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);

  const redrawCanvas = useCallback(() => {
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
  }, [objects, selectedObjects, globalColor]);

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
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    setStartPoint(point);

    switch (drawingMode) {
      case "polygon":
        setPolygonPoints([...polygonPoints, point]);
        break;

      case "move":
      case "delete":
      case "copy": {
        const clickedObject = objects.find((obj) => isPointInObject(point, obj));
        if (clickedObject) {
          switch (drawingMode) {
            case "delete":
              setObjects(objects.filter((obj) => obj !== clickedObject));
              break;

            case "copy":
              const newObject = { ...clickedObject, id: uuidv4() };
              setObjects([...objects, newObject]);
              break;

            case "move":
              setSelectedObjects([clickedObject]);
              break;
          }
        } else {
          setSelectedObjects([]);
        }
        break;
      }

      case "group": {
        const clickedObject = objects.find((obj) => isPointInObject(point, obj));
        if (clickedObject) {
          setSelectedObjects((prevSelected) => {
            const newSelected = prevSelected.includes(clickedObject) ? prevSelected.filter((obj) => obj !== clickedObject) : [...prevSelected, clickedObject];
            return newSelected;
          });
        }
        break;
      }

      case "ungroup": {
        const clickedGroup = objects.find((obj) => "objects" in obj && isPointInObject(point, obj)) as Group | undefined;
        if (clickedGroup) {
          ungroupObjects(clickedGroup);
        }
        break;
      }

      default:
        setIsDrawing(true);
        setCurrentPath([point]);
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const currentPoint: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    setEndPoint(currentPoint);

    redrawCanvas();
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);

    switch (drawingMode) {
      case "freehand":
        setCurrentPath((prevPath) => [...prevPath, currentPoint]);
        currentPath.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;

      case "line":
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;

      case "rectangle":
        ctx.rect(startPoint.x, startPoint.y, currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);
        break;

      case "ellipse": {
        const radiusX = Math.abs(currentPoint.x - startPoint.x) / 2;
        const radiusY = Math.abs(currentPoint.y - startPoint.y) / 2;
        const centerX = startPoint.x + radiusX;
        const centerY = startPoint.y + radiusY;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        break;
      }

      case "circle": {
        const radius = Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2));
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        break;
      }
    }

    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !endPoint) return;
    setIsDrawing(false);

    let newObject: DrawingObject;

    switch (drawingMode) {
      case "freehand":
        newObject = {
          id: uuidv4(),
          type: "freehand",
          color: globalColor,
          points: currentPath,
        };
        break;

      case "line":
        newObject = {
          id: uuidv4(),
          type: "line",
          color: globalColor,
          points: [startPoint, endPoint],
        };
        break;

      case "rectangle":
        newObject = {
          id: uuidv4(),
          type: "rectangle",
          color: globalColor,
          points: [startPoint, endPoint],
        };
        break;

      case "ellipse":
      case "circle":
        newObject = {
          id: uuidv4(),
          type: drawingMode,
          color: globalColor,
          points: [startPoint, endPoint],
        };
        break;

      default:
        return; // Don't create an object for unsupported modes
    }

    setObjects((prevObjects) => [...prevObjects, newObject]);
    setCurrentPath([]);
    setStartPoint(null);
    setEndPoint(null);
  };

  const handleDoubleClick = () => {
    if (drawingMode === "polygon" && polygonPoints.length > 2) {
      const newObject: DrawingObject = {
        id: uuidv4(),
        type: "polygon",
        color: globalColor,
        points: polygonPoints,
      };
      setObjects((prevObjects) => [...prevObjects, newObject]);
      setPolygonPoints([]);
    }
  };

  const handleGroupCommand = () => {
    if (selectedObjects.length > 1) {
      groupObjects(selectedObjects);
      setSelectedObjects([]);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="border border-gray-300 bg-white" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick} />
      {drawingMode === "group" && selectedObjects.length > 1 && <button onClick={handleGroupCommand}>Group Selected Objects</button>}
    </>
  );
};

export default Canvas;
