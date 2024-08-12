// drawingUtils.ts
import { CanvasObject, DrawingObject, Point, Group, BaseObject } from "../types";

class DrawingUtils {
  private static offscreenCanvas: OffscreenCanvas;
  private static offscreenCtx: OffscreenCanvasRenderingContext2D | null;

  static {
    this.offscreenCanvas = new OffscreenCanvas(1, 1);
    this.offscreenCtx = this.offscreenCanvas.getContext("2d");
  }

  private static initializeDrawing(ctx: CanvasRenderingContext2D, obj: BaseObject): void {
    ctx.strokeStyle = obj.color;
    ctx.beginPath();
  }

  private static drawShapes: Record<DrawingObject["type"], (ctx: CanvasRenderingContext2D, obj: DrawingObject) => void> = {
    freehand: (ctx, obj) => {
      ctx.moveTo(obj.points[0].x, obj.points[0].y);
      obj.points.forEach((point) => ctx.lineTo(point.x, point.y));
    },
    line: (ctx, obj) => {
      ctx.moveTo(obj.points[0].x, obj.points[0].y);
      ctx.lineTo(obj.points[1].x, obj.points[1].y);
    },
    rectangle: (ctx, obj) => {
      const [start, end] = obj.points;
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    },
    ellipse: (ctx, obj) => {
      const [start, end] = obj.points;
      const radiusX = Math.abs(end.x - start.x) / 2;
      const radiusY = Math.abs(end.y - start.y) / 2;
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    },
    circle: (ctx, obj) => {
      const [start, end] = obj.points;
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    },
    polygon: (ctx, obj) => {
      ctx.moveTo(obj.points[0].x, obj.points[0].y);
      obj.points.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
    },
  };

  static drawObject(ctx: CanvasRenderingContext2D, obj: CanvasObject): void {
    if (obj.type === "group") {
      obj.objects.forEach((subObj) => this.drawObject(ctx, subObj));
    } else {
      this.initializeDrawing(ctx, obj);
      const drawShape = this.drawShapes[obj.type];
      if (drawShape) {
        drawShape(ctx, obj);
      }
      ctx.stroke();
    }
  }

  static isPointInObject(point: Point, obj: CanvasObject): boolean {
    if (obj.type === "group") {
      return obj.objects.some((subObj) => this.isPointInObject(point, subObj));
    } else {
      if (!this.offscreenCtx) return false;
      this.offscreenCtx.clearRect(0, 0, 1, 1);
      //@ts-expect-error type
      this.drawObject(this.offscreenCtx, obj);
      return this.offscreenCtx.isPointInStroke(point.x, point.y);
    }
  }

  static createObject(type: DrawingObject["type"], color: string, points: Point[]): DrawingObject {
    return {
      id: crypto.randomUUID(),
      type,
      color,
      points,
    };
  }

  static createGroup(objects: CanvasObject[]): Group {
    return {
      id: crypto.randomUUID(),
      type: "group",
      color: objects[0]?.color ?? "#000000",
      objects,
    };
  }
}

export default DrawingUtils;
