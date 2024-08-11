export type DrawingMode = "freehand" | "line" | "rectangle" | "ellipse" | "circle" | "polygon" | "move" | "delete" | "copy" | "group" | "ungroup";

export interface Point {
  x: number;
  y: number;
}

export interface DrawingObject {
  id: string;
  type: DrawingMode;
  color: string;
  points: Point[];
}

export interface Group {
  id: string;
  objects: DrawingObject[];
}

export type CanvasObject = DrawingObject | Group;
