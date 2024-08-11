import React from "react";
import { DrawingMode } from "../types";

interface ToolbarProps {
  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  globalColor: string;
  setGlobalColor: (color: string) => void;
  undo: () => void;
  redo: () => void;
  saveDrawing: () => void;
  loadDrawing: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ drawingMode, setDrawingMode, globalColor, setGlobalColor, undo, redo, saveDrawing, loadDrawing }) => {
  const buttons: { mode: DrawingMode; label: string; tooltip: string }[] = [
    { mode: "freehand", label: "Freehand", tooltip: "Draw freehand lines by clicking and dragging." },
    { mode: "line", label: "Line", tooltip: "Draw straight lines by clicking and dragging." },
    { mode: "rectangle", label: "Rectangle", tooltip: "Draw rectangles by clicking and dragging." },
    { mode: "ellipse", label: "Ellipse", tooltip: "Draw ellipses by clicking and dragging." },
    { mode: "circle", label: "Circle", tooltip: "Draw circles by clicking and dragging." },
    { mode: "polygon", label: "Polygon", tooltip: "Draw polygons by clicking to add points. Double-click to complete." },
    { mode: "move", label: "Move", tooltip: "Move objects by clicking and dragging." },
    { mode: "delete", label: "Delete", tooltip: "Delete objects by clicking on them." },
    { mode: "copy", label: "Copy", tooltip: "Copy objects by clicking on them, then use paste." },
    { mode: "group", label: "Group", tooltip: "Select objects to group them together." },
    { mode: "ungroup", label: "Ungroup", tooltip: "Select a group to ungroup it." },
  ];

  return (
    <div className="toolbar flex flex-col gap-2 p-4 bg-gray-800 text-white shadow-lg w-64">
      {buttons.map(({ mode, label, tooltip }) => (
        <button key={mode} onClick={() => setDrawingMode(mode)} className={`toolbar-btn relative ${drawingMode === mode ? "bg-blue-600" : "bg-gray-700"} p-2 rounded-lg`}>
          {label}
          <span className="tooltip absolute text-xs bg-black text-white rounded p-1 opacity-0 hover:opacity-100 -right-20 w-48">{tooltip}</span>
        </button>
      ))}
      <input type="color" value={globalColor} onChange={(e) => setGlobalColor(e.target.value)} className="color-picker mt-4 p-2 rounded-lg bg-gray-700" title="Choose color" />
      <button onClick={undo} className="toolbar-btn bg-gray-700 p-2 rounded-lg mt-4">
        Undo
        <span className="tooltip absolute text-xs bg-black text-white rounded p-1 opacity-0 hover:opacity-100 -right-20 w-48">Undo the last action.</span>
      </button>
      <button onClick={redo} className="toolbar-btn bg-gray-700 p-2 rounded-lg">
        Redo
        <span className="tooltip absolute text-xs bg-black text-white rounded p-1 opacity-0 hover:opacity-100 -right-20 w-48">Redo the last undone action.</span>
      </button>
      <button onClick={saveDrawing} className="toolbar-btn bg-gray-700 p-2 rounded-lg">
        Save
        <span className="tooltip absolute text-xs bg-black text-white rounded p-1 opacity-0 hover:opacity-100 -right-20 w-48">Save the current drawing to local storage.</span>
      </button>
      <button onClick={loadDrawing} className="toolbar-btn bg-gray-700 p-2 rounded-lg">
        Load
        <span className="tooltip absolute text-xs bg-black text-white rounded p-1 opacity-0 hover:opacity-100 -right-20 w-48">Load a saved drawing from local storage.</span>
      </button>
    </div>
  );
};

export default Toolbar;
