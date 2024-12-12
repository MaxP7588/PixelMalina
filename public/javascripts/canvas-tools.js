const canvasTools = {
  init: function(config, patterns) { // Agregar patterns como parámetro
    // Referencias DOM
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clearBtn');
    const pencilBtn = document.getElementById('pencilBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const undoBtn = document.getElementById('undoBtn');
    const colorPresets = document.querySelectorAll('.color-preset');

    // Estado interno
    let currentTool = 'pencil';
    const ERASER_COLOR = '#FFFFFF';
    let currentColor = '#000000';
    let undoHistory = [];
    const MAX_HISTORY = 50;

    // Cache mejorado
    const stateCache = {
      lastState: null,
      timestamp: null,
      size: 0,
      MAX_CACHE_SIZE: 5 * 1024 * 1024,
      isCompressed: new WeakMap(), // Rastrear estados comprimidos
      compress: function(dataUrl) {
        return dataUrl.replace(/^data:image\/\w+;base64,/, '');
      },
      decompress: function(data) {
        return this.isCompressed.get(data) ? 
          `data:image/png;base64,${data}` : data;
      },
      clear: function() {
        this.lastState = null;
        this.timestamp = null;
        this.size = 0;
        this.isCompressed = new WeakMap();
      }
    };

    function saveState() {
      try {
        const currentState = config.canvas.toDataURL();
        const currentTime = Date.now();
        
        if (currentState === stateCache.lastState) return;

        const compressedState = stateCache.compress(currentState);
        const stateSize = compressedState.length;

        if (stateCache.size + stateSize > stateCache.MAX_CACHE_SIZE) {
          clearOldCache();
        }

        if (undoHistory.length >= MAX_HISTORY) {
          const removedState = undoHistory.shift();
          stateCache.size -= stateCache.compress(removedState).length;
        }
        
        undoHistory.push(currentState);
        stateCache.lastState = currentState;
        stateCache.timestamp = currentTime;
        stateCache.size += stateSize;
        stateCache.isCompressed.set(compressedState, true);
        
        updateUndoButton();
      } catch (error) {
        console.error('Error al guardar estado:', error);
        stateCache.clear();
      }
    }

    function clearOldCache() {
      const halfSize = stateCache.MAX_CACHE_SIZE / 2;
      while (undoHistory.length > 0 && stateCache.size > halfSize) {
        const oldState = undoHistory.shift();
        const compressedOldState = stateCache.compress(oldState);
        stateCache.size -= compressedOldState.length;
        stateCache.isCompressed.delete(compressedOldState);
      }
    }

    function undo() {
      if (undoHistory.length > 0) {
        const img = new Image();
        const lastState = undoHistory.pop();
        
        // Actualizar tamaño del cache
        stateCache.size -= stateCache.compress(lastState).length;
        stateCache.lastState = undoHistory[undoHistory.length - 1] || null;
        
        img.src = lastState;
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
      updateUndoButton,
      clearCache: stateCache.clear // Exponer método para limpiar cache
    };
  }
};

export default canvasTools;