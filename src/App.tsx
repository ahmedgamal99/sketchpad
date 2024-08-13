import React, { useState, useCallback } from "react";
import { DrawingMode, CanvasObject } from "./types";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import { FaUndo, FaRedo, FaSave, FaFolderOpen, FaObjectGroup } from "react-icons/fa";

const App: React.FC = () => {
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("freehand");
  const [globalColor, setGlobalColor] = useState("#000000");
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasObject[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasObject[][]>([]);
  const [selectedObjects, setSelectedObjects] = useState<CanvasObject[]>([]);
  const [copiedObject, setCopiedObject] = useState<CanvasObject | null>(null);
  const saveState = useCallback(() => {
    setUndoStack([...undoStack, objects]);
    setRedoStack([]);
  }, [objects, undoStack]);

  const undo = () => {
    if (undoStack.length > 0) {
      const newUndoStack = [...undoStack];
      const previousState = newUndoStack.pop()!;
      setUndoStack(newUndoStack);
      setRedoStack([...redoStack, objects]);
      setObjects(previousState);
    }
  };
  const redo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop()!;
      setRedoStack(newRedoStack);
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

  const handleGroupCommand = () => {
    if (selectedObjects.length > 1) {
      const newGroup = {
        id: crypto.randomUUID(),
        type: "group",
        objects: selectedObjects,
      } as CanvasObject;
      setObjects((prevObjects) => [...prevObjects.filter((obj) => !selectedObjects.includes(obj)), newGroup]);
      setSelectedObjects([]);
      saveState();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 text-white bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold">HCI Final Assignment</h1>
      </header>
      <div className="flex flex-grow overflow-hidden">
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
        <main className="flex-grow p-4 overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-2 bg-gray-200">
              <div className="flex space-x-2">
                <button onClick={undo} className="inline-flex items-center px-4 py-2 font-bold text-gray-800 bg-gray-300 rounded hover:bg-gray-400" disabled={undoStack.length === 0}>
                  <FaUndo className="mr-2" /> Undo
                </button>
                <button onClick={redo} className="inline-flex items-center px-4 py-2 font-bold text-gray-800 bg-gray-300 rounded hover:bg-gray-400" disabled={redoStack.length === 0}>
                  <FaRedo className="mr-2" /> Redo
                </button>
                <button
                  onClick={handleGroupCommand}
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center ${selectedObjects.length < 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={selectedObjects.length < 2}
                >
                  <FaObjectGroup className="mr-2" /> Group
                </button>
              </div>
              <div className="flex space-x-2">
                <button onClick={saveDrawing} className="inline-flex items-center px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                  <FaSave className="mr-2" /> Save
                </button>
                <button onClick={loadDrawing} className="inline-flex items-center px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700">
                  <FaFolderOpen className="mr-2" /> Load
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-hidden">
              <Canvas
                drawingMode={drawingMode}
                globalColor={globalColor}
                objects={objects}
                setObjects={setObjects}
                selectedObjects={selectedObjects}
                setSelectedObjects={setSelectedObjects}
                copiedObject={copiedObject}
                setCopiedObject={setCopiedObject}
                saveState={saveState} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
