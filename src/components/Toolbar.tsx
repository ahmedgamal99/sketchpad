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
    <div className="toolbar flex flex-col gap-3 p-4 bg-gray-900 text-white shadow-xl w-72 rounded-lg">
      {buttons.map(({ mode, label, tooltip }) => (
        <button
          key={mode}
          onClick={() => setDrawingMode(mode)}
          className={`toolbar-btn flex items-center justify-between ${
            drawingMode === mode ? "bg-blue-700" : "bg-gray-800"
          } p-3 rounded-lg transition-colors duration-200 hover:bg-blue-600 focus:outline-none`}
          title={tooltip}
        >
          <span>{label}</span>
          <span className="tooltip hidden text-xs bg-black text-white rounded p-1 absolute -right-52 w-56">{tooltip}</span>
        </button>
      ))}
      <div className="flex flex-col gap-2 mt-4">
        <input
          type="color"
          value={globalColor}
          onChange={(e) => setGlobalColor(e.target.value)}
          className="color-picker p-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 focus:outline-none"
          title="Choose color"
        />
        <button onClick={undo} className="toolbar-btn bg-gray-800 p-3 rounded-lg transition-colors duration-200 hover:bg-blue-600 focus:outline-none" title="Undo the last action.">
          Undo
        </button>
        <button onClick={redo} className="toolbar-btn bg-gray-800 p-3 rounded-lg transition-colors duration-200 hover:bg-blue-600 focus:outline-none" title="Redo the last undone action.">
          Redo
        </button>
        <button
          onClick={saveDrawing}
          className="toolbar-btn bg-gray-800 p-3 rounded-lg transition-colors duration-200 hover:bg-blue-600 focus:outline-none"
          title="Save the current drawing to local storage."
        >
          Save
        </button>
        <button
          onClick={loadDrawing}
          className="toolbar-btn bg-gray-800 p-3 rounded-lg transition-colors duration-200 hover:bg-blue-600 focus:outline-none"
          title="Load a saved drawing from local storage."
        >
          Load
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
