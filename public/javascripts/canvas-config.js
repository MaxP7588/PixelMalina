const canvasConfig = {
  init: function() {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const template = params.get('template');
    const gridWidth = parseInt(params.get('width'));
    const gridHeight = parseInt(params.get('height'));

    // Calcular dimensiones
    const maxWidth = window.innerWidth * 1;
    const maxHeight = window.innerHeight * 1;
    const cellWidthByWidth = maxWidth / gridWidth;
    const cellHeightByWidth = cellWidthByWidth * (3/4);
    const cellHeightByHeight = maxHeight / gridHeight;
    const cellWidthByHeight = cellHeightByHeight * (4/3);
    const CELL_WIDTH = Math.min(cellWidthByWidth, cellWidthByHeight);
    const CELL_HEIGHT = CELL_WIDTH * (3/4);

    // Configurar canvas
    canvas.width = gridWidth * CELL_WIDTH;
    canvas.height = gridHeight * CELL_HEIGHT;

    return {
      canvas,
      ctx,
      template,
      CELL_WIDTH,
      CELL_HEIGHT
    };
  }
};

export default canvasConfig;