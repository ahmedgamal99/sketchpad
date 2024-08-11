import { CanvasObject, DrawingObject, Point, Group } from "../types";

const initializeDrawing = (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
  ctx.strokeStyle = obj.color;
  ctx.beginPath();
};

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
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
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

export const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
  if (obj.type === "group") {
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

const offscreenCanvas = new OffscreenCanvas(1, 1);
const offscreenCtx = offscreenCanvas.getContext("2d");

export const isPointInObject = (point: Point, obj: CanvasObject): boolean => {
  if (obj.type === "group") {
    return obj.objects.some((subObj) => isPointInObject(point, subObj));
  } else {
    if (!offscreenCtx) return false;
    offscreenCtx.clearRect(0, 0, 1, 1);
    //@ts-expect-error type issue
    drawObject(offscreenCtx, obj);
    return offscreenCtx.isPointInStroke(point.x, point.y);
  }
};

export const createObject = (type: DrawingObject["type"], color: string, points: Point[]): DrawingObject => ({
  id: crypto.randomUUID(),
  type,
  color,
  points,
});

export const createGroup = (objects: CanvasObject[]): Group => ({
  id: crypto.randomUUID(),
  type: "group",
  objects,
});
