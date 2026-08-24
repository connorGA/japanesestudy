"use client";

import { useEffect, useRef } from "react";

type GeoPoint = { latitude: number; longitude: number };

const continentFields = [
  { longitude: -108, latitude: 46, radiusX: 49, radiusY: 24 },
  { longitude: -92, latitude: 25, radiusX: 22, radiusY: 13 },
  { longitude: -61, latitude: -17, radiusX: 18, radiusY: 34 },
  { longitude: -42, latitude: 72, radiusX: 13, radiusY: 8 },
  { longitude: 12, latitude: 51, radiusX: 24, radiusY: 12 },
  { longitude: 20, latitude: 7, radiusX: 25, radiusY: 32 },
  { longitude: 78, latitude: 42, radiusX: 57, radiusY: 25 },
  { longitude: 103, latitude: 18, radiusX: 33, radiusY: 18 },
  { longitude: 136, latitude: -25, radiusX: 20, radiusY: 12 },
];

const landPoints = buildLandPoints();

export function SpinningGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let rotation = -0.55;
    let lastTime = performance.now();

    function draw(now: number) {
      const canvasElement = canvas!;
      const drawingContext = context!;
      const bounds = canvasElement.getBoundingClientRect();
      const size = Math.max(1, Math.min(bounds.width, bounds.height));
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const pixelSize = Math.round(size * scale);
      if (canvasElement.width !== pixelSize || canvasElement.height !== pixelSize) {
        canvasElement.width = pixelSize;
        canvasElement.height = pixelSize;
      }

      drawingContext.setTransform(scale, 0, 0, scale, 0, 0);
      drawingContext.clearRect(0, 0, size, size);
      const center = size / 2;
      const radius = size * 0.43;

      drawingContext.save();
      drawingContext.shadowColor = "rgba(55, 69, 114, 0.2)";
      drawingContext.shadowBlur = size * 0.055;
      drawingContext.shadowOffsetY = size * 0.025;
      const ocean = drawingContext.createRadialGradient(
        center - radius * 0.38,
        center - radius * 0.42,
        radius * 0.08,
        center,
        center,
        radius * 1.12,
      );
      ocean.addColorStop(0, "rgba(255, 255, 255, 0.97)");
      ocean.addColorStop(0.46, "rgba(222, 229, 247, 0.95)");
      ocean.addColorStop(1, "rgba(129, 148, 201, 0.92)");
      drawingContext.fillStyle = ocean;
      drawingContext.beginPath();
      drawingContext.arc(center, center, radius, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.restore();

      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.arc(center, center, radius, 0, Math.PI * 2);
      drawingContext.clip();

      drawGraticule(drawingContext, center, radius, rotation);

      for (const point of landPoints) {
        const projected = project(point.latitude, point.longitude, rotation, center, radius);
        if (!projected || projected.depth <= 0) continue;
        const alpha = 0.25 + projected.depth * 0.62;
        drawingContext.fillStyle = `rgba(55, 78, 139, ${alpha})`;
        drawingContext.beginPath();
        drawingContext.arc(projected.x, projected.y, Math.max(0.7, size * 0.0018), 0, Math.PI * 2);
        drawingContext.fill();
      }

      const shade = drawingContext.createLinearGradient(center - radius, center, center + radius, center);
      shade.addColorStop(0, "rgba(24, 36, 73, 0.2)");
      shade.addColorStop(0.42, "rgba(255, 255, 255, 0)");
      shade.addColorStop(0.78, "rgba(255, 255, 255, 0.08)");
      shade.addColorStop(1, "rgba(24, 36, 73, 0.28)");
      drawingContext.fillStyle = shade;
      drawingContext.fillRect(center - radius, center - radius, radius * 2, radius * 2);

      const gleam = drawingContext.createRadialGradient(
        center - radius * 0.38,
        center - radius * 0.42,
        0,
        center - radius * 0.3,
        center - radius * 0.34,
        radius * 0.72,
      );
      gleam.addColorStop(0, "rgba(255, 255, 255, 0.44)");
      gleam.addColorStop(1, "rgba(255, 255, 255, 0)");
      drawingContext.fillStyle = gleam;
      drawingContext.fillRect(center - radius, center - radius, radius * 2, radius * 2);
      drawingContext.restore();

      drawingContext.strokeStyle = "rgba(255, 255, 255, 0.82)";
      drawingContext.lineWidth = Math.max(1, size * 0.003);
      drawingContext.beginPath();
      drawingContext.arc(center, center, radius, 0, Math.PI * 2);
      drawingContext.stroke();

      if (!reduceMotion) {
        rotation += Math.min(42, now - lastTime) * 0.000055;
      }
      lastTime = now;
      animationFrame = window.requestAnimationFrame(draw);
    }

    animationFrame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  return <canvas aria-hidden="true" className="h-full w-full" ref={canvasRef} />;
}

