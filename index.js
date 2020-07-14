/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} LassoOptions
 * @property {HTMLImageElement} element
 * @property {number} radius
 * @property {(polygon: string) => void} onChange
 * @property {(polygon: string) => void} onUpdate
 */

/**
 * Create Canvas Config
 * @param {LassoOptions} options
 */
function createLasso (options) {
  if (!(options.element instanceof HTMLImageElement)) {
    throw new Error('options.element is not a HTMLImageElement instance');
  }
  if (!options.element.parentElement) {
    throw new Error('options.element have no parentElement');
  }
  options = Object.assign({
    radius: 5,
    onChange: Function.prototype,
    onUpdate: Function.prototype
  }, options);

  // Replace elements
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = options.element.width;
  canvas.height = options.element.height;
  options.element.parentElement.replaceChild(canvas, options.element);

  /**
   * @type {Point[]}
   */
  const path = [];
  let pathClosed = false;

  /**
   * @param {() => void} fn
   */
  const addCtxPath = (fn) => {
    ctx.save();
    ctx.beginPath();
    fn();
    ctx.closePath();
    ctx.restore();
  }
  /**
   * @param {number} x
   * @param {number} y
   */
  const drawPoint = (x, y) => {
    addCtxPath(() => {
      ctx.arc(x, y, options.radius, 0, 2 * Math.PI);
      ctx.stroke();
    });

    addCtxPath(() => {
      ctx.moveTo(x - options.radius / 2, y - options.radius / 2);
      ctx.lineTo(x + options.radius / 2, y + options.radius / 2);
      ctx.stroke();
    });

    addCtxPath(() => {
      ctx.moveTo(x + options.radius / 2, y - options.radius / 2);
      ctx.lineTo(x - options.radius / 2, y + options.radius / 2);
      ctx.stroke();
    });
  };
  /**
   * @param {Point} p1
   * @param {Point} p2
   */
  const drawLine = (p1, p2) => {
    addCtxPath(() => {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
  }
  const nextFrame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(options.element, 0, 0, canvas.width, canvas.height);
    for (let i = 0; i < path.length; i++) {
      const {x, y} = path[i];
      drawPoint(x, y);
      if (i > 0) {
        drawLine(path[i - 1], path[i]);
      }
    }
    if (pathClosed) {
      if (path.length > 1) {
        drawLine(path[0], path[path.length - 1]);
      }
      addCtxPath(() => {
      ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          const {x, y} = path[i];
          ctx.lineTo(x, y);
        }
        ctx.fillStyle = 'rgba(134, 228, 35, 0.45)';
        ctx.fill();
      });
    } else if (path.length && !controllers.selectedPoint) {
      const {x, y} = getDistance(path[0], controllers.pos) <= options.radius ? path[0] : controllers.pos;
      drawPoint(x, y);
      drawLine(path[path.length - 1], {x, y});
    }
  };

  /**
   * @param {MouseEvent} e
   */
  const getMousePosition = (e) => {
    const { clientX, clientY } = e;
    const rect = canvas.getBoundingClientRect();
    const ret = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    if (e.shiftKey) {
      straightenLine(ret);
    }
    return ret;
  }

  const controllers = {
    mousedown: false,
    startPos: {x: 0, y: 0},
    pos: {x: 0, y: 0},
    selectedPoint: null
  };
  canvas.addEventListener('mousedown', (e) => {
    nextFrame();
    controllers.mousedown = true;
    controllers.startPos = getMousePosition(e);
    controllers.pos = getMousePosition(e);

    controllers.selectedPoint = path.find((p1) => getDistance(p1, controllers.pos) <= options.radius) || null;
  });
  canvas.addEventListener('mousemove', (e) => {
    controllers.pos = getMousePosition(e);
    if (controllers.mousedown) {
      if (controllers.selectedPoint) {
        controllers.selectedPoint.x = controllers.pos.x;
        controllers.selectedPoint.y = controllers.pos.y;
        if (e.shiftKey) {
          straightenLine(controllers.selectedPoint);
        }
        onPathUpdate();
      }
    }
    nextFrame();
  });
  canvas.addEventListener('mouseup', () => {
    if (!controllers.selectedPoint) {
      path.push({x: controllers.pos.x, y: controllers.pos.y});
    } else if (controllers.selectedPoint === path[0]) {
      pathClosed = true;
    }
    controllers.mousedown = false;
    controllers.selectedPoint = null;
    onPathChange();
    onPathUpdate();
    nextFrame();
  });

  /**
   * @param {Point} point
   */
  function straightenLine (point) {
    let lastPoint = path[path.length - 1];
    if (point === lastPoint) {
      lastPoint = path[path.length - 2];
    }
    const dx = Math.abs(lastPoint.x - point.x);
    const dy = Math.abs(lastPoint.y - point.y);
    if (dx > dy) {
      point.y = lastPoint.y;
    } else {
      point.x = lastPoint.x;
    }
  }
  /**
   * @param {Point} p1
   * @param {Point} p2
   */
  function getDistance (p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
  function pathToString () {
    return path.map(({x, y}) => x + ',' + y).join(' ');
  }
  function onPathChange () {
    const polygon = pathToString();
    options.onChange(polygon);
  }
  function onPathUpdate () {
    const polygon = pathToString();
    options.onUpdate(polygon);
  }
  return {
    reset() {
      path.length = 0;
      pathClosed = false;
      nextFrame();
      onPathChange();
      onPathUpdate();
    }
  }
}

module.exports = createLasso;
