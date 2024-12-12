const canvasPatterns = {
    init: function (config) {
        function drawGrid() {
            config.ctx.strokeStyle = '#ddd';
            config.ctx.lineWidth = 1;

            for (let x = 0; x <= config.canvas.width; x += config.CELL_WIDTH) {
                config.ctx.beginPath();
                config.ctx.moveTo(x, 0);
                config.ctx.lineTo(x, config.canvas.height);
                config.ctx.stroke();
            }

            for (let y = 0; y <= config.canvas.height; y += config.CELL_HEIGHT) {
                config.ctx.beginPath();
                config.ctx.moveTo(0, y);
                config.ctx.lineTo(config.canvas.width, y);
                config.ctx.stroke();
            }
        }

        function drawBrickPattern() {
            config.ctx.strokeStyle = '#ddd';
            config.ctx.lineWidth = 1;

            // Calcular número exacto de filas
            const numRows = Math.floor(config.canvas.height / config.CELL_HEIGHT);

            // Dibujar líneas horizontales
            for (let row = 0; row <= numRows; row++) {
                const y = row * config.CELL_HEIGHT;
                config.ctx.beginPath();
                config.ctx.moveTo(0, y);
                config.ctx.lineTo(config.canvas.width, y);
                config.ctx.stroke();
            }

            // Dibujar líneas verticales con offset alternado
            for (let row = 0; row < numRows; row++) {
                const y = row * config.CELL_HEIGHT;
                // Calcular offset basado en el índice de la fila
                const offset = row % 2 === 0 ? 0 : config.CELL_WIDTH / 2;

                // Calcular número de celdas en esta fila
                const numCells = Math.ceil(config.canvas.width / config.CELL_WIDTH) + (offset > 0 ? 1 : 0);

                // Dibujar líneas verticales para esta fila
                for (let col = 0; col < numCells; col++) {
                    const x = col * config.CELL_WIDTH + offset;
                    if (x <= config.canvas.width) {
                        config.ctx.beginPath();
                        config.ctx.moveTo(x, y);
                        config.ctx.lineTo(x, y + config.CELL_HEIGHT);
                        config.ctx.stroke();
                    }
                }
            }
        }

        function drawMixedPattern() {
            // Calcular el número de filas que serán de ladrillo (1/4 del total redondeado)
            const totalRows = Math.floor(config.canvas.height / config.CELL_HEIGHT);
            const brickRows = Math.max(1, Math.round(totalRows / 4));
            const quarterY = brickRows * config.CELL_HEIGHT;

            // Dibujar patrón de ladrillos en el cuarto superior
            config.ctx.save();
            config.ctx.beginPath();
            config.ctx.rect(0, 0, config.canvas.width, quarterY);
            config.ctx.clip();
            drawBrickPattern();
            config.ctx.restore();

            // Dibujar rejilla en los tres cuartos inferiores
            config.ctx.save();
            config.ctx.beginPath();
            config.ctx.rect(0, quarterY, config.canvas.width, config.canvas.height - quarterY);
            config.ctx.clip();
            drawGrid();
            config.ctx.restore();
        }

        function redrawTemplate() {
            switch (config.template) {
                case 'rejilla': drawGrid(); break;
                case 'ladrillo': drawBrickPattern(); break;
                case 'mixta': drawMixedPattern(); break;
            }
        }

        return {
            drawGrid,
            drawBrickPattern,
            drawMixedPattern,
            redrawTemplate
        };
    }
};

export default canvasPatterns;