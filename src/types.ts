// types.ts
export type DrawingMode = "freehand" | "line" | "rectangle" | "ellipse" | "circle" | "polygon" | "move" | "delete" | "copy" | "group" | "ungroup";

export interface Point {
  x: number;
  y: number;
}

export interface DrawingObject {
  id: string;
  type: Exclude<DrawingMode, "move" | "delete" | "copy" | "group" | "ungroup">;
  color: string;
  points: Point[];
}

export interface Group {
  id: string;
  type: "group";
  objects: CanvasObject[];
}

export type CanvasObject = DrawingObject | Group;