function drawGraticule(
  context: CanvasRenderingContext2D,
  center: number,
  radius: number,
  rotation: number,
) {
  context.strokeStyle = "rgba(74, 96, 155, 0.16)";
  context.lineWidth = 0.75;

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    drawGeoLine(
      context,
      Array.from({ length: 73 }, (_, index) => ({ latitude, longitude: -180 + index * 5 })),
      center,
      radius,
      rotation,
    );
  }

  for (let longitude = -180; longitude < 180; longitude += 30) {
    drawGeoLine(
      context,
      Array.from({ length: 35 }, (_, index) => ({ latitude: -85 + index * 5, longitude })),
      center,
      radius,
      rotation,
    );
  }
}

function drawGeoLine(
  context: CanvasRenderingContext2D,
  points: GeoPoint[],
  center: number,
  radius: number,
  rotation: number,
) {
  let drawing = false;
  context.beginPath();
  for (const point of points) {
    const projected = project(point.latitude, point.longitude, rotation, center, radius);
    if (!projected || projected.depth <= 0) {
      drawing = false;
      continue;
    }
    if (!drawing) context.moveTo(projected.x, projected.y);
    else context.lineTo(projected.x, projected.y);
    drawing = true;
  }
  context.stroke();
}

function project(
  latitude: number,
  longitude: number,
  rotation: number,
  center: number,
  radius: number,
) {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeRadians = (longitude * Math.PI) / 180 + rotation;
  const tilt = -12 * (Math.PI / 180);
  const cosLatitude = Math.cos(latitudeRadians);
  const x3 = cosLatitude * Math.sin(longitudeRadians);
  const rawY = Math.sin(latitudeRadians);
  const rawZ = cosLatitude * Math.cos(longitudeRadians);
  const y3 = rawY * Math.cos(tilt) - rawZ * Math.sin(tilt);
  const z3 = rawY * Math.sin(tilt) + rawZ * Math.cos(tilt);
  return { x: center + x3 * radius, y: center - y3 * radius, depth: z3 };
}

function buildLandPoints() {
  const points: GeoPoint[] = [];
  for (const field of continentFields) {
    for (let latitude = -80; latitude <= 80; latitude += 3.3) {
      for (let longitude = -180; longitude < 180; longitude += 3.3) {
        const longitudeDistance = wrappedDistance(longitude, field.longitude) / field.radiusX;
        const latitudeDistance = (latitude - field.latitude) / field.radiusY;
        const edgeNoise = 0.82 + hash(latitude, longitude) * 0.28;
        if (longitudeDistance ** 2 + latitudeDistance ** 2 <= edgeNoise) {
          points.push({ latitude, longitude });
        }
      }
    }
  }
  return points;
}

function wrappedDistance(left: number, right: number) {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function hash(latitude: number, longitude: number) {
  const value = Math.sin(latitude * 12.9898 + longitude * 78.233) * 43758.5453;
  return value - Math.floor(value);
}
