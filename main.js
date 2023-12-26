import { Engine, Render, Runner, World, Bodies, Body, Events } from "matter-js";
import { BALLS } from "./balls";
const engine = Engine.create();
const render = Render.create({
  engine,
  element : document.body,
  options:{
    wireframes : false,
    background:'#F7F4C8',
    width : 620,
    height : 850,
  }
});

const runner = Runner.create();

const world = engine.world;
const leftWall = Bodies.rectangle(15,395,30,790,{
  isStatic:true,
  render : { fillStyle: "#E6B143"}
})

const rightWall = Bodies.rectangle(605,395,30,790,{
  isStatic:true,
  render : { fillStyle: "#E6B143"}
})

const ground = Bodies.rectangle(310,820,620,60,{
  isStatic:true,
  render : { fillStyle: "#E6B143"}
})

const topLine = Bodies.rectangle(310,150,620,2,{
  name: "topLine",
  isStatic:true,
  isSensor:true,
  render : { fillStyle: "#E6B143"}
})

World.add(world, [leftWall,rightWall,ground,topLine] );

Runner.run(runner,engine);
Render.run(render);

let currentBody = null;
let currentBall = null;
let disableAction = false;
let interval = null;

function addBall(){
  const index = Math.floor(Math.random() * 5);
  const ball = BALLS[index];

  const body = Bodies.circle(300,70,ball.radius,{
    index:index,
    isSleeping:true, 
    render:{
      sprite:{texture:`${ball.name}.png`}
    },
    restitution:0.4,
  })

  currentBody = body;
  currentBall = ball;
  World.add(world,body);
}

window.onkeydown = (event) => {
  if(disableAction){
    return;
  }
  switch(event.code){
    case "KeyA":
      if(interval) 
        return;
      interval = setInterval( ()=>{
        if(currentBody.position.x - currentBall.radius > 30)
          Body.setPosition(currentBody,{
            x:currentBody.position.x-1,
            y:currentBody.position.y,
          });
      },5)
      break;
    case "KeyD":
      if(interval)
        return;
      interval = setInterval(()=>{
      if(currentBody.position.x + currentBall.radius < 590)
          Body.setPosition(currentBody,{
            x:currentBody.position.x+1,
            y:currentBody.position.y,
          });
      },5)
      break;
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction=true;
      setTimeout( () => {
        addBall();
        disableAction=false;
      },1000)
      break; 
  }
}

window.onkeyup = (event) => {
  switch(event.code){
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval= null;
  }
}

Events.on(engine,'collisionStart',(event)=>{
  event.pairs.forEach( (collision) =>{
    if( collision.bodyA.index == collision.bodyB.index ){
      const index = collision.bodyA.index;

      if(index == BALLS.index-1){
        return;
      }

      World.remove(world,[collision.bodyA,collision.bodyB]);
      const newBall = BALLS[index+1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newBall.radius,
        {
          render:{
            sprite:{texture:`${newBall.name}.png`}
          },
          index : index +1,
        }
      );
      World.add(world,newBody)
    }


    if( !disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")){
      alert("게임오버");
      location.reload();
    }

  });
})


addBall();