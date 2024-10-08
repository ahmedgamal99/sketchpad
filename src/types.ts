// types.ts
export type DrawingMode = "freehand" | "line" | "rectangle" | "ellipse" | "circle" | "polygon" | "move" | "delete" | "copy" | "cut" | "group" | "ungroup" | "paste";

export interface Point {
  x: number;
  y: number;
}

export interface BaseObject {
  id: string;
  color: string;
}

export interface DrawingObject extends BaseObject {
  type: Exclude<DrawingMode, "move" | "delete" | "copy" |"cut"| "group" | "ungroup" | "paste" >;
  points: Point[];
}

export interface Group extends BaseObject {
  type: "group";
  objects: CanvasObject[];
}

export type CanvasObject = DrawingObject | Group;
