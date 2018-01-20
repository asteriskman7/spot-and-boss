'use strict';

let game = {
  canvas: undefined,
  ctx: undefined,
  resizeTimeout: undefined,
  lastTick: undefined,
  titleMode: undefined,
  buttons: undefined,
  mousePos: undefined,
  init: function() {
    console.log('init');

    game.canvas = document.getElementById('cmain');
    game.ctx = game.canvas.getContext('2d');

    window.onresize = game.resizeStart;
    game.canvas.onclick = game.canvasClick;
    game.canvas.onmousemove = game.canvasMouseMove;

    game.lastTick = 0;
    game.titleMode = true;
    game.buttons = [];
    game.mousePos = {x: 0, y: 0};
    game.hoverColor = '#11111110';

    game.createButton(game.canvas.width * 0.5 - 120, game.canvas.height * 0.66 - 20, 240, 40,
      "30px 'Russo One'", '#FFFF00', '#0000FF', 'START GAME', game.startGame);

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
      game.ctx.textBaseline = 'middle';

      game.ctx.fillText('S.P.O.T & B.O.S.S', game.canvas.width * 0.5, game.canvas.height * 0.3);

    } else {

    }

    game.drawButtons();

    game.ctx.restore();
  },
  startGame: function() {
    game.buttons = [];
    game.titleMode = false;
  },
  createButton: function(x, y, w, h, font, bgcolor, fgcolor, text, callback) {
    //x,y are the upper left corner
    game.buttons.push({rect: {x: x, y: y, w: w, h: h}, font: font, bgcolor: bgcolor,
      fgcolor: fgcolor, text: text, callback: callback});
  },
  drawButtons: function() {
    game.ctx.save();
    game.ctx.textAlign = 'center';
    game.ctx.textBaseline = 'middle';
    game.buttons.forEach((v) => {
      let hover = game.isPointInRect(game.mousePos, v.rect);
      //draw background
      game.ctx.fillStyle = v.bgcolor;
      game.ctx.fillRect(v.rect.x, v.rect.y, v.rect.w, v.rect.h);
      //draw text
      game.ctx.font = v.font;
      game.ctx.fillStyle = v.fgcolor;
      game.ctx.fillText(v.text, v.rect.x + v.rect.w * 0.5 , v.rect.y + v.rect.h * 0.5);
      if (hover) {
        game.ctx.fillStyle = game.hoverColor;
        game.ctx.fillRect(v.rect.x, v.rect.y, v.rect.w, v.rect.h);
      }
      //draw outline
      game.ctx.strokeStyle = '#000000';
      game.ctx.lineWidth = hover ? 3 : 1;

      game.ctx.strokeRect(v.rect.x, v.rect.y, v.rect.w, v.rect.h);
    });
    game.ctx.restore();
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
    return (point.x >= rect.x) && (point.x <= rect.x + rect.w) && (point.y <= rect.y + rect.h) && (point.y >= rect.y);
  },
  canvasMouseMove: function(event) {
    let pos = game.getCursorPosition(event);
    game.mousePos = pos;
  }
};

game.init();
