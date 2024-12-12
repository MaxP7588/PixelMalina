window.onload = function() {
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const clearBtn = document.getElementById('clearBtn');

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

  function paintCell(x, y) {
    const row = Math.floor(y / CELL_HEIGHT);
    const col = Math.floor(x / CELL_WIDTH);
    
    // Calcular el límite de filas para el patrón de ladrillo
    const totalRows = Math.floor(canvas.height / CELL_HEIGHT);
    const brickRows = Math.max(1, Math.round(totalRows / 4));
    const quarterY = brickRows * CELL_HEIGHT;
    
    if (template === 'ladrillo' || (template === 'mixta' && y < quarterY)) {
        // Lógica de pintura para patrón de ladrillo
        const offset = row % 2 === 0 ? 0 : CELL_WIDTH / 2;
        const adjustedCol = Math.floor((x - offset) / CELL_WIDTH);
        if (x >= offset) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(adjustedCol * CELL_WIDTH + offset, row * CELL_HEIGHT, 
                        CELL_WIDTH, CELL_HEIGHT);
        }
    } else {
        // Lógica de pintura para patrón de rejilla
        ctx.fillStyle = currentColor;
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

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawTemplate();
  }

  // Event Listeners
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
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
    paintCell(x, y);
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
  });

  clearBtn.addEventListener('click', clear);

  // Inicializar canvas
  redrawTemplate();
};