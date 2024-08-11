import React, { useState } from "react";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import { DrawingMode, CanvasObject } from "./types";

const App: React.FC = () => {
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("freehand");
  const [globalColor, setGlobalColor] = useState("#000000");
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasObject[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasObject[][]>([]);

  const saveState = () => {
    setUndoStack([...undoStack, objects]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack.pop()!;
      setRedoStack([...redoStack, objects]);
      setObjects(previousState);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop()!;
      setUndoStack([...undoStack, objects]);
      setObjects(nextState);
    }
  };

 



  const saveDrawing = () => {
    localStorage.setItem("drawing", JSON.stringify(objects));
  };

  const loadDrawing = () => {
    const savedDrawing = localStorage.getItem("drawing");
    if (savedDrawing) {
      setObjects(JSON.parse(savedDrawing));
      saveState();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Toolbar
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        globalColor={globalColor}
        setGlobalColor={setGlobalColor}
        undo={undo}
        redo={redo}
        saveDrawing={saveDrawing}
        loadDrawing={loadDrawing}
      />
      <div className="flex-grow bg-white shadow-lg overflow-hidden rounded-lg m-4">
        <Canvas
          drawingMode={drawingMode}
          globalColor={globalColor}
          objects={objects}
          setObjects={(newObjects) => {
            setObjects(newObjects);
            saveState();
          }}
        />
      </div>
    </div>
  );
};

export default App;
