'use strict';

let game = {
  canvas: undefined,
  ctx: undefined,
  resizeTimeout: undefined,
  lastTick: undefined,
  titleMode: undefined,
  buttons: undefined,
  mousePos: undefined,
  world: undefined,
  scale: undefined,
  physicsEnabled: undefined,
  plugJoint: undefined,
  pressedKeys: undefined,
  touchScreen: undefined,
  init: function() {
    console.log('init');

    game.canvas = document.getElementById('cmain');
    game.ctx = game.canvas.getContext('2d');

    window.onresize = game.resizeStart;
    game.canvas.onclick = game.canvasClick;
    game.canvas.onmousemove = game.canvasMouseMove;
    game.canvas.ontouchstart = game.onTouchStart;
    game.canvas.ontouchend = game.onTouchEnd;

    game.lastTick = 0;
    game.titleMode = true;
    game.buttons = [];
    game.hoverColor = '#11111110';
    game.scale = 75; //75 pixels per meter
    game.physicsEnabled = true;
    game.touchScreen = false;

    game.createButton(game.canvas.width * 0.5 - 120, game.canvas.height * 0.66 - 20, 240, 40,
      "30px 'Russo One'", '#FFFF00', '#0000FF', '#000000', 'START GAME', game.startGame);

    //game.music = new Audio('./spot_and_boss_intro2.mp3');
    //game.music.oncanplaythrough = () => game.music.play();

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
    game.canvas.style.background = '#FFFFFF';
  },
  tick: function(timestamp) {
    let delta = timestamp - game.lastTick;

    game.update(timestamp, delta);
    game.draw(timestamp, delta);



    game.lastTick = timestamp;
    window.requestAnimationFrame(game.tick);
  },
  update: function(timestamp, delta) {
    if (game.titleMode) {

    } else {
      if (game.physicsEnabled) {
        if (game.plugJoint) {
          if (game.pressedKeys.ArrowRight) {
            game.spot.ApplyForce(new b2Vec2(1, 0), game.spot.GetWorldCenter());
          }
          if (game.pressedKeys.ArrowLeft) {
            game.spot.ApplyForce(new b2Vec2(-1, 0), game.spot.GetWorldCenter());
          }
        }

        game.world.Step(1/60, 2, 2);
        game.world.ClearForces();

        let spotPos = game.spot.GetPosition();
        if (spotPos.x > 6.3 && game.plugJoint) {
          game.world.DestroyJoint(game.plugJoint);
          game.plugJoint = undefined;
        }
      }
    }
  },
  draw: function(timestamp, delta) {
    let ctx = game.ctx;
    ctx.save();
    ctx.clearRect(0,0,600,600);
    if (game.titleMode) {
      ctx.font = "50px 'Russo One'";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText('S.P.O.T & B.O.S.S', game.canvas.width * 0.5, game.canvas.height * 0.3);

    } else {
      let lastCordPos;
      let cordWidth;
      game.cordPieces.forEach((b) => {
        let userData = b.GetUserData();
        let pos = b.GetPosition();
        ctx.save();

        cordWidth = userData.width; //save for connection to spot
        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = userData.width * game.scale;
        ctx.beginPath();
        ctx.moveTo(pos.x * game.scale, pos.y * game.scale);

        if (lastCordPos === undefined) {
          if (game.plugJoint) {
            ctx.lineTo(0, pos.y * game.scale);
          }
        } else {
          ctx.lineTo(lastCordPos.x * game.scale, lastCordPos.y * game.scale);
        }
        ctx.stroke();

        ctx.translate(pos.x * game.scale, pos.y * game.scale);
        ctx.rotate(b.GetAngle());
        ctx.translate(-pos.x * game.scale, -pos.y * game.scale);
        ctx.fillStyle = "#AAAAAA";
        //fill main cord piece
        let heightFactor = 1.0;
        /*ctx.fillRect(
          (pos.x - userData.width / 2) * game.scale,
          (pos.y - (userData.height * heightFactor) / 2) * game.scale,
          userData.width * game.scale,
          userData.height * game.scale * heightFactor
        );
        //draw cord outlines on top and bottom
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo((pos.x - userData.width / 2) * game.scale, (pos.y - userData.height / 2) * game.scale);
        ctx.lineTo((pos.x - userData.width / 2) * game.scale, (pos.y + userData.height / 2) * game.scale);
        ctx.moveTo((pos.x + userData.width / 2) * game.scale, (pos.y - userData.height / 2) * game.scale);
        ctx.lineTo((pos.x + userData.width / 2) * game.scale, (pos.y + userData.height / 2) * game.scale);
        ctx.stroke();
        */

        ctx.restore();
        lastCordPos = pos;
      });

      //connect cord to spot
      let spotPos = game.spot.GetPosition();
      ctx.save();
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = cordWidth * game.scale;
      ctx.beginPath();
      ctx.moveTo(lastCordPos.x * game.scale, lastCordPos.y * game.scale);
      ctx.lineTo(spotPos.x * game.scale, spotPos.y * game.scale);
      ctx.stroke();
      ctx.restore();

      for (let b = game.world.GetBodyList(); b; b = b.m_next) {
        let userData = b.GetUserData();
        if (userData === null) {
          userData = {type: 'none'};
        }
        let pos = b.GetPosition();
        ctx.save();
        ctx.translate(pos.x * game.scale, pos.y * game.scale);
        ctx.rotate(b.GetAngle());
        ctx.translate(-pos.x * game.scale, -pos.y * game.scale);
        switch (userData.type) {
          case 'spot':
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(
              (pos.x - userData.width / 2) * game.scale,
              (pos.y - userData.height / 2) * game.scale,
              userData.width * game.scale,
              userData.height * game.scale
            );
            break;
          case 'cord':
            /*
            ctx.fillStyle = "#AAAAAA";
            ctx.fillRect(
              (pos.x - userData.width / 2) * game.scale,
              (pos.y - userData.height / 2) * game.scale,
              userData.width * game.scale,
              userData.height * game.scale
            );
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo((pos.x - userData.width / 2) * game.scale, (pos.y - userData.height / 2) * game.scale);
            ctx.lineTo((pos.x - userData.width / 2) * game.scale, (pos.y + userData.height / 2) * game.scale);
            ctx.moveTo((pos.x + userData.width / 2) * game.scale, (pos.y - userData.height / 2) * game.scale);
            ctx.lineTo((pos.x + userData.width / 2) * game.scale, (pos.y + userData.height / 2) * game.scale);
            ctx.stroke();
            */
            break;
          case 'wall':
            ctx.fillStyle = "#77612f";
            ctx.fillRect(
              (pos.x - userData.width / 2) * game.scale,
              (pos.y - userData.height / 2) * game.scale,
              userData.width * game.scale,
              userData.height * game.scale
            );
            break;
          case 'ground':
            break;
          default:
            throw `Unknown body type ${userData.type}`;
        }

        ctx.restore();
      }

    }

    game.drawButtons();

    game.ctx.restore();
  },
  startGame: function() {
    game.buttons = [];
    game.titleMode = false;

    //set up Box2D
    game.world = new b2World(new b2Vec2(0, 10), true);
    game.world.GetBodyList().SetUserData({type: 'ground'}); //not sure what this line does

    //create walls
    //let floor = game.createWall(0, (game.canvas.height - 50) / game.scale, game.canvas.width / game.scale, 10 / game.scale);
    let floor = game.createWall(0, (game.canvas.height - 50) / game.scale, 6, 10 / game.scale);
    let stepDown = game.createWall(6, (game.canvas.height - 50) / game.scale, 10 / game.scale, 2);
    let ground = game.createWall(6, (game.canvas.height - 10) / game.scale, 2, 20 / game.scale );
    let leftWall = game.createWall(-10 / game.scale, 0, 20 / game.scale, game.canvas.height / game.scale);
    //create spot
    game.spot = game.createBox(250 / game.scale, 250 / game.scale, 0.5, 0.5, 'spot');
    //create cord
    let revolute_joint = new b2RevoluteJointDef();
    let lastLink = leftWall;
    let lastAnchorPoint = new b2Vec2(0.1, (game.canvas.height * 0.5) / game.scale - 1);
    let boxSize = 0.25;
    game.cordPieces = [];
    for (let i = 0; i < 20; i++) {
      let body = game.createBox(3 , 3, boxSize * 0.25, boxSize, 'cord');
      game.cordPieces.push(body);

      revolute_joint.bodyA = lastLink;
      revolute_joint.bodyB = body;
      revolute_joint.localAnchorA = lastAnchorPoint;
      revolute_joint.localAnchorB = new b2Vec2(0, boxSize / 2);
      lastAnchorPoint = new b2Vec2(0, - boxSize / 2);
      let joint = game.world.CreateJoint(revolute_joint);
      if (game.plugJoint === undefined) {
        game.plugJoint = joint;
      }
      lastLink = body;
    }

    revolute_joint.bodyA = lastLink;
    revolute_joint.bodyB = game.spot;
    revolute_joint.localAnchorA = lastAnchorPoint;
    revolute_joint.localAnchorB = new b2Vec2(-boxSize, 0);
    game.world.CreateJoint(revolute_joint);

    let resetSteps = 50;
    for (let i = 0; i < resetSteps; i++) {
      //game.spot.ApplyForce(new b2Vec2(-1, 0), game.spot.GetWorldCenter());
      game.world.Step(1/60, 2, 2);
      game.world.ClearForces();
    }
    for (let i = 0; i < resetSteps; i++) {
      game.spot.ApplyForce(new b2Vec2(-1, 0), game.spot.GetWorldCenter());
      game.world.Step(1/60, 2, 2);
      game.world.ClearForces();
    }


    game.pressedKeys = {};
    game.canvas.parentElement.onkeydown = game.onkeydown;
    game.canvas.parentElement.onkeyup = game.onkeyup;

    if (game.touchScreen) {
      let touchButtonSize = 100;
      game.createButton(0, (game.canvas.height - touchButtonSize) * 0.5, touchButtonSize, touchButtonSize,
       "30px 'Russo One'", '#80808020', '#80808060', '#00000000', '<', game.doLeftTouch);
      game.createButton(game.canvas.width - touchButtonSize, (game.canvas.height - touchButtonSize)* 0.5, touchButtonSize, touchButtonSize,
       "30px 'Russo One'", '#80808020', '#80808060', '#00000000', '>', game.doRightTouch);
    }
  },
  createButton: function(x, y, w, h, font, bgcolor, fgcolor, strokeColor, text, callback) {
    //x,y are the upper left corner
    game.buttons.push({rect: {x: x, y: y, w: w, h: h}, font: font, bgcolor: bgcolor,
      fgcolor: fgcolor, strokeColor, text: text, callback: callback});
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
      game.ctx.strokeStyle = v.strokeColor;
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
  getTouchPosition: function(event) {
    let rect = game.canvas.getBoundingClientRect();
    let absx = event.changedTouches[0].pageX - rect.left;
    let absy = event.changedTouches[0].pageY - rect.top;
    let relx = absx * game.canvas.width / game.canvas.style.width.slice(0,-2);
    let rely = absy * game.canvas.height / game.canvas.style.height.slice(0,-2);
    return {x: relx, y: rely};
  },
  isPointInRect(point, rect) {
    if (point === undefined) {return false;}
    return (point.x >= rect.x) && (point.x <= rect.x + rect.w) && (point.y <= rect.y + rect.h) && (point.y >= rect.y);
  },
  canvasMouseMove: function(event) {
    let pos = game.getCursorPosition(event);
    game.mousePos = pos;
  },
  createWall: function(x, y, width, height) {
    //x,y are the upper left corners
    var userData = {};
    userData.type = 'wall';
    userData.width = width;
    userData.height = height;

    var fDef = new b2FixtureDef();
    fDef.density = 1.0;
    fDef.friction = 0.5;
    fDef.friction = 0.0;
    fDef.restitution = 0.2;
    fDef.restitution = 0.1;
    fDef.shape = new b2PolygonShape();
    fDef.shape.SetAsBox(width / 2, height / 2);


    var bDef = new b2BodyDef();
    bDef.type = b2Body.b2_staticBody;

    bDef.position.x = x + width * 0.5;
    bDef.position.y = y + height * 0.5;

    var newBody;
    newBody = game.world.CreateBody(bDef);
    newBody.CreateFixture(fDef);
    newBody.SetUserData(userData);

    return newBody;
  },
  createBox: function(x, y, width, height, type) {
    var userData = {};
    userData.type = type;
    userData.width = width;
    userData.height = height;

    var fDef = new b2FixtureDef();
    fDef.density = 1.0;
    fDef.friction = 0.5;
    fDef.friction = 0.0;
    fDef.restitution = 0.2;
    fDef.restitution = 0.1;
    fDef.shape = new b2PolygonShape();
    fDef.shape.SetAsBox(width / 2, height / 2);

    var bDef = new b2BodyDef();
    bDef.type = b2Body.b2_dynamicBody;
    bDef.position.x = x + width * 0.5;
    bDef.position.y = y + height * 0.5;

    var newBody;
    newBody = game.world.CreateBody(bDef);
    newBody.CreateFixture(fDef);
    newBody.SetUserData(userData);

    return newBody;
  },
  onkeydown: function(event) {
    game.pressedKeys[event.key] = true;
  },
  onkeyup: function(event) {
    delete game.pressedKeys[event.key];
  },
  onTouchStart: function(event) {
    event.preventDefault();
    game.touchScreen = true;
    let pos = game.getTouchPosition(event);
    game.buttons.forEach((v) => {
      if (game.isPointInRect(pos, v.rect)) {
        v.callback();
      }
    });
    game.mousePos = pos;
  },
  onTouchEnd: function(event) {
    let pos = game.getTouchPosition(event);
    game.buttons.forEach((v) => {
      if (game.isPointInRect(pos, v.rect)) {
        v.callback();
      }
    });
    game.mousePos = undefined;
    game.pressedKeys = {};
  },
  doLeftTouch: function() {
    game.pressedKeys.ArrowLeft = true;
  },
  doRightTouch: function() {
    game.pressedKeys.ArrowRight = true;
  }
};

//bring Box2D items into global namespace
let b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2Body = Box2D.Dynamics.b2Body,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2Fixture = Box2D.Dynamics.b2Fixture,
  b2World = Box2D.Dynamics.b2World,
 	b2MassData = Box2D.Collision.Shapes.b2MassData,
 	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
 	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
  b2RevoluteJointDef =  Box2D.Dynamics.Joints.b2RevoluteJointDef;

game.init();
