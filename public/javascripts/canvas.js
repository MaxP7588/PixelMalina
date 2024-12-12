window.onload = function() {
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const clearBtn = document.getElementById('clearBtn');
  const pencilBtn = document.getElementById('pencilBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const colorPresets = document.querySelectorAll('.color-preset');
  const undoBtn = document.getElementById('undoBtn');

  // Variables para las herramientas
  let currentTool = 'pencil';
  const ERASER_COLOR = '#FFFFFF';

  // Agregar al inicio del window.onload, después de las variables
  let undoHistory = [];
  const MAX_HISTORY = 50; // Límite de estados guardados

  // Agregar después de las variables existentes
  let isDrawingSequence = false;

  // Función para guardar estado actual del canvas
  function saveState() {
    if (undoHistory.length >= MAX_HISTORY) {
      undoHistory.shift(); // Eliminar el estado más antiguo
    }
    undoHistory.push(canvas.toDataURL());
    updateUndoButton();
  }

  // Función para deshacer
  function undo() {
    if (undoHistory.length > 0) {
      const img = new Image();
      img.src = undoHistory.pop();
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        redrawTemplate();
        updateUndoButton();
      };
    }
  }

  // Función para manejar herramientas
  function setActiveTool(tool) {
    currentTool = tool;
    pencilBtn.classList.toggle('active', tool === 'pencil');
    eraserBtn.classList.toggle('active', tool === 'eraser');
  }

  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const template = params.get('template');
  const gridWidth = parseInt(params.get('width'));
  const gridHeight = parseInt(params.get('height'));

  // Calcular el tamaño de las celdas manteniendo la proporción 4:3
  const maxWidth = window.innerWidth * 1; // 80% del ancho de la ventana
  const maxHeight = window.innerHeight * 1; // 80% del alto de la ventana

  // Calcular tamaño de celda basado en las restricciones
  const cellWidthByWidth = maxWidth / gridWidth;
  const cellHeightByWidth = cellWidthByWidth * (3/4); // Mantener proporción 4:3
  
  const cellHeightByHeight = maxHeight / gridHeight;
  const cellWidthByHeight = cellHeightByHeight * (4/3); // Mantener proporción 4:3

  // Usar el tamaño más pequeño para asegurar que quepa en la pantalla
  const CELL_WIDTH = Math.min(cellWidthByWidth, cellWidthByHeight);
  const CELL_HEIGHT = CELL_WIDTH * (3/4);

  // Configurar tamaño del canvas
  canvas.width = gridWidth * CELL_WIDTH;
  canvas.height = gridHeight * CELL_HEIGHT;

  // Variables para dibujo
  let isDrawing = false;
  let currentColor = '#000000';

  function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    // Dibujar líneas verticales
    for (let x = 0; x <= canvas.width; x += CELL_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Dibujar líneas horizontales
    for (let y = 0; y <= canvas.height; y += CELL_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawBrickPattern() {
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
  
      // Calcular número exacto de filas
      const numRows = Math.floor(canvas.height / CELL_HEIGHT);
  
      // Dibujar líneas horizontales
      for (let row = 0; row <= numRows; row++) {
          const y = row * CELL_HEIGHT;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
      }
  
      // Dibujar líneas verticales con offset alternado
      for (let row = 0; row < numRows; row++) {
          const y = row * CELL_HEIGHT;
          // Calcular offset basado en el índice de la fila
          const offset = row % 2 === 0 ? 0 : CELL_WIDTH / 2;
          
          // Calcular número de celdas en esta fila
          const numCells = Math.ceil(canvas.width / CELL_WIDTH) + (offset > 0 ? 1 : 0);
          
          // Dibujar líneas verticales para esta fila
          for (let col = 0; col < numCells; col++) {
              const x = col * CELL_WIDTH + offset;
              if (x <= canvas.width) {
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(x, y + CELL_HEIGHT);
                  ctx.stroke();
              }
          }
      }
  }

  function drawMixedPattern() {
    // Calcular el número de filas que serán de ladrillo (1/4 del total redondeado)
    const totalRows = Math.floor(canvas.height / CELL_HEIGHT);
    const brickRows = Math.max(1, Math.round(totalRows / 4));
    const quarterY = brickRows * CELL_HEIGHT;

    // Dibujar patrón de ladrillos en el cuarto superior
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, quarterY);
    ctx.clip();
    drawBrickPattern();
    ctx.restore();

    // Dibujar rejilla en los tres cuartos inferiores
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, quarterY, canvas.width, canvas.height - quarterY);
    ctx.clip();
    drawGrid();
    ctx.restore();
  }

  // Modificar la función paintCell
  function paintCell(x, y) {
    if (!isDrawingSequence) {
      saveState();
    }
    paintCellWithoutSave(x, y);
  }

  // Nueva función paintCellWithoutSave (copia de la lógica de pintado sin saveState)
  function paintCellWithoutSave(x, y) {
    const row = Math.floor(y / CELL_HEIGHT);
    const col = Math.floor(x / CELL_WIDTH);
    
    const paintColor = currentTool === 'eraser' ? ERASER_COLOR : currentColor;
    
    const totalRows = Math.floor(canvas.height / CELL_HEIGHT);
    const brickRows = Math.max(1, Math.round(totalRows / 4));
    const quarterY = brickRows * CELL_HEIGHT;
    
    if (template === 'ladrillo' || (template === 'mixta' && y < quarterY)) {
      const offset = row % 2 === 0 ? 0 : CELL_WIDTH / 2;
      const adjustedCol = Math.floor((x - offset) / CELL_WIDTH);
      if (x >= offset) {
        ctx.fillStyle = paintColor;
        ctx.fillRect(adjustedCol * CELL_WIDTH + offset, row * CELL_HEIGHT, 
                    CELL_WIDTH, CELL_HEIGHT);
      }
    } else {
      ctx.fillStyle = paintColor;
      ctx.fillRect(col * CELL_WIDTH, row * CELL_HEIGHT, 
                  CELL_WIDTH, CELL_HEIGHT);
    }
    redrawTemplate();
  }

  function redrawTemplate() {
    switch(template) {
      case 'rejilla':
        drawGrid();
        break;
      case 'ladrillo':
        drawBrickPattern();
        break;
      case 'mixta':
        drawMixedPattern();
        break;
    }
  }

  // Modificar la función clear
  function clear() {
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawTemplate();
  }

  // Event Listeners
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    isDrawingSequence = true;
    // Guardar estado solo al comenzar a dibujar
    saveState();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    paintCell(x, y);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    paintCellWithoutSave(x, y); // Nueva función sin guardar estado
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    isDrawingSequence = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    isDrawingSequence = false;
  });

  colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
  });

  clearBtn.addEventListener('click', clear);

  // Agregar event listeners para las nuevas herramientas
  pencilBtn.addEventListener('click', () => setActiveTool('pencil'));
  eraserBtn.addEventListener('click', () => setActiveTool('eraser'));

  // Event listeners para los colores predefinidos
  colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      currentColor = color;
      colorPicker.value = color;
    });
  });

  // Agregar event listener para Ctrl+Z
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  });

  undoBtn.addEventListener('click', undo);

  // Función para actualizar estado del botón
  function updateUndoButton() {
    undoBtn.disabled = undoHistory.length === 0;
  }

  // Inicializar canvas
  redrawTemplate();
};