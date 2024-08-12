import React, { useRef, useEffect, useState, useCallback } from "react";
import { DrawingMode, CanvasObject, Point, DrawingObject } from "../types";
import DrawingUtils from "../utils/drawingUtils";

interface CanvasProps {
  drawingMode: DrawingMode;
  globalColor: string;
  objects: CanvasObject[];
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
  selectedObjects: CanvasObject[];
  setSelectedObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
}

const Canvas: React.FC<CanvasProps> = ({ drawingMode, globalColor, objects, setObjects, selectedObjects, setSelectedObjects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);

  const redrawCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      objects.forEach((obj) => DrawingUtils.drawObject(ctx, obj));

      ctx.strokeStyle = "blue";
      ctx.lineWidth = 4;
      selectedObjects.forEach((obj) => DrawingUtils.drawObject(ctx, obj));

      ctx.strokeStyle = globalColor;
      ctx.lineWidth = 3;
    }
  }, [objects, selectedObjects, globalColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 1;
      canvas.height = window.innerHeight * 0.9;
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

  const handleObjectInteraction = (clickedObject: CanvasObject | undefined, point: Point) => {
    if (clickedObject) {
      switch (drawingMode) {
        case "delete":
          setObjects(objects.filter((obj) => obj !== clickedObject));
          setSelectedObjects(selectedObjects.filter((obj) => obj !== clickedObject));
          break;
        case "copy": {
          const newObject = { ...clickedObject, id: crypto.randomUUID() };
          setObjects([...objects, newObject]);
          break;
        }
        case "move":
          setSelectedObjects([clickedObject]);
          setIsMoving(true);
          setStartPoint(point);
          break;
        case "group":
          setSelectedObjects((prev) => (prev.includes(clickedObject) ? prev.filter((obj) => obj !== clickedObject) : [...prev, clickedObject]));
          break;
        case "ungroup":
          if (clickedObject.type === "group") {
            setObjects((prev) => [...prev.filter((obj) => obj !== clickedObject), ...clickedObject.objects]);
            setSelectedObjects(selectedObjects.filter((obj) => obj !== clickedObject));
          }
          break;
      }
    } else if (drawingMode !== "freehand" && drawingMode !== "line" && drawingMode !== "rectangle" && drawingMode !== "ellipse" && drawingMode !== "circle" && drawingMode !== "polygon") {
      setSelectedObjects([]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    setStartPoint(point);

    switch (drawingMode) {
      case "polygon":
        setPolygonPoints([...polygonPoints, point]);
        break;

      case "move": {
        const clickedObject = objects.find((obj) => DrawingUtils.isPointInObject(point, obj));
        if (clickedObject) {
          setSelectedObjects([clickedObject]);
          setIsMoving(true);
          setStartPoint(point);
        } else {
          setSelectedObjects([]);
          setIsMoving(false);
        }
        break;
      }

      case "delete":
      case "copy":
      case "group":
      case "ungroup": {
        const clickedObject = objects.find((obj) => DrawingUtils.isPointInObject(point, obj));
        handleObjectInteraction(clickedObject, point);
        break;
      }

      default:
        setIsDrawing(true);
        setCurrentPath([point]);
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentPoint: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    if (isMoving && drawingMode === "move" && startPoint) {
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;
      setObjects((prevObjects) =>
        prevObjects.map((obj) => {
          if (selectedObjects.some((selectedObj) => selectedObj.id === obj.id)) {
            if (obj.type === "group") {
              return {
                ...obj,
                objects: obj.objects.map((groupObj) => ({
                  ...groupObj,
                  points: (groupObj as DrawingObject).points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
                })),
              };
            } else {
              return {
                ...obj,
                points: (obj as DrawingObject).points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
              };
            }
          }
          return obj;
        })
      );

      setStartPoint(currentPoint);
      redrawCanvas();
      return;
    }

    if (!isDrawing && drawingMode !== "polygon") return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    redrawCanvas();
    ctx.beginPath();

    switch (drawingMode) {
      case "freehand":
        if (!startPoint) return;
        setCurrentPath((prevPath) => [...prevPath, currentPoint]);
        ctx.moveTo(startPoint.x, startPoint.y);
        currentPath.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;

      case "line":
        if (!startPoint) return;
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;

      case "rectangle":
        if (!startPoint) return;
        ctx.rect(startPoint.x, startPoint.y, currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);
        break;

      case "ellipse": {
        if (!startPoint) return;
        const radiusX = Math.abs(currentPoint.x - startPoint.x) / 2;
        const radiusY = Math.abs(currentPoint.y - startPoint.y) / 2;
        const centerX = startPoint.x + (currentPoint.x - startPoint.x) / 2;
        const centerY = startPoint.y + (currentPoint.y - startPoint.y) / 2;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        break;
      }

      case "circle": {
        if (!startPoint) return;
        const radius = Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        break;
      }

      case "polygon":
        ctx.moveTo(polygonPoints[0]?.x, polygonPoints[0]?.y);
        polygonPoints.forEach((point, index) => {
          if (index > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
    }

    ctx.stroke();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMoving) {
      setIsMoving(false);
      return;
    }

    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    const endPoint: Point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    let newObject: DrawingObject | null = null;

    switch (drawingMode) {
      case "freehand":
        newObject = DrawingUtils.createObject("freehand", globalColor, currentPath);
        break;
      case "line":
        newObject = DrawingUtils.createObject("line", globalColor, [startPoint, endPoint]);
        break;
      case "rectangle":
        newObject = DrawingUtils.createObject("rectangle", globalColor, [startPoint, endPoint]);
        break;
      case "ellipse":
        newObject = DrawingUtils.createObject("ellipse", globalColor, [startPoint, endPoint]);
        break;
      case "circle":
        newObject = DrawingUtils.createObject("circle", globalColor, [startPoint, endPoint]);
        break;
    }

    if (newObject) {
      setObjects((prevObjects) => [...prevObjects, newObject!]);
    }

    setCurrentPath([]);
    setStartPoint(null);
  };

  const handleDoubleClick = () => {
    if (drawingMode === "polygon" && polygonPoints.length > 2) {
      const newObject = DrawingUtils.createObject("polygon", globalColor, polygonPoints);
      setObjects((prevObjects) => [...prevObjects, newObject]);
      setPolygonPoints([]);
    }
  };

  return <canvas ref={canvasRef} className="border border-gray-300 bg-white" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick} />;
};

export default Canvas;
