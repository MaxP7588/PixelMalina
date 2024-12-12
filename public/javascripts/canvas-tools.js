const canvasTools = {
  init: function(config) {
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clearBtn');
    const pencilBtn = document.getElementById('pencilBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const undoBtn = document.getElementById('undoBtn');
    const colorPresets = document.querySelectorAll('.color-preset');

    let currentTool = 'pencil';
    const ERASER_COLOR = '#FFFFFF';
    let currentColor = '#000000';
    let undoHistory = [];
    const MAX_HISTORY = 50;

    function saveState() {
      if (undoHistory.length >= MAX_HISTORY) {
        undoHistory.shift();
      }
      undoHistory.push(config.canvas.toDataURL());
      updateUndoButton();
    }

    function undo() {
      if (undoHistory.length > 0) {
        const img = new Image();
        img.src = undoHistory.pop();
        img.onload = function() {
          config.ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);
          config.ctx.drawImage(img, 0, 0);
          patterns.redrawTemplate();
          updateUndoButton();
        };
      }
    }

    function setActiveTool(tool) {
      currentTool = tool;
      pencilBtn.classList.toggle('active', tool === 'pencil');
      eraserBtn.classList.toggle('active', tool === 'eraser');
    }

    function updateUndoButton() {
      undoBtn.disabled = undoHistory.length === 0;
    }

    return {
      currentTool,
      ERASER_COLOR,
      currentColor,
      saveState,
      undo,
      setActiveTool,
      updateUndoButton
    };
  }
};

export default canvasTools;