import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { NoiseFunction4D, createNoise4D } from 'simplex-noise';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  constructor(private api: ApiService) {}

  isAuth: boolean = false;

  // Three.js Variables
  @ViewChild('background') background!: ElementRef<HTMLCanvasElement>;

  conf = {
    fov: 75,
    cameraZ: 75,
    xyCoef: 50,
    zCoef: 10,
    lightIntensity: 0.9,
    light1Color: 0xf05f51,
    light2Color: 0xf73181,
    light3Color: 0x00a1d6,
    light4Color: 0x00b5ac,
  };

  mouse: THREE.Vector2 = new AFRAME.THREE.Vector2();
  mousePlane: THREE.Plane = new AFRAME.THREE.Plane(
    new AFRAME.THREE.Vector3(0, 0, 1),
    0
  );
  mousePosition: THREE.Vector3 = new AFRAME.THREE.Vector3();
  raycaster: THREE.Raycaster = new AFRAME.THREE.Raycaster();

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  width!: number;
  height!: number;
  wWidth!: number;
  wHeight!: number;
  noise4D: NoiseFunction4D = createNoise4D();

  plane!: THREE.Mesh;

  light1!: THREE.PointLight;
  light2!: THREE.PointLight;
  light3!: THREE.PointLight;
  light4!: THREE.PointLight;

  ngOnInit(): void {
    this.checkAuth();
  }

  ngAfterViewInit(): void {
    this.initAnimation();
  }

  checkAuth() {
    this.api.me().subscribe((res) => {
      this.isAuth = res ? true : false;
    });
  }

  @HostListener('window:resize')
  updateSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.renderer && this.camera) {
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      const wsize = this.getRendererSize();
      this.wWidth = wsize[0];
      this.wHeight = wsize[1];
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const v = new AFRAME.THREE.Vector3();
    this.camera.getWorldDirection(v);
    v.normalize();
    this.mousePlane.normal = v;
    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = -(e.clientY / this.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.mousePlane, this.mousePosition);
  }

  initAnimation(): void {
    this.renderer = new AFRAME.THREE.WebGLRenderer({
      canvas: this.background.nativeElement,
      antialias: true,
      alpha: true,
    });
    this.camera = new AFRAME.THREE.PerspectiveCamera(this.conf.fov);
    this.camera.position.z = this.conf.cameraZ;

    this.updateSize();

    this.initScene();
    this.animate();
  }

  initScene() {
    this.scene = new AFRAME.THREE.Scene();
    this.initLights();

    let mat = new AFRAME.THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });

    let geo = new AFRAME.THREE.PlaneGeometry(
      this.wWidth,
      this.wHeight,
      this.wWidth / 2,
      this.wHeight / 2
    );
    this.plane = new AFRAME.THREE.Mesh(geo, mat);
    this.scene.add(this.plane);

    this.plane.rotation.x = -Math.PI / 2 - 0.2;
    this.plane.position.y = -25;
    this.camera.position.z = 60;
  }

  initLights() {
    const r = 30;
    const y = 10;
    const lightDistance = 500;

    this.light1 = new AFRAME.THREE.PointLight(
      this.conf.light1Color,
      this.conf.lightIntensity,
      lightDistance
    );
    this.light1.position.set(0, y, r);
    this.scene.add(this.light1);
    this.light2 = new AFRAME.THREE.PointLight(
      this.conf.light2Color,
      this.conf.lightIntensity,
      lightDistance
    );
    this.light2.position.set(0, -y, -r);
    this.scene.add(this.light2);
    this.light3 = new AFRAME.THREE.PointLight(
      this.conf.light3Color,
      this.conf.lightIntensity,
      lightDistance
    );
    this.light3.position.set(r, y, 0);
    this.scene.add(this.light3);
    this.light4 = new AFRAME.THREE.PointLight(
      this.conf.light4Color,
      this.conf.lightIntensity,
      lightDistance
    );
    this.light4.position.set(-r, y, 0);
    this.scene.add(this.light4);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.animatePlane();
    this.animateLights();

    this.renderer.render(this.scene, this.camera);
  }

  animatePlane() {
    const position = this.plane.geometry as any;
    const gArray = position.vertices;
    const time = Date.now() * 0.0002;
    for (let i = 0; i < gArray.length; i++) {
      gArray[i].z =
        this.noise4D(
          gArray[i].x / this.conf.xyCoef,
          gArray[i].y / this.conf.xyCoef,
          time,
          this.mouse.x + this.mouse.y
        ) * this.conf.zCoef;
    }
    position.verticesNeedUpdate = true;
  }

  animateLights() {
    const time = Date.now() * 0.001;
    const d = 50;
    this.light1.position.x = Math.sin(time * 0.1) * d;
    this.light1.position.z = Math.cos(time * 0.2) * d;
    this.light2.position.x = Math.cos(time * 0.3) * d;
    this.light2.position.z = Math.sin(time * 0.4) * d;
    this.light3.position.x = Math.sin(time * 0.5) * d;
    this.light3.position.z = Math.sin(time * 0.6) * d;
    this.light4.position.x = Math.sin(time * 0.7) * d;
    this.light4.position.z = Math.cos(time * 0.8) * d;
  }

  getRendererSize() {
    const cam = new AFRAME.THREE.PerspectiveCamera(
      this.camera.fov,
      this.camera.aspect
    );
    const vFOV = (cam.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(this.conf.cameraZ);
    const width = height * cam.aspect;
    return [width, height];
  }
}
