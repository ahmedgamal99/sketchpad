import React, { useState } from "react";
import { DrawingMode } from "../types";
import { FaPencilAlt, FaDrawPolygon, FaRegSquare, FaRegCircle, FaArrowsAlt, FaTrash, FaCopy, FaObjectGroup, FaObjectUngroup, FaPalette, FaPaste } from "react-icons/fa";
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
        className="flex items-center justify-between w-full h-10 px-3 overflow-hidden transition-colors duration-200 bg-gray-700 border border-gray-600 rounded-lg shadow-inner hover:bg-gray-600"
      >
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2 border border-gray-400 rounded-full" style={{ backgroundColor: color }}></div>
          <span>{color}</span>
        </div>
        <FaPalette />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-10 w-full p-2 mt-2 bg-gray-800 rounded-lg shadow-xl top-full">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {predefinedColors.map((c) => (
              <button
                key={c}
                className="w-8 h-8 border border-gray-600 rounded-full"
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

const Toolbar: React.FC<ToolbarProps> = ({ drawingMode, setDrawingMode, globalColor, setGlobalColor }) => {
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
    { mode: "paste", label: "Paste", tooltip: "Paste copied object", icon: <FaPaste /> },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 m-4 text-white bg-gray-900 rounded-lg shadow-2xl toolbar w-72">
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
            <span className="mb-1 text-xl">{icon}</span>
            <span className="text-xs">{label}</span>
            <span className="absolute z-10 w-32 p-1 ml-2 text-xs text-white transition-opacity duration-200 bg-black rounded shadow-lg opacity-0 tooltip group-hover:opacity-100 left-full">
              {tooltip}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <ColorPicker color={globalColor} onChange={setGlobalColor} />
      </div>
    </div>
  );
};

export default Toolbar;
