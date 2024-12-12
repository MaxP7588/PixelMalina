const canvasEvents = {
  init: function(config, tools, patterns) {
    let isDrawing = false;
    let isDrawingSequence = false;

    function paintCell(x, y) {
      if (!isDrawingSequence) {
        tools.saveState();
      }
      paintCellWithoutSave(x, y);
    }

    function paintCellWithoutSave(x, y) {
      const row = Math.floor(y / config.CELL_HEIGHT);
      const col = Math.floor(x / config.CELL_WIDTH);
      
      // Modificar esta parte para usar el getter
      const paintColor = tools.currentTool === 'eraser' ? 
        tools.ERASER_COLOR : tools.currentColor;
      
      const totalRows = Math.floor(config.canvas.height / config.CELL_HEIGHT);
      const brickRows = Math.max(1, Math.round(totalRows / 4));
      const quarterY = brickRows * config.CELL_HEIGHT;
      
      if (config.template === 'ladrillo' || (config.template === 'mixta' && y < quarterY)) {
        const offset = row % 2 === 0 ? 0 : config.CELL_WIDTH / 2;
        const adjustedCol = Math.floor((x - offset) / config.CELL_WIDTH);
        if (x >= offset) {
          config.ctx.fillStyle = paintColor;
          config.ctx.fillRect(adjustedCol * config.CELL_WIDTH + offset, row * config.CELL_HEIGHT, 
                      config.CELL_WIDTH, config.CELL_HEIGHT);
        }
      } else {
        config.ctx.fillStyle = paintColor;
        config.ctx.fillRect(col * config.CELL_WIDTH, row * config.CELL_HEIGHT, 
                    config.CELL_WIDTH, config.CELL_HEIGHT);
      }
      patterns.redrawTemplate();
    }

    // Funciones de exportación/importación
    function exportDrawing() {
      const imageData = config.ctx.getImageData(0, 0, config.canvas.width, config.canvas.height);
      const drawingData = {
        width: config.canvas.width,
        height: config.canvas.height,
        template: config.template,
        data: Array.from(imageData.data)
      };
      
      const blob = new Blob([JSON.stringify(drawingData)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-drawing.json';
      a.click();
      
      URL.revokeObjectURL(url);
    }
    
    function importDrawing(file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const drawingData = JSON.parse(e.target.result);
        
        // Restaurar dimensiones
        config.canvas.width = drawingData.width;
        config.canvas.height = drawingData.height;
        
        // Restaurar datos de imagen
        const imageData = new ImageData(
          new Uint8ClampedArray(drawingData.data),
          drawingData.width,
          drawingData.height
        );
        
        config.ctx.putImageData(imageData, 0, 0);
        patterns.redrawTemplate();
      };
      reader.readAsText(file);
    }

    // Event Listeners
    config.canvas.addEventListener('mousedown', (e) => {
      const rect = config.canvas.getBoundingClientRect();
      const scaleX = config.canvas.width / rect.width;
      const scaleY = config.canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Agregar console.log para debug
      console.log('Herramienta actual:', tools.currentTool);

      if (tools.currentTool === 'bucket') {
        tools.saveState();
        tools.floodFill(x, y);
      } else {
        isDrawing = true;
        isDrawingSequence = true;
        tools.saveState();
        paintCell(x, y);
      }
    });

    config.canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = config.canvas.getBoundingClientRect();
      const scaleX = config.canvas.width / rect.width;
      const scaleY = config.canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      paintCellWithoutSave(x, y);
    });

    config.canvas.addEventListener('mouseup', () => {
      isDrawing = false;
      isDrawingSequence = false;
    });

    config.canvas.addEventListener('mouseleave', () => {
      isDrawing = false;
      isDrawingSequence = false;
    });

    // Event listeners para herramientas
    document.getElementById('colorPicker').addEventListener('change', (e) => {
      tools.currentColor = e.target.value;
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      tools.saveState();
      config.ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);
      patterns.redrawTemplate();
    });

    document.getElementById('pencilBtn').addEventListener('click', () => {
      tools.setActiveTool('pencil');
    });

    document.getElementById('eraserBtn').addEventListener('click', () => {
      tools.setActiveTool('eraser');
    });

    document.getElementById('bucketBtn').addEventListener('click', () => {
      tools.setActiveTool('bucket');
    });

    document.getElementById('undoBtn').addEventListener('click', tools.undo);

    // Event listeners para los colores predefinidos
    document.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        tools.currentColor = color;
        document.getElementById('colorPicker').value = color;
      });
    });

    // Event listener para Ctrl+Z
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        tools.undo();
      }
    });

    // Event listeners para los nuevos botones
    document.getElementById('exportBtn').addEventListener('click', exportDrawing);

    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importDrawing(e.target.files[0]);
      }
    });

    return {
      paintCell,
      paintCellWithoutSave
    };
  }
};

export default canvasEvents;