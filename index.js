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
  if (options.element.complete && options.element.naturalHeight !== 0) {
    nextFrame();
  } else {
    options.element.addEventListener('load', () => nextFrame());
  }

  /**
   * @param {MouseEvent} e
   * @param {boolean} [shiftSensitive]
   */
  const getMousePosition = (e, shiftSensitive = true) => {
    const { clientX, clientY } = e;
    const rect = canvas.getBoundingClientRect();
    const ret = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    if (shiftSensitive ? e.shiftKey : false) {
      if (!controllers.relativePoint && path.length) {
        controllers.relativePoint = path
          .filter(p => p !== controllers.selectedPoint)
          .reduce((a, b) => getDistance(ret, a) < getDistance(ret, b) ? a : b);
      }
      straightenLine(ret, controllers.relativePoint);
    } else {
      controllers.relativePoint = null;
    }
    return ret;
  }

  const controllers = {
    mousedown: false,
    startPos: {x: 0, y: 0},
    pos: {x: 0, y: 0},
    selectedPoint: null,
    relativePoint: null
  };
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  canvas.addEventListener('mousedown', (e) => {
    nextFrame();
    controllers.mousedown = true;
    controllers.startPos = getMousePosition(e, false);
    controllers.pos = getMousePosition(e);

    controllers.selectedPoint = path.find((p1) => getDistance(p1, controllers.pos) <= options.radius) || null;
  });
  canvas.addEventListener('mousemove', (e) => {
    controllers.pos = getMousePosition(e);
    if (controllers.mousedown) {
      if (controllers.selectedPoint) {
        controllers.selectedPoint.x = controllers.pos.x;
        controllers.selectedPoint.y = controllers.pos.y;
        onPathUpdate();
      }
    }
    nextFrame();
  });
  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      if (controllers.selectedPoint) {
        path.splice(path.indexOf(controllers.selectedPoint), 1);
      } else {
        const pointToRemove = path.find((p1) => getDistance(p1, controllers.pos) <= options.radius);
        if (pointToRemove) {
          path.splice(path.indexOf(pointToRemove), 1);
        }
      }
    } else {
      if (!controllers.selectedPoint) {
        path.push({x: controllers.pos.x, y: controllers.pos.y});
      } else if (controllers.selectedPoint === path[0]) {
        pathClosed = true;
      }
    }
    if (path.length < 3) {
      pathClosed = false;
    }
    controllers.mousedown = false;
    controllers.selectedPoint = null;
    controllers.relativePoint = null;
    onPathChange();
    onPathUpdate();
    nextFrame();
  });

  /**
   * @param {Point} point
   * @param {Point} [relative]
   */
  function straightenLine (point, relative) {
    if (!relative) {
      return;
    }
    const dx = Math.abs(relative.x - point.x);
    const dy = Math.abs(relative.y - point.y);
    if (dx > dy) {
      point.y = relative.y;
    } else {
      point.x = relative.x;
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
    },
    /**
     * @param {string} polygon
     */
    setPath (polygon) {
      const newPath = polygon.split(' ').map(s => {
        const [x, y] = s.split(',');
        return {x: parseInt(x, 10), y: parseInt(y, 10)};
      });
      path.length = 0;
      path.push(...newPath);
      pathClosed = true;
      nextFrame();
      onPathChange();
      onPathUpdate();
    }
  }
}

module.exports = createLasso;
