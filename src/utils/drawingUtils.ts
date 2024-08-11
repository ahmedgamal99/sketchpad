import { DrawingObject, Group, Point, CanvasObject } from "../types";

export const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
  if ("objects" in obj) {
    obj.objects.forEach((subObj) => drawObject(ctx, subObj));
  } else {
    ctx.strokeStyle = obj.color;
    ctx.beginPath();

    switch (obj.type) {
      case "freehand":
      case "line":
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        obj.points.forEach((point) => ctx.lineTo(point.x, point.y));
        break;
      case "rectangle": {
        const [start, end] = obj.points;
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      }
      case "ellipse": {
        const [center, radius] = obj.points;
        ctx.ellipse(center.x, center.y, Math.abs(radius.x - center.x), Math.abs(radius.y - center.y), 0, 0, 2 * Math.PI);
        break;
      }

      case "circle": {
        const [circleCenter, circlePoint] = obj.points;
        const radius = Math.sqrt(Math.pow(circlePoint.x - circleCenter.x, 2) + Math.pow(circlePoint.y - circleCenter.y, 2));
        ctx.arc(circleCenter.x, circleCenter.y, radius, 0, 2 * Math.PI);
        break;
      }

      case "polygon": {
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        obj.points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        break;
      }
    }

    ctx.stroke();
  }
};

export const isPointInObject = (point: Point, obj: CanvasObject): boolean => {
  if ("objects" in obj) {
    // It's a group
    return obj.objects.some((subObj) => isPointInObject(point, subObj));
  } else {
    // It's a drawing object
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return false;

    drawObject(ctx, obj);
    return ctx.isPointInPath(point.x, point.y);
  }
};
