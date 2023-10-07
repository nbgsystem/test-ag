import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as PIXI from 'pixi.js';
import * as particles from '@pixi/particle-emitter'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'test-ag';

  @ViewChild('pixiGameContainer', { static: true }) pixiGameContainer: ElementRef

  game = new PIXI.Application({ width: 800, height: 600, backgroundAlpha: 0 });
  loading = 0;
  activeTab: 'task1' | 'task2' | 'task3' = 'task1';
  assets: any;
  moving = false;
  startTime = 0;

  // @Task 1 variables
  task1Container = new PIXI.Container();
  task1InfoContainer = new PIXI.Container();
  task1CardsContainer = new PIXI.Container();

  stack1: PIXI.Sprite[] = [];
  stack2: PIXI.Sprite[] = [];

  textInfo: PIXI.Text;
  fpsText: PIXI.Text;

  // @Task 2 variables
  task2Options = ['image', 'text']
  task2Container = new PIXI.Container();

  // @Task 3 variables
  task3Container = new PIXI.Container();

  // Load the fire particle configuration
  emitter: any;
  config = {
    lifetime: {
      min: 0.1,
      max: 0.75,
    },
    frequency: 0.001,
    emitterLifetime: 0,
    maxParticles: 1000,
    addAtBack: false,
    pos: {
      x: 0,
      y: 0,
    },
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {
                time: 0,
                value: 0.62,
              },
              {
                time: 1,
                value: 0,
              },
            ],
          },
        },
      },
      {
        type: "moveSpeedStatic",
        config: {
          min: 500,
          max: 500,
        },
      },
      {
        type: "scale",
        config: {
          scale: {
            list: [
              {
                time: 0,
                value: 0.25,
              },
              {
                time: 1,
                value: 0.75,
              },
            ],
          },
          minMult: 1,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              {
                time: 0,
                value: "fff191",
              },
              {
                time: 1,
                value: "ff622c",
              },
            ],
          },
        },
      },
      {
        type: "rotation",
        config: {
          accel: 0,
          minSpeed: 50,
          maxSpeed: 50,
          minStart: 265,
          maxStart: 275,
        },
      },
      {
        type: "textureRandom",
        config: {
          textures: ["assets/sprites/particle.png", "assets/sprites/fire.png"],
        },
      },
      {
        type: "spawnShape",
        config: {
          type: "torus",
          data: {
            x: 0,
            y: 0,
            radius: 10,
            innerRadius: 0,
            affectRotation: false,
          },
        },
      },
    ],
  };


  constructor() { }

  async ngOnInit() {
    this.task1CardsContainer.position.set(200, 200)
    this.task2Container.position.set(200, 200);
    this.task3Container.position.set(this.game.renderer.width / 2, 400)

    this.assets = await PIXI.Assets.load('assets/sprites/cards.json', (progress) => {
      this.loading = Math.floor(progress * 100);
    });

    this.pixiGameContainer.nativeElement.appendChild(this.game.view);

    this.onTask1();
    this.game.ticker.add((dt) => {
      this.updateTask1Animation(dt);
      this.updateTask2Animation(dt)
      this.updateTask3Animation(dt)

    })
  }

  onTask3() {
    this.activeTab = 'task3';
    this.game.stage.removeChildren();
    this.game.stage.addChild(this.task3Container)
    this.resetContainers()


    this.emitter = new particles.Emitter(
      this.task3Container,
      this.config
    );


  }

  updateTask3Animation(dt: number) {
    if (this.activeTab !== 'task3') return;
    this.emitter.update(dt * 0.001);
  }

  updateTask1Animation(dt: number) {
    if (this.activeTab !== 'task1') return;
    this.fpsText.text = `FPS: ${this.game.ticker.FPS.toFixed(0)}`
    if (this.moving) {
      const element = this.stack1.length - 1
      this.stack1[element].x += dt * 2.5;
      if ((Date.now() - this.startTime) / 1000 >= 2) {
        this.stack1[element].zIndex = this.stack2.length
        this.task1CardsContainer.setChildIndex(this.stack1[element], this.stack2.length);
        this.stack2.push(this.stack1[this.stack1.length - 1])
        this.stack1.pop()
        this.moving = false;
        this.textInfo.text = `Stack 1 No. of cards ${this.stack1.length}, Stack 2 No. of cards ${this.stack2.length}`
      }
    } else {
      this.moving = true;
      this.startTime = Date.now();
    }
  }

  onTask1() {
    this.startTime = 0
    this.moving = false;
    this.activeTab = 'task1';

    this.resetContainers()

    this.task1AddCards();
    this.task1AddTextInfo();

    this.task1Container.removeChildren();
    this.task1Container.addChild(this.task1CardsContainer)
    this.task1Container.addChild(this.task1InfoContainer)

    this.game.stage.removeChildren();
    this.game.stage.addChild(this.task1Container)
  }

  task1AddCards() {
    this.stack1 = [];
    this.stack2 = [];

    for (const textureId of Object.keys(this.assets.textures)) {
      const card = new PIXI.Sprite(this.assets.textures[textureId])
      card.anchor.set(0.5, 0.5);

      const pos = {
        x: Math.random() * (Math.random() > 0.5 ? 1 : -1),
        y: Math.random() * (Math.random() > 0.5 ? 1 : -1)
      }
      const rot = 30 * 0.0174 * Math.random() * (Math.random() > 0.5 ? 1 : -1);
      const spawnRadius = 20;
      pos.x *= spawnRadius;
      pos.y *= spawnRadius;
      card.position.set(pos.x, pos.y);
      card.rotation = rot;
      card.scale.set(0.75);
      this.stack1.push(card)
      this.task1CardsContainer.addChild(card)
    }
  }

  task1AddTextInfo() {
    this.textInfo = new PIXI.Text(`Stack 1 No. Of Cards: ${this.stack1.length}, Stack 2 No. Of Cards: ${this.stack2.length}`, { fontSize: 14, fill: '#FFFFFF' });
    this.textInfo.anchor.set(0.5, 0);
    this.textInfo.position.x = this.game.renderer.width / 2
    this.task1InfoContainer.addChild(this.textInfo)

    this.fpsText = new PIXI.Text(`FPS: ${PIXI.Ticker.shared.FPS.toFixed(0)}`, { fontSize: 18, fill: '#FFFFFF' });
    this.fpsText.anchor.set(0.5, 0);
    this.fpsText.position.x = this.game.renderer.width / 2
    this.fpsText.position.y = 50

    this.task1InfoContainer.addChild(this.fpsText)
  }


  onTask2() {
    this.activeTab = 'task2';
    this.resetContainers();
    this.startTime = 0
    this.moving = false;
    this.game.stage.removeChildren();
    this.game.stage.addChild(this.task2Container)
  }

  updateTask2Animation(dt: number) {
    if (this.activeTab !== 'task2') return;
    if (this.moving) {
      if (this.task2Container.children.length === 0) {
        for (let i = 0; i < 3; i++) {
          const randomOption = this.task2Options[this.randomNumber(0, this.task2Options.length - 1)];
          if (randomOption === 'image') {
            const textures = Object.keys(this.assets.textures)
            const textureId = textures[this.randomNumber(0, textures.length - 1)];
            const image = new PIXI.Sprite(this.assets.textures[textureId])
            image.position.x = this.task2Container.width * 1.2
            this.task2Container.addChild(image)
          } else if (randomOption === 'text') {
            const text = new PIXI.Text(`+${this.randomNumber(100, 1000)}€`, { fontSize: this.randomNumber(12, 48), fill: '#ffffff' });
            text.position.x = this.task2Container.width * 1.2
            this.task2Container.addChild(text)
          }
        }
      } else {
        this.task2Container.y -= dt * 0.5;
        this.task2Container.alpha -= dt * 0.01;
      }

      if ((Date.now() - this.startTime) / 1000 >= 2) {
        this.moving = false;
        this.task2Container.removeChildren();
        this.task2Container.alpha = 1
        this.task2Container.y = 200
      }
    } else {
      this.moving = true;
      this.startTime = Date.now();
    }
  }

  private randomNumber(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  private resetContainers() {
    this.task1Container.removeChildren();
    this.task2Container.removeChildren();
    this.task3Container.removeChildren();
    this.task1CardsContainer.removeChildren();
    this.task1InfoContainer.removeChildren();
    this.task2Container.alpha = 1
    this.task2Container.y = 200
  }
}
