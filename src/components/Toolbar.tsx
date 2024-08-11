import React, { useState } from "react";
import { DrawingMode } from "../types";
import { FaPencilAlt, FaDrawPolygon, FaRegSquare, FaRegCircle, FaArrowsAlt, FaTrash, FaCopy, FaObjectGroup, FaObjectUngroup, FaUndo, FaRedo, FaSave, FaFolderOpen, FaPalette } from "react-icons/fa";
import { BsSlashLg } from "react-icons/bs";

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

const ColorPicker: React.FC<{ color: string; onChange: (color: string) => void }> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const predefinedColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#FFFFFF"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 rounded-lg overflow-hidden border border-gray-600 shadow-inner flex items-center justify-between px-3 bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
      >
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full mr-2 border border-gray-400" style={{ backgroundColor: color }}></div>
          <span>{color}</span>
        </div>
        <FaPalette />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-800 rounded-lg shadow-xl p-2 z-10">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {predefinedColors.map((c) => (
              <button
                key={c}
                className="w-8 h-8 rounded-full border border-gray-600"
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
          <input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
        </div>
      )}
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({ drawingMode, setDrawingMode, globalColor, setGlobalColor, undo, redo, saveDrawing, loadDrawing }) => {
  const buttons: { mode: DrawingMode; label: string; tooltip: string; icon: React.ReactElement }[] = [
    { mode: "freehand", label: "Freehand", tooltip: "Draw freehand lines", icon: <FaPencilAlt /> },
    { mode: "line", label: "Line", tooltip: "Draw straight lines", icon: <BsSlashLg /> },
    { mode: "rectangle", label: "Rectangle", tooltip: "Draw rectangles", icon: <FaRegSquare /> },
    { mode: "ellipse", label: "Ellipse", tooltip: "Draw ellipses", icon: <FaRegCircle /> },
    { mode: "circle", label: "Circle", tooltip: "Draw circles", icon: <FaRegCircle /> },
    { mode: "polygon", label: "Polygon", tooltip: "Draw polygons", icon: <FaDrawPolygon /> },
    { mode: "move", label: "Move", tooltip: "Move objects", icon: <FaArrowsAlt /> },
    { mode: "delete", label: "Delete", tooltip: "Delete objects", icon: <FaTrash /> },
    { mode: "copy", label: "Copy", tooltip: "Copy objects", icon: <FaCopy /> },
    { mode: "group", label: "Group", tooltip: "Group objects", icon: <FaObjectGroup /> },
    { mode: "ungroup", label: "Ungroup", tooltip: "Ungroup objects", icon: <FaObjectUngroup /> },
  ];

  return (
    <div className="toolbar flex flex-col gap-4 p-4 bg-gray-900 text-white shadow-2xl w-72 rounded-lg m-4">
      <div className="grid grid-cols-3 gap-2">
        {buttons.map(({ mode, label, tooltip, icon }) => (
          <button
            key={mode}
            onClick={() => setDrawingMode(mode)}
            className={`toolbar-btn flex flex-col items-center justify-center ${
              drawingMode === mode ? "bg-blue-600" : "bg-gray-700"
            } p-2 rounded-lg transition-all duration-200 hover:bg-blue-500 focus:outline-none relative group`}
            title={tooltip}
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-xs">{label}</span>
            <span className="tooltip opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-full ml-2 w-32 bg-black text-white text-xs rounded p-1 shadow-lg z-10">
              {tooltip}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <ColorPicker color={globalColor} onChange={setGlobalColor} />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={undo}
            className="toolbar-btn bg-gray-700 p-2 rounded-lg transition-all duration-200 hover:bg-blue-500 focus:outline-none flex items-center justify-center"
            title="Undo the last action"
          >
            <FaUndo className="mr-1" /> Undo
          </button>
          <button
            onClick={redo}
            className="toolbar-btn bg-gray-700 p-2 rounded-lg transition-all duration-200 hover:bg-blue-500 focus:outline-none flex items-center justify-center"
            title="Redo the last undone action"
          >
            <FaRedo className="mr-1" /> Redo
          </button>
          <button
            onClick={saveDrawing}
            className="toolbar-btn bg-gray-700 p-2 rounded-lg transition-all duration-200 hover:bg-blue-500 focus:outline-none flex items-center justify-center"
            title="Save the current drawing"
          >
            <FaSave className="mr-1" /> Save
          </button>
          <button
            onClick={loadDrawing}
            className="toolbar-btn bg-gray-700 p-2 rounded-lg transition-all duration-200 hover:bg-blue-500 focus:outline-none flex items-center justify-center"
            title="Load a saved drawing"
          >
            <FaFolderOpen className="mr-1" /> Load
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
