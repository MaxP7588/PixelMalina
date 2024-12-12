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
      
      const paintColor = tools.currentTool === 'eraser' ? tools.ERASER_COLOR : tools.currentColor;
      
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

    // Event Listeners
    config.canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      isDrawingSequence = true;
      tools.saveState();
      const rect = config.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      paintCell(x, y);
    });

    config.canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = config.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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

    return {
      paintCell,
      paintCellWithoutSave
    };
  }
};

export default canvasEvents;