"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const EARTH_TEXTURE = "/dashboard/earth-blue-marble.jpg";
const CLOUD_TEXTURE = "/dashboard/earth-clouds.jpg";

export function SpinningGlobe() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    // Leave enough camera-space padding for the additive atmosphere to bloom
    // without meeting the edge of the transparent WebGL canvas.
    camera.position.set(0, 0, 3.72);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.className = "h-full w-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(EARTH_TEXTURE);
    const cloudTexture = textureLoader.load(CLOUD_TEXTURE);
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = Math.min(8, maxAnisotropy);
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.anisotropy = Math.min(8, maxAnisotropy);

    const globe = new THREE.Group();
    globe.rotation.z = -0.16;
    scene.add(globe);

    const earthGeometry = new THREE.SphereGeometry(1, 96, 96);
    const earthMaterial = new THREE.MeshPhongMaterial({
      bumpMap: earthTexture,
      bumpScale: 0.018,
      map: earthTexture,
      shininess: 20,
      specular: new THREE.Color(0x3f81a8),
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.y = -0.24;
    globe.add(earth);

    const cloudGeometry = new THREE.SphereGeometry(1.012, 96, 96);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      alphaMap: cloudTexture,
      color: 0xffffff,
      depthWrite: false,
      map: cloudTexture,
      opacity: 0.58,
      shininess: 4,
      specular: new THREE.Color(0xd9efff),
      transparent: true,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.rotation.y = -0.2;
    globe.add(clouds);

    const atmosphereGeometry = new THREE.SphereGeometry(1.055, 96, 96);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        glowColor: { value: new THREE.Color(0x80c9f3) },
      },
      vertexShader: `
        varying vec3 vertexNormal;
        void main() {
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vertexNormal;
        void main() {
          float intensity = pow(0.72 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(glowColor, intensity * 0.72);
        }
      `,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const sunlight = new THREE.DirectionalLight(0xffffff, 2.75);
    sunlight.position.set(-3.5, 2.8, 4.5);
    scene.add(sunlight);

    const ambientLight = new THREE.AmbientLight(0x9cb9d2, 1.15);
    scene.add(ambientLight);

    const lowerFill = new THREE.DirectionalLight(0x8ab1d1, 0.5);
    lowerFill.position.set(2.5, -2, 2);
    scene.add(lowerFill);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let animationFrame = 0;

    function resize() {
      const width = Math.max(1, mount!.clientWidth);
      const height = Math.max(1, mount!.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    function animate() {
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!reduceMotion) {
        earth.rotation.y += delta * 0.055;
        clouds.rotation.y += delta * 0.072;
      }
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      earthGeometry.dispose();
      cloudGeometry.dispose();
      atmosphereGeometry.dispose();
      earthMaterial.dispose();
      cloudMaterial.dispose();
      atmosphereMaterial.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="h-full w-full" ref={mountRef} />;
}
