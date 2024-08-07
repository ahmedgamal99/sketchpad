const buttons = document.querySelectorAll('.toolbar-btn');

document.getElementById('freehand-btn').addEventListener('click', () => {
    setDrawingMode('freehand');
});

document.getElementById('line-btn').addEventListener('click', () => {
    setDrawingMode('line');
});

document.getElementById('rectangle-btn').addEventListener('click', () => {
    setDrawingMode('rectangle');
});

document.getElementById('ellipse-btn').addEventListener('click', () => {
    setDrawingMode('ellipse');
});

document.getElementById('circle-btn').addEventListener('click', () => {
    setDrawingMode('circle');
});

document.getElementById('polygon-btn').addEventListener('click', () => {
    setDrawingMode('polygon');
});

document.getElementById('move-btn').addEventListener('click', () => {
    setDrawingMode('move');
});

document.getElementById('delete-btn').addEventListener('click', () => {
    setDrawingMode('delete');
});

document.getElementById('copy-btn').addEventListener('click', () => {
    setDrawingMode('copy');
});

document.getElementById('paste-btn').addEventListener('click', () => {
    pasteObject();
});

document.getElementById('group-btn').addEventListener('click', () => {
    setDrawingMode('group');
});

document.getElementById('ungroup-btn').addEventListener('click', () => {
    setDrawingMode('ungroup');
});

document.getElementById('undo-btn').addEventListener('click', () => {
    undo();
});

document.getElementById('redo-btn').addEventListener('click', () => {
    redo();
});

document.getElementById('save-btn').addEventListener('click', () => {
    saveDrawing();
});

document.getElementById('load-btn').addEventListener('click', () => {
    loadDrawing();
});

document.getElementById('color-picker').addEventListener('change', (e) => {
    ctx.strokeStyle = e.target.value;
    updateSelectedObjectsColor(e.target.value);
    setGlobalColor(e.target.value);
});

function setDrawingMode(mode) {
    if (drawingMode === 'group' && selectedObjects.length > 1) {
        groupSelectedObjects();
    }
    if (drawingMode === 'polygon' && points.length > 0) {
        saveObject({ type: 'polygon', points: points.slice(), color: globalColor });
        points = [];
    }
    drawingMode = mode;
    console.log('Drawing mode set to:', mode);
    clearSelection();
    highlightActiveButton(mode);
    if (mode === 'group') {
        highlightSelectedObjects();
    }
}

function highlightActiveButton(mode) {
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(`${mode}-btn`).classList.add('active');
}

function clearSelection() {
    selectedObject = null;
    selectedObjects = [];
    redrawObjects();
}

function updateSelectedObjectsColor(color) {
    selectedObjects.forEach(obj => {
        if (obj.objects) {
            obj.objects.forEach(subObj => subObj.color = color);
        } else {
            obj.color = color;
        }
    });
    redrawObjects();
}

function setGlobalColor(color) {
    globalColor = color;
}
