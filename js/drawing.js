const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let isDrawing = false;
let startX, startY;
let drawingMode = 'freehand';
let objects = [];
let selectedObject = null;
let clipboard = null;
let points = [];
let selectedObjects = [];
let groups = [];
let groupIdCounter = 1;
let undoStack = [];
let redoStack = [];
let currentPath = [];
let isMoving = false;
let globalColor = '#000000';

canvas.addEventListener('mousedown', (e) => {
    if (drawingMode === 'move') {
        selectedObject = getObjectAt(e.offsetX, e.offsetY);
        if (selectedObject) {
            isMoving = true;
            startX = e.offsetX;
            startY = e.offsetY;
        }
    } else if (drawingMode === 'delete') {
        selectedObject = getObjectAt(e.offsetX, e.offsetY);
        if (selectedObject) {
            deleteSelectedObject();
        }
    } else if (drawingMode === 'copy') {
        selectedObject = getObjectAt(e.offsetX, e.offsetY);
        if (selectedObject) {
            copySelectedObject();
        }
    } else if (drawingMode === 'group') {
        selectedObject = getObjectAt(e.offsetX, e.offsetY);
        if (selectedObject) {
            toggleSelection(selectedObject);
        }
    } else if (drawingMode === 'ungroup') {
        selectedObject = getObjectAt(e.offsetX, e.offsetY);
        if (selectedObject && selectedObject.objects) {
            ungroupSelectedObject(selectedObject);
        }
    } else if (drawingMode === 'polygon') {
        points.push([e.offsetX, e.offsetY]);
        drawPolygonPreview(points);
    } else {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
        if (drawingMode === 'freehand') {
            currentPath = [{ x: startX, y: startY }];
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isMoving && selectedObject) {
        moveObject(selectedObject, e.offsetX - startX, e.offsetY - startY);
        startX = e.offsetX;
        startY = e.offsetY;
        return;
    }

    if (!isDrawing) return;
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    switch (drawingMode) {
        case 'freehand':
            drawFreehand(startX, startY, currentX, currentY);
            currentPath.push({ x: currentX, y: currentY });
            startX = currentX;
            startY = currentY;
            break;
        case 'line':
            drawLinePreview(startX, startY, currentX, currentY);
            break;
        case 'rectangle':
            drawRectanglePreview(startX, startY, currentX, currentY);
            break;
        case 'ellipse':
            drawEllipsePreview(startX, startY, currentX, currentY);
            break;
        case 'circle':
            drawCirclePreview(startX, startY, currentX, currentY);
            break;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isMoving) {
        isMoving = false;
        selectedObject = null;
        saveState();
        return;
    }

    if (isDrawing) {
        const currentX = e.offsetX;
        const currentY = e.offsetY;

        switch (drawingMode) {
            case 'line':
                saveObject({ type: 'line', x1: startX, y1: startY, x2: currentX, y2: currentY, color: globalColor });
                break;
            case 'rectangle':
                saveObject({ type: 'rectangle', x: startX, y: startY, width: currentX - startX, height: currentY - startY, color: globalColor });
                break;
            case 'ellipse':
                saveObject({ type: 'ellipse', x: startX, y: startY, radiusX: Math.abs((currentX - startX) / 2), radiusY: Math.abs((currentY - startY) / 2), color: globalColor });
                break;
            case 'circle':
                const radius = Math.max(Math.abs(currentX - startX), Math.abs(currentY - startY)) / 2;
                saveObject({ type: 'circle', x: startX, y: startY, radius: radius, color: globalColor });
                break;
            case 'freehand':
                saveObject({ type: 'freehand', path: currentPath, color: globalColor });
                break;
        }

        isDrawing = false;
        clearCanvas();
        redrawObjects();
    }
});

canvas.addEventListener('dblclick', () => {
    if (drawingMode === 'polygon' && points.length > 1) {
        saveObject({ type: 'polygon', points: points.slice(), color: globalColor });
        points = [];
        clearCanvas();
        redrawObjects();
    }
});

function drawFreehand(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawLinePreview(x1, y1, x2, y2) {
    clearCanvas();
    redrawObjects();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRectanglePreview(x1, y1, x2, y2) {
    clearCanvas();
    redrawObjects();
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.strokeRect(x1, y1, width, height);
}

function drawEllipsePreview(x1, y1, x2, y2) {
    clearCanvas();
    redrawObjects();
    const radiusX = Math.abs((x2 - x1) / 2);
    const radiusY = Math.abs((y2 - y1) / 2);
    const centerX = x1 + radiusX;
    const centerY = y1 + radiusY;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCirclePreview(x1, y1, x2, y2) {
    clearCanvas();
    redrawObjects();
    const radius = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPolygonPreview(points) {
    clearCanvas();
    redrawObjects();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
}

function saveObject(object) {
    objects.push(object);
    saveState();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawObjects() {
    objects.forEach(obj => {
        ctx.strokeStyle = obj.color || globalColor;
        drawObject(obj);
    });
    groups.forEach(group => {
        group.objects.forEach(obj => {
            ctx.strokeStyle = obj.color; 
            drawObject(obj);
        });
    });
    if (drawingMode === 'group') {
        highlightSelectedObjects();
    }
}

function drawObject(obj) {
    switch (obj.type) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(obj.x1, obj.y1);
            ctx.lineTo(obj.x2, obj.y2);
            ctx.stroke();
            break;
        case 'rectangle':
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            break;
        case 'ellipse':
            const centerX = obj.x + obj.radiusX;
            const centerY = obj.y + obj.radiusY;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, obj.radiusX, obj.radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'circle':
            const circleCenterX = obj.x + obj.radius;
            const circleCenterY = obj.y + obj.radius;
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, obj.radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'polygon':
            ctx.beginPath();
            ctx.moveTo(obj.points[0][0], obj.points[0][1]);
            for (let i = 1; i < obj.points.length; i++) {
                ctx.lineTo(obj.points[i][0], obj.points[i][1]);
            }
            ctx.stroke();
            break;
        case 'freehand':
            ctx.beginPath();
            ctx.moveTo(obj.path[0].x, obj.path[0].y);
            for (let i = 1; i < obj.path.length; i++) {
                ctx.lineTo(obj.path[i].x, obj.path[i].y);
            }
            ctx.stroke();
            break;
    }
}

function getObjectAt(x, y) {
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (isPointInObject(x, y, obj)) {
            return obj;
        }
    }
    for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        for (let j = 0; j < group.objects.length; j++) {
            if (isPointInObject(x, y, group.objects[j])) {
                return group;
            }
        }
    }
    return null;
}

function isPointInObject(x, y, obj) {
    switch (obj.type) {
        case 'line':
            return isPointNearLine(x, y, obj.x1, obj.y1, obj.x2, obj.y2);
        case 'rectangle':
            return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
        case 'ellipse':
            const centerX = obj.x + obj.radiusX;
            const centerY = obj.y + obj.radiusY;
            return isPointInEllipse(x, y, centerX, centerY, obj.radiusX, obj.radiusY);
        case 'circle':
            const circleCenterX = obj.x + obj.radius;
            const circleCenterY = obj.y + obj.radius;
            return isPointInCircle(x, y, circleCenterX, circleCenterY, obj.radius);
        case 'polygon':
            return isPointInPolygon(x, y, obj.points);
        case 'freehand':
            return isPointNearPath(x, y, obj.path);
        default:
            return false;
    }
}

function isPointNearLine(px, py, x1, y1, x2, y2) {
    const buffer = 5;
    const distance = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    return distance < buffer;
}

function isPointInEllipse(px, py, cx, cy, rx, ry) {
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

function isPointInCircle(px, py, cx, cy, r) {
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx + dy * dy) <= r * r;
}

function isPointInPolygon(px, py, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0], yi = points[i][1];
        const xj = points[j][0], yj = points[j][1];
        const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function isPointNearPath(px, py, path) {
    for (let i = 0; i < path.length - 1; i++) {
        if (isPointNearLine(px, py, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y)) {
            return true;
        }
    }
    return false;
}

function moveObject(obj, dx, dy) {
    if (obj.objects) {
        obj.objects.forEach(subObj => moveObject(subObj, dx, dy));
    } else {
        switch (obj.type) {
            case 'line':
                obj.x1 += dx;
                obj.y1 += dy;
                obj.x2 += dx;
                obj.y2 += dy;
                break;
            case 'rectangle':
            case 'ellipse':
            case 'circle':
                obj.x += dx;
                obj.y += dy;
                break;
            case 'polygon':
                for (let point of obj.points) {
                    point[0] += dx;
                    point[1] += dy;
                }
                break;
            case 'freehand':
                for (let point of obj.path) {
                    point.x += dx;
                    point.y += dy;
                }
                break;
        }
    }
    clearCanvas();
    redrawObjects();
}

function toggleSelection(obj) {
    const index = selectedObjects.indexOf(obj);
    if (index === -1) {
        selectedObjects.push(obj);
    } else {
        selectedObjects.splice(index, 1);
    }
    redrawObjects();
}

function highlightSelectedObjects() {
    selectedObjects.forEach(obj => {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        drawObject(obj);
        ctx.restore();
    });
}

function groupSelectedObjects() {
    if (selectedObjects.length > 1) {
        const group = {
            id: groupIdCounter++,
            objects: selectedObjects.slice(),
            color: null 
        };
        groups.push(group);
        objects = objects.filter(obj => !selectedObjects.includes(obj));
        selectedObjects = [group];
        saveState();
        clearCanvas();
        redrawObjects();
    }
}

function ungroupSelectedObject(group) {
    const groupIndex = groups.findIndex(g => g === group);
    if (groupIndex !== -1) {
        const group = groups[groupIndex];
        groups.splice(groupIndex, 1);
        objects.push(...group.objects);
        selectedObjects = [];
        saveState();
        clearCanvas();
        redrawObjects();
    }
}

function saveState() {
    undoStack.push({
        objects: JSON.parse(JSON.stringify(objects)),
        groups: JSON.parse(JSON.stringify(groups))
    });
    redoStack = [];
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push({
            objects: JSON.parse(JSON.stringify(objects)),
            groups: JSON.parse(JSON.stringify(groups))
        });
        const state = undoStack.pop();
        objects = state.objects;
        groups = state.groups;
        clearCanvas();
        redrawObjects();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push({
            objects: JSON.parse(JSON.stringify(objects)),
            groups: JSON.parse(JSON.stringify(groups))
        });
        const state = redoStack.pop();
        objects = state.objects;
        groups = state.groups;
        clearCanvas();
        redrawObjects();
    }
}

function deleteSelectedObject() {
    if (selectedObject) {
        if (selectedObject.objects) {
            groups = groups.filter(group => group !== selectedObject);
        } else {
            objects = objects.filter(obj => obj !== selectedObject);
        }
        selectedObject = null;
        saveState();
        clearCanvas();
        redrawObjects();
    }
}

function copySelectedObject() {
    if (selectedObject) {
        clipboard = Object.assign({}, selectedObject);
    }
}

function pasteObject() {
    if (clipboard) {
        const newObject = JSON.parse(JSON.stringify(clipboard));
        moveObject(newObject, 10, 10); // Offset pasted object slightly
        if (newObject.objects) {
            groups.push(newObject);
        } else {
            objects.push(newObject);
        }
        saveState();
        clearCanvas();
        redrawObjects();
    }
}

function saveDrawing() {
    const drawing = {
        objects: objects,
        groups: groups
    };
    const drawingStr = JSON.stringify(drawing);
    localStorage.setItem('drawing', drawingStr);
}

function loadDrawing() {
    const drawingStr = localStorage.getItem('drawing');
    if (drawingStr) {
        const drawing = JSON.parse(drawingStr);
        objects = drawing.objects;
        groups = drawing.groups;
        clearCanvas();
        redrawObjects();
    }
}
