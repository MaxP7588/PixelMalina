import canvasConfig from './canvas-config.js';
import canvasTools from './canvas-tools.js';
import canvasPatterns from './canvas-patterns.js';
import canvasEvents from './canvas-events.js';

window.onload = function() {
  const config = canvasConfig.init();
  const tools = canvasTools.init(config);
  const patterns = canvasPatterns.init(config);
  const events = canvasEvents.init(config, tools, patterns);

  // Inicializar canvas
  patterns.redrawTemplate();
};