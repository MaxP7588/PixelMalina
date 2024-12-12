window.onload = function() {
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const clearBtn = document.getElementById('clearBtn');

  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const template = params.get('template');
  const width = parseInt(params.get('width'));
  const height = parseInt(params.get('height'));

  // Tamaño de cada celda (proporción 4:3)
  const CELL_WIDTH = 40;
  const CELL_HEIGHT = 30;

  // Configurar tamaño del canvas
  canvas.width = width * CELL_WIDTH;
  canvas.height = height * CELL_HEIGHT;

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

    // Dibujar líneas horizontales
    for (let y = 0; y <= canvas.height; y += CELL_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Dibujar líneas verticales con offset alternado
    for (let y = 0; y < canvas.height; y += CELL_HEIGHT) {
      const offset = (y / CELL_HEIGHT) % 2 === 0 ? 0 : CELL_WIDTH / 2;
      for (let x = offset; x <= canvas.width; x += CELL_WIDTH) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + CELL_HEIGHT);
        ctx.stroke();
      }
    }
  }

  function drawMixedPattern() {
    const middleY = canvas.height / 2;

    // Dibujar patrón de ladrillos en la mitad superior
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, middleY);
    ctx.clip();
    drawBrickPattern();
    ctx.restore();

    // Dibujar rejilla en la mitad inferior
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, middleY, canvas.width, canvas.height - middleY);
    ctx.clip();
    drawGrid();
    ctx.restore();
  }

  function paintCell(x, y) {
    const row = Math.floor(y / CELL_HEIGHT);
    const col = Math.floor(x / CELL_WIDTH);
    
    if (template === 'ladrillo' || (template === 'mixta' && y < canvas.height / 2)) {
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