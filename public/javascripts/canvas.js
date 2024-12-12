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

    // Dibujar rejilla en la mitad