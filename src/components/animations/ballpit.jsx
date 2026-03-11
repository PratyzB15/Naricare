// src/components/animations/ballpit.jsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// 🔑 Critical fix: assign ShaderChunk to 'h' for material compilation
const h = THREE.ShaderChunk;

// 🎨 Your custom pink palette
const CUSTOM_PALETTE = [
  0xf9bbe6, // #f9bbe6
  0xf29ec8, // #f29ec8
  0xee73c4, // #ee73c4
  0xf453ad, // #f453ad
  0xf20b97, // #f20b97
];

// --- Core Three.js App (renamed for clarity) ---
class ThreeApp {
  #config;
  canvas;
  camera;
  cameraFov;
  cameraMinAspect;
  cameraMaxAspect;
  scene;
  renderer;
  #postprocessing;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#renderScene;
  onBeforeRender = () => {};
  onAfterRender = () => {};
  onAfterResize = () => {};
  #isVisible = false;
  #isAnimating = false;
  isDisposed = false;
  #resizeObserver;
  #intersectionObserver;
  #rafId;
  #clock = new THREE.Clock();
  #time = { elapsed: 0, delta: 0 };
  #lastRaf;

  constructor(config) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#setupObservers();
  }

  #initCamera() {
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    this.cameraFov = this.camera.fov;
  }

  #initScene() {
    this.scene = new THREE.Scene();
  }

  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      this.canvas = document.getElementById(this.#config.id);
    } else {
      console.error('Three: Missing canvas or id parameter');
      return;
    }
    this.canvas.style.display = 'block';

    const rendererConfig = {
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      ...(this.#config.rendererOptions ?? {}),
    };
    this.renderer = new THREE.WebGLRenderer(rendererConfig);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  #setupObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#debouncedResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#debouncedResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }

    this.#intersectionObserver = new IntersectionObserver(
      this.#onIntersectionChange.bind(this),
      { root: null, rootMargin: '0px', threshold: 0 }
    );
    this.#intersectionObserver.observe(this.canvas);

    document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }

  #cleanupObservers() {
    window.removeEventListener('resize', this.#debouncedResize.bind(this));
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }

  #onIntersectionChange(entries) {
    this.#isVisible = entries[0].isIntersecting;
    this.#isVisible ? this.#startAnimation() : this.#stopAnimation();
  }

  #onVisibilityChange() {
    if (this.#isVisible) {
      document.hidden ? this.#stopAnimation() : this.#startAnimation();
    }
  }

  #debouncedResize() {
    clearTimeout(this.#rafId);
    this.#rafId = setTimeout(() => this.resize(), 100);
  }

  resize() {
    let width, height;
    if (this.#config.size instanceof Object) {
      width = this.#config.size.width;
      height = this.#config.size.height;
    } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
      width = this.canvas.parentNode.offsetWidth;
      height = this.canvas.parentNode.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;

    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFovForAspect(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFovForAspect(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFovForAspect(targetAspect) {
    const tanFov = Math.tan(THREE.MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / targetAspect);
    this.camera.fov = 2 * THREE.MathUtils.radToDeg(Math.atan(tanFov));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }

  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);

    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) pixelRatio = this.maxPixelRatio;
    else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) pixelRatio = this.minPixelRatio;

    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  get postprocessing() {
    return this.#postprocessing;
  }

  set postprocessing(pp) {
    this.#postprocessing = pp;
    this.render = pp.render.bind(pp);
  }

  #startAnimation() {
    if (this.#isAnimating) return;
    const animate = () => {
      this.#lastRaf = requestAnimationFrame(animate);
      this.#time.delta = this.#clock.getDelta();
      this.#time.elapsed += this.#time.delta;
      this.onBeforeRender(this.#time);
      this.render();
      this.onAfterRender(this.#time);
    };
    this.#isAnimating = true;
    this.#clock.start();
    animate();
  }

  #stopAnimation() {
    if (this.#isAnimating) {
      cancelAnimationFrame(this.#lastRaf);
      this.#isAnimating = false;
      this.#clock.stop();
    }
  }

  #renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        Object.values(obj.material).forEach((prop) => {
          if (prop?.dispose) prop.dispose();
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    this.#cleanupObservers();
    this.#stopAnimation();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

// --- Pointer Interaction System (FIXED: processPointer → processInteraction) ---
const pointerMap = new Map();
let isPointerActive = false;

function setupPointer(canvas, config) {
  const settings = {
    position: new THREE.Vector2(),
    nPosition: new THREE.Vector2(),
    hover: false,
    touching: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    ...config,
  };

  if (!pointerMap.has(canvas)) {
    pointerMap.set(canvas, settings);
    if (!isPointerActive) {
      document.body.addEventListener('pointermove', onPointerMove);
      document.body.addEventListener('pointerleave', onPointerLeave);
      document.body.addEventListener('click', onClick);
      document.body.addEventListener('touchstart', onTouchStart, { passive: false });
      document.body.addEventListener('touchmove', onTouchMove, { passive: false });
      document.body.addEventListener('touchend', onTouchEnd, { passive: false });
      document.body.addEventListener('touchcancel', onTouchEnd, { passive: false });
      isPointerActive = true;
    }
  }

  settings.dispose = () => {
    pointerMap.delete(canvas);
    if (pointerMap.size === 0) {
      document.body.removeEventListener('pointermove', onPointerMove);
      document.body.removeEventListener('pointerleave', onPointerLeave);
      document.body.removeEventListener('click', onClick);
      document.body.removeEventListener('touchstart', onTouchStart);
      document.body.removeEventListener('touchmove', onTouchMove);
      document.body.removeEventListener('touchend', onTouchEnd);
      document.body.removeEventListener('touchcancel', onTouchEnd);
      isPointerActive = false;
    }
  };

  return settings;
}

const pointerPos = new THREE.Vector2();

// ✅ FIXED: renamed from processPointer to processInteraction
function processInteraction() {
  for (const [elem, t] of pointerMap) {
    const i = elem.getBoundingClientRect();
    if (isInside(i)) {
      updatePointerPosition(t, i);
      if (!t.hover) {
        t.hover = true;
        t.onEnter(t);
      }
      t.onMove(t);
    } else if (t.hover && !t.touching) {
      t.hover = false;
      t.onLeave(t);
    }
  }
}

function onPointerMove(e) {
  pointerPos.x = e.clientX;
  pointerPos.y = e.clientY;
  processInteraction(); // ✅ CORRECTED!
}

function onClick(e) {
  pointerPos.x = e.clientX;
  pointerPos.y = e.clientY;
  for (const [elem, t] of pointerMap) {
    const i = elem.getBoundingClientRect();
    updatePointerPosition(t, i);
    if (isInside(i)) t.onClick(t);
  }
}

function onPointerLeave() {
  for (const t of pointerMap.values()) {
    if (t.hover) {
      t.hover = false;
      t.onLeave(t);
    }
  }
}

function onTouchStart(e) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPos.x = e.touches[0].clientX;
    pointerPos.y = e.touches[0].clientY;

    for (const [elem, t] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      if (isInside(rect)) {
        t.touching = true;
        updatePointerPosition(t, rect);
        if (!t.hover) {
          t.hover = true;
          t.onEnter(t);
        }
        t.onMove(t);
      }
    }
  }
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPos.x = e.touches[0].clientX;
    pointerPos.y = e.touches[0].clientY;

    for (const [elem, t] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      updatePointerPosition(t, rect);

      if (isInside(rect)) {
        if (!t.hover) {
          t.hover = true;
          t.touching = true;
          t.onEnter(t);
        }
        t.onMove(t);
      } else if (t.hover && t.touching) {
        t.onMove(t);
      }
    }
  }
}

function onTouchEnd() {
  for (const [, t] of pointerMap) {
    if (t.touching) {
      t.touching = false;
      if (t.hover) {
        t.hover = false;
        t.onLeave(t);
      }
    }
  }
}

function updatePointerPosition(t, rect) {
  const { position: i, nPosition: s } = t;
  i.x = pointerPos.x - rect.left;
  i.y = pointerPos.y - rect.top;
  s.x = (i.x / rect.width) * 2 - 1;
  s.y = (-i.y / rect.height) * 2 + 1;
}

function isInside(rect) {
  const { x: t, y: i } = pointerPos;
  const { left: s, top: n, width: o, height: r } = rect;
  return t >= s && t <= s + o && i >= n && i <= n + r;
}

// --- Physics Engine (unchanged) ---
const { randFloat: k, randFloatSpread: E } = THREE.MathUtils;
const tempVec1 = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const tempVec3 = new THREE.Vector3();
const tempVec4 = new THREE.Vector3();
const tempVec5 = new THREE.Vector3();
const tempVec6 = new THREE.Vector3();
const tempVec7 = new THREE.Vector3();
const tempVec8 = new THREE.Vector3();
const tempVec9 = new THREE.Vector3();
const tempVec10 = new THREE.Vector3();

class BallPhysics {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new THREE.Vector3();
    this.#initPositions();
    this.setSizes();
  }

  #initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const base = 3 * i;
      positionData[base] = E(2 * config.maxX);
      positionData[base + 1] = E(2 * config.maxY);
      positionData[base + 2] = E(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = k(config.minSize, config.maxSize);
    }
  }

  update(time) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let skipFirst = 0;
    if (config.controlSphere0) {
      skipFirst = 1;
      tempVec1.fromArray(positionData, 0);
      tempVec1.lerp(center, 0.1).toArray(positionData, 0);
      tempVec4.set(0, 0, 0).toArray(velocityData, 0);
    }

    for (let i = skipFirst; i < config.count; i++) {
      const base = 3 * i;
      tempVec2.fromArray(positionData, base);
      tempVec5.fromArray(velocityData, base);
      tempVec5.y -= time.delta * config.gravity * sizeData[i];
      tempVec5.multiplyScalar(config.friction);
      tempVec5.clampLength(0, config.maxVelocity);
      tempVec2.add(tempVec5);
      tempVec2.toArray(positionData, base);
      tempVec5.toArray(velocityData, base);
    }

    for (let i = skipFirst; i < config.count; i++) {
      const base = 3 * i;
      tempVec2.fromArray(positionData, base);
      tempVec5.fromArray(velocityData, base);
      const radius = sizeData[i];

      for (let j = i + 1; j < config.count; j++) {
        const otherBase = 3 * j;
        tempVec3.fromArray(positionData, otherBase);
        tempVec6.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[j];
        tempVec7.copy(tempVec3).sub(tempVec2);
        const dist = tempVec7.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          tempVec8.copy(tempVec7).normalize().multiplyScalar(0.5 * overlap);
          tempVec9.copy(tempVec8).multiplyScalar(Math.max(tempVec5.length(), 1));
          tempVec10.copy(tempVec8).multiplyScalar(Math.max(tempVec6.length(), 1));
          tempVec2.sub(tempVec8);
          tempVec5.sub(tempVec9);
          tempVec2.toArray(positionData, base);
          tempVec5.toArray(velocityData, base);
          tempVec3.add(tempVec8);
          tempVec6.add(tempVec10);
          tempVec3.toArray(positionData, otherBase);
          tempVec6.toArray(velocityData, otherBase);
        }
      }

      if (config.controlSphere0) {
        tempVec7.copy(tempVec1).sub(tempVec2);
        const dist = tempVec7.length();
        const sumRadius0 = radius + sizeData[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          tempVec8.copy(tempVec7.normalize()).multiplyScalar(diff);
          tempVec9.copy(tempVec8).multiplyScalar(Math.max(tempVec5.length(), 2));
          tempVec2.sub(tempVec8);
          tempVec5.sub(tempVec9);
        }
      }

      if (Math.abs(tempVec2.x) + radius > config.maxX) {
        tempVec2.x = Math.sign(tempVec2.x) * (config.maxX - radius);
        tempVec5.x = -tempVec5.x * config.wallBounce;
      }
      if (config.gravity === 0) {
        if (Math.abs(tempVec2.y) + radius > config.maxY) {
          tempVec2.y = Math.sign(tempVec2.y) * (config.maxY - radius);
          tempVec5.y = -tempVec5.y * config.wallBounce;
        }
      } else if (tempVec2.y - radius < -config.maxY) {
        tempVec2.y = -config.maxY + radius;
        tempVec5.y = -tempVec5.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(tempVec2.z) + radius > maxBoundary) {
        tempVec2.z = Math.sign(tempVec2.z) * (config.maxZ - radius);
        tempVec5.z = -tempVec5.z * config.wallBounce;
      }

      tempVec2.toArray(positionData, base);
      tempVec5.toArray(velocityData, base);
    }
  }
}

// --- Custom Material (unchanged) ---
class ScatteringMaterial extends THREE.MeshPhysicalMaterial {
  constructor(params) {
    super(params);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    };
    this.defines.USE_UV = '';
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
      );
      const lightsFragment = h.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsFragment);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

// --- Default Config (with YOUR colors!) ---
const DEFAULT_CONFIG = {
  count: 200,
  colors: CUSTOM_PALETTE,
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

const dummyObject = new THREE.Object3D();

class BallpitMesh extends THREE.InstancedMesh {
  constructor(renderer, config = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const envScene = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(envScene).texture;
    const geometry = new THREE.SphereGeometry();
    const material = new ScatteringMaterial({ envMap, ...finalConfig.materialParams });
    material.envMapRotation.x = -Math.PI / 2;

    super(geometry, material, finalConfig.count);
    this.config = finalConfig;
    this.physics = new BallPhysics(finalConfig);
    this.#setupLights();
    this.setColors(finalConfig.colors);
  }

  #setupLights() {
    this.ambientLight = new THREE.AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new THREE.PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const gradient = (() => {
        const colorObjs = colors.map((hex) => new THREE.Color(hex));
        return {
          getColorAt: (ratio) => {
            const clamped = THREE.MathUtils.clamp(ratio, 0, 1);
            const scaled = clamped * (colorObjs.length - 1);
            const idx = Math.floor(scaled);
            if (idx >= colorObjs.length - 1) return colorObjs[colorObjs.length - 1].clone();
            const alpha = scaled - idx;
            const start = colorObjs[idx];
            const end = colorObjs[idx + 1];
            return new THREE.Color().lerpColors(start, end, alpha);
          },
        };
      })();

      for (let i = 0; i < this.count; i++) {
        const color = gradient.getColorAt(i / this.count);
        this.setColorAt(i, color);
        if (i === 0) this.light.color.copy(color);
      }
      this.instanceColor.needsUpdate = true;
    }
  }

  update(time) {
    this.physics.update(time);
    for (let i = 0; i < this.count; i++) {
      dummyObject.position.fromArray(this.physics.positionData, 3 * i);
      if (i === 0 && this.config.followCursor === false) {
        dummyObject.scale.setScalar(0);
      } else {
        dummyObject.scale.setScalar(this.physics.sizeData[i]);
      }
      dummyObject.updateMatrix();
      this.setMatrixAt(i, dummyObject.matrix);
      if (i === 0) this.light.position.copy(dummyObject.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(canvas, config = {}) {
  const app = new ThreeApp({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true },
  });
  app.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  app.camera.position.set(0, 0, 20);
  app.camera.lookAt(0, 0, 0);
  app.cameraMaxAspect = 1.5;
  app.resize();

  let ballpitMesh;
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectionPoint = new THREE.Vector3();
  let isPaused = false;

  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';

  const pointerConfig = setupPointer(canvas, {
    onMove() {
      raycaster.setFromCamera(pointerConfig.nPosition, app.camera);
      app.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      ballpitMesh.physics.center.copy(intersectionPoint);
      ballpitMesh.config.controlSphere0 = true;
    },
    onLeave() {
      ballpitMesh.config.controlSphere0 = false;
    },
  });

  function initialize(cfg) {
    if (ballpitMesh) {
      app.clear();
      app.scene.remove(ballpitMesh);
    }
    ballpitMesh = new BallpitMesh(app.renderer, cfg);
    app.scene.add(ballpitMesh);
  }

  initialize({ ...ballpitMesh?.config, ...config });

  app.onBeforeRender = (time) => {
    if (!isPaused) ballpitMesh.update(time);
  };

  app.onAfterResize = (size) => {
    ballpitMesh.config.maxX = size.wWidth / 2;
    ballpitMesh.config.maxY = size.wHeight / 2;
  };

  return {
    three: app,
    get spheres() {
      return ballpitMesh;
    },
    setCount(count) {
      initialize({ ...ballpitMesh.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      pointerConfig.dispose();
      app.dispose();
    },
  };
}

// --- React Component ---
const Ballpit = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    instanceRef.current = createBallpit(canvas, { followCursor, ...props });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
      }
    };
  }, [followCursor]);

  return <canvas className={`${className} w-full h-full`} ref={canvasRef} />;
};

export default Ballpit;