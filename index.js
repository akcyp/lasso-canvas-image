/**
 * @typedef {Object} options
 * @property {number} radius
 * @property {number} fps
 */

/**
 * Create Canvas Config
 * @param {HTMLImageElement} img
 * @param {(polygon: string) => void | boolean} onChange
 * @param {options} options
 */
function createLasso (img, onChange, options) {
  options = Object.assign({
    radius: 5,
    fps: 60
  }, options);

  // Replace elements
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  img.parentElement.replaceChild(canvas, img);


  const path = [];
  /**
   * @param {number} x
   * @param {number} y
   */
  const drawPoint = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, options.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(x - options.radius / 2, y - options.radius / 2);
    ctx.lineTo(x + options.radius / 2, y + options.radius / 2);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(x + options.radius / 2, y - options.radius / 2);
    ctx.lineTo(x - options.radius / 2, y + options.radius / 2);
    ctx.stroke();
    ctx.closePath();
  };
  const drawLine = (p1, p2) => {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
  }
  const draw = () => {
    ctx.drawImage(img, 0, 0);
    for (let i = 0; i < path.length; i++) {
      const {x, y} = path[i];
      drawPoint(x, y);
      if (i > 0) {
        drawLine(path[i - 1], path[i]);
      }
    }
  };
  const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  let lastFrame = Date.now();
  const nextFrame = () => {
    const refreshFrameTime = Date.now() - lastFrame;
    lastFrame = Date.now();
    clear();
    draw(); // refreshFrameTime / 1000
    setTimeout(() => {
      window.requestAnimationFrame(() => nextFrame());
    }, Math.max(0, 1000 / options.fps - refreshFrameTime));
  };
  nextFrame();

  let clicked = false;
  canvas.addEventListener('mousedown', (e) => {
    clicked = true;

  });
  canvas.addEventListener('mouseup', (e) => {
    clicked = false;

  });
  canvas.addEventListener('click', (e) => {
    // add point to path / relocate point
    const { clientX, clientY } = e;
    const rect = canvas.getBoundingClientRect();
    const point = {x: clientX - rect.left, y: clientY - rect.top};


    const nearlyPoint = path.find(({x, y}) => {
      return Math.hypot(x - point.x, y - point.y) <= options.radius;
    });
    if (nearlyPoint) {
      path.splice(path.indexOf(nearlyPoint), 1);
    } else {
      path.push(point);
    }
  });
}

module.exports = createLasso;
