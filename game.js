'use strict';

let game = {
  canvas: undefined,
  ctx: undefined,
  resizeTimeout: undefined,
  lastTick: undefined,
  titleMode: undefined,
  buttons: undefined,
  init: function() {
    console.log('init');

    game.canvas = document.getElementById('cmain');
    game.ctx = game.canvas.getContext('2d');

    window.onresize = game.resizeStart;
    game.canvas.onclick = game.canvasClick;

    game.lastTick = 0;
    game.titleMode = true;
    game.buttons = [];
    game.resizeEnd();
    game.tick();
  },
  resizeStart: function() {
    clearTimeout(game.resizeTimeout);
    game.resizeTimeout = setTimeout(game.resizeEnd, 500);
  },
  resizeEnd: function() {
    let iw = window.innerWidth;
    let ih = window.innerHeight;
    let borderSize = 10;

    let freeSize = Math.min(iw, ih);
    let size = freeSize - 2 * borderSize;

    game.canvas.style.width = size;
    game.canvas.style.height = size;

    game.canvas.style.top = (ih - size) * 0.5;
    game.canvas.style.left = (iw - size) * 0.5;
  },
  tick: function(timestamp) {
    let delta = timestamp - game.lastTick;

    game.update(timestamp, delta);
    game.draw(timestamp, delta);

    game.lastTick = timestamp;
    window.requestAnimationFrame(game.tick);
  },
  update: function(timestamp, delta) {

  },
  draw: function(timestamp, delta) {
    game.ctx.save();
    game.ctx.clearRect(0,0,600,600);
    if (game.titleMode) {
      game.ctx.font = "50px 'Russo One'";
      game.ctx.textAlign = 'center';
      if (timestamp < 1000) {
        //draw off the screen to force font loading
        game.ctx.fillText('loading', 10000, 10000);
      } else {
        game.ctx.fillText('S.P.O.T & B.O.S.S', game.canvas.width * 0.5, game.canvas.height * 0.3);
        game.ctx.font = "30px 'Russo One'";
        game.ctx.fillText('START GAME', game.canvas.width * 0.5, game.canvas.height * 0.66);
        let startWidth = game.ctx.measureText('START GAME').width;
        if (game.startButtonCreated === undefined) {
          game.createButton(game.canvas.width * 0.5 - startWidth * 0.5, game.canvas.height * 0.66 + 15, game.canvas.width * 0.5 + startWidth * 0.5,
          game.canvas.height * 0.66 - 15, () => {console.log('button press'); game.titleMode = false;});
          game.startButtonCreated = true;
        }
      }
    } else {

    }
    game.ctx.restore();
  },
  createButton: function(xll, yll, xur, yur, callback) {
    game.buttons.push({rect: {xll: xll, yll: yll, xur: xur, yur: yur}, callback: callback});
  },
  canvasClick: function(event) {
    let pos = game.getCursorPosition(event);
    //console.log(pos);
    game.buttons.forEach((v) => {
      if (game.isPointInRect(pos, v.rect)) {
        v.callback();
      }
    });
  },
  getCursorPosition: function(event) {
    //modified from https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    let rect = game.canvas.getBoundingClientRect();
    let absx = event.clientX - rect.left;
    let absy = event.clientY - rect.top;
    let relx = absx * game.canvas.width / game.canvas.style.width.slice(0,-2);
    let rely = absy * game.canvas.height / game.canvas.style.height.slice(0,-2);
    return {x: relx, y: rely};
  },
  isPointInRect(point, rect) {
    return point.x >= rect.xll && point.x <= rect.xur && point.y <= rect.yll && point.y >= rect.yur;
  }
};

game.init();
