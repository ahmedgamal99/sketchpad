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

  const saveState = useCallback(() => {
    setUndoStack((prevUndoStack) => [...prevUndoStack, objects]);
    setRedoStack([]); // Clear the redo stack whenever a new state is saved
  }, [objects]);

  const undo = () => {
    setUndoStack((prevUndoStack) => {
      if (prevUndoStack.length > 0) {
        const previousState = prevUndoStack[prevUndoStack.length - 1];
        setRedoStack((prevRedoStack) => [...prevRedoStack, objects]);
        setObjects(previousState);
        return prevUndoStack.slice(0, prevUndoStack.length - 1);
      }
      return prevUndoStack;
    });
  };

  const redo = () => {
    setRedoStack((prevRedoStack) => {
      if (prevRedoStack.length > 0) {
        const nextState = prevRedoStack[prevRedoStack.length - 1];
        setUndoStack((prevUndoStack) => [...prevUndoStack, objects]);
        setObjects(nextState);
        return prevRedoStack.slice(0, prevRedoStack.length - 1);
      }
      return prevRedoStack;
    });
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
      setObjects((prevObjects) => {
        const updatedObjects = [...prevObjects.filter((obj) => !selectedObjects.includes(obj)), newGroup];
        saveState(); // Save the state before modifying objects
        return updatedObjects;
      });
      setSelectedObjects([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow-md">
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
          <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
            <div className="bg-gray-200 p-2 flex justify-between items-center">
              <div className="flex space-x-2">
                <button onClick={undo} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" disabled={undoStack.length === 0}>
                  <FaUndo className="mr-2" /> Undo
                </button>
                <button onClick={redo} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" disabled={redoStack.length === 0}>
                  <FaRedo className="mr-2" /> Redo
                </button>
                {/* Other toolbar buttons */}
              </div>
            </div>
            {/* Canvas component rendering */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
