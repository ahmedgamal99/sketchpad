import { CanvasObject, DrawingObject, Point, Group } from "../types";

// Helper function to set stroke color and initialize path
const initializeDrawing = (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
  ctx.strokeStyle = obj.color;
  ctx.beginPath();
};

// Drawing functions for each shape
const drawShapes = {
  freehand: (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    ctx.moveTo(obj.points[0].x, obj.points[0].y);
    obj.points.forEach((point) => ctx.lineTo(point.x, point.y));
  },
  line: (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    ctx.moveTo(obj.points[0].x, obj.points[0].y);
    ctx.lineTo(obj.points[1].x, obj.points[1].y);
  },
  rectangle: (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    const [start, end] = obj.points;
    ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
  },
  ellipse: (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    const [start, end] = obj.points;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    const centerX = start.x + radiusX;
    const centerY = start.y + radiusY;
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  },
  circle: (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    const [start, end] = obj.points;
    const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
  },
  polygon: (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    ctx.moveTo(obj.points[0].x, obj.points[0].y);
    obj.points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
  },
};

// Main drawing function
export const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
  if ("objects" in obj) {
    // It's a group, draw each object in the group
    obj.objects.forEach((subObj) => drawObject(ctx, subObj));
  } else {
    initializeDrawing(ctx, obj);
    const drawShape = drawShapes[obj.type];
    if (drawShape) {
      drawShape(ctx, obj);
    }
    ctx.stroke();
  }
};

// Reuse canvas context for point detection
const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

export const isPointInObject = (point: Point, obj: CanvasObject): boolean => {
  if ("objects" in obj) {
    return obj.objects.some((subObj) => isPointInObject(point, subObj));
  } else {
    if (!offscreenCtx) return false;

    drawObject(offscreenCtx, obj);
    return offscreenCtx.isPointInStroke(point.x, point.y);
  }
};
