import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import { DrawingMode, CanvasObject, Group } from "./types";

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
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, objects]);
      setObjects(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, objects]);
      setObjects(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  const groupObjects = (objectsToGroup: CanvasObject[]) => {
    if (objectsToGroup.length < 2) return;

    const newGroup: Group = {
      id: uuidv4(),
      objects: objectsToGroup,
    };

    const newObjects = objects.filter((obj) => !objectsToGroup.includes(obj));
    newObjects.push(newGroup);
    setObjects(newObjects);
    saveState();
  };

  const ungroupObjects = (group: Group) => {
    const newObjects = objects.filter((obj) => obj !== group);
    newObjects.push(...group.objects);
    setObjects(newObjects);
    saveState();
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
    <div className="flex flex-col h-screen">
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
      <div className="flex-grow overflow-hidden">
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
