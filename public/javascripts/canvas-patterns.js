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