const canvasTools = {
  init: function(config, patterns) { // Agregar patterns como parámetro
    // Referencias DOM
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clearBtn');
    const pencilBtn = document.getElementById('pencilBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const undoBtn = document.getElementById('undoBtn');
    const colorPresets = document.querySelectorAll('.color-preset');
    const bucketBtn = document.getElementById('bucketBtn'); // Agregar referencia al nuevo botón

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
      console.log('Cambiando herramienta a:', tool);
      currentTool = tool;
      pencilBtn.classList.toggle('active', tool === 'pencil');
      eraserBtn.classList.toggle('active', tool === 'eraser');
      bucketBtn.classList.toggle('active', tool === 'bucket');
    }

    function updateUndoButton() {
      undoBtn.disabled = undoHistory.length === 0;
    }

    // Función para flood fill
    function floodFill(startX, startY) {
      // Agregar console.log para debug
      console.log('Iniciando flood fill en:', startX, startY);

      const startRow = Math.floor(startY / config.CELL_HEIGHT);
      const startCol = Math.floor(startX / config.CELL_WIDTH);
      
      // Obtener el color inicial del pixel exacto donde se hizo clic
      const imageData = config.ctx.getImageData(startX, startY, 1, 1);
      const startColor = imageData.data;
      
      console.log('Color inicial:', startColor);

      // Verificar si ya tiene el color deseado
      const fillRgb = hexToRgb(currentColor);
      const targetColor = [fillRgb.r, fillRgb.g, fillRgb.b, 255];
      
      if (colorsMatch(Array.from(startColor), targetColor)) {
        console.log('Mismos colores, retornando');
        return;
      }

      const queue = [[startRow, startCol]];
      const visited = new Set();

      function checkCell(row, col) {
        const key = `${row},${col}`;
        if (visited.has(key)) return false;
        if (row < 0 || row >= Math.floor(config.canvas.height / config.CELL_HEIGHT)) return false;
        if (col < 0 || col >= Math.floor(config.canvas.width / config.CELL_WIDTH)) return false;

        // Obtener color del centro de la celda
        const x = col * config.CELL_WIDTH;
        const y = row * config.CELL_HEIGHT;
        const cellData = config.ctx.getImageData(x, y, 1, 1).data;

        return colorsMatch(Array.from(cellData), Array.from(startColor));
      }

      while (queue.length > 0) {
        const [row, col] = queue.shift();
        const key = `${row},${col}`;

        if (visited.has(key)) continue;
        visited.add(key);

        // Verificar color antes de pintar
        if (!checkCell(row, col)) continue;

        // Pintar celda
        config.ctx.fillStyle = currentColor;
        const x = col * config.CELL_WIDTH;
        const y = row * config.CELL_HEIGHT;
        config.ctx.fillRect(x, y, config.CELL_WIDTH, config.CELL_HEIGHT);

        // Agregar vecinos
        queue.push(
          [row - 1, col],
          [row + 1, col],
          [row, col - 1],
          [row, col + 1]
        );
      }

      console.log('Flood fill completado');
      patterns.redrawTemplate();
    }

    // Función auxiliar para convertir hex a rgb
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    // Función auxiliar para comparar colores
    function colorsMatch(color1, color2) {
      // Agregar tolerancia para comparación de colores
      const tolerance = 5;
      return Math.abs(color1[0] - color2[0]) <= tolerance &&
             Math.abs(color1[1] - color2[1]) <= tolerance &&
             Math.abs(color1[2] - color2[2]) <= tolerance &&
             Math.abs(color1[3] - color2[3]) <= tolerance;
    }

    return {
      get currentTool() { return currentTool; },
      get currentColor() { return currentColor; },
      set currentColor(value) { currentColor = value; },
      ERASER_COLOR,
      saveState,
      undo,
      setActiveTool,
      updateUndoButton,
      clearCache: stateCache.clear, // Exponer método para limpiar cache
      floodFill
    };
  }
};

export default canvasTools;