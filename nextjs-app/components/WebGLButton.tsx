
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLButtonStyle } from '../types/types';

interface WebGLButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  styleType?: WebGLButtonStyle;
  color?: string;
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
}

const WebGLButton: React.FC<WebGLButtonProps> = ({ 
  children, 
  onClick, 
  styleType = WebGLButtonStyle.NEON_PULSE, 
  color = '#00ffcc',
  className = '',
  disabled = false,
  isActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width * window.devicePixelRatio, height * window.devicePixelRatio) },
      u_color: { value: new THREE.Color(color) },
      u_hover: { value: 0.0 },
      u_active: { value: 0.0 },
      u_style: { value: 0.0 }
    };

    let styleVal = 0;
    if (styleType === WebGLButtonStyle.PLASMA) styleVal = 1;
    if (styleType === WebGLButtonStyle.SCAN_LINE) styleVal = 2;
    if (styleType === WebGLButtonStyle.PARTICLE_FIELD) styleVal = 3;
    uniforms.u_style.value = styleVal;

    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      uniform float u_hover;
      uniform float u_active;
      uniform float u_style;
      varying vec2 vUv;

      // --- NOISE FUNCTIONS ---
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 a0 = x - floor(x + 0.5);
        vec3 g = h - a0;
        vec3 ox = floor(a0 + 0.5);
        vec3 a1 = a0 - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 v1 = vec3(0.0);
        v1.x = a0.x  * x0.x  + g.x  * x0.y;
        v1.yz = a1.yz * x12.xz + g.yz * x12.yw;
        return 130.0 * dot(m, v1);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 centeredUv = uv * 2.0 - 1.0;
        centeredUv.x *= u_resolution.x / u_resolution.y;
        
        vec3 finalColor = vec3(0.0);
        float alpha = 0.0;
        float time = u_time * (1.0 + u_active);
        
        // Base Noise used by multiple styles
        float n = snoise(uv * 3.0 + time * 0.2);

        if (u_style < 0.5) { // ADVANCED NEON
          float border = 1.0 - smoothstep(0.4, 0.5, abs(length(centeredUv * 0.8) - 0.7));
          float angle = atan(centeredUv.y, centeredUv.x);
          float racing = smoothstep(0.0, 0.1, sin(angle * 3.0 + time * 5.0));
          
          finalColor = u_color * border * (0.5 + racing * 0.5);
          finalColor += u_color * 0.2 * (1.0 + u_hover);
          finalColor *= (1.0 + n * 0.1);
          alpha = length(finalColor) * 1.2;
        } 
        else if (u_style < 1.5) { // LIQUID PLASMA
          vec2 p = centeredUv;
          for(int i=1; i<4; i++) {
            float fi = float(i);
            p.x += 0.3 / fi * sin(fi * 3.0 * p.y + time + n * 0.5);
            p.y += 0.3 / fi * cos(fi * 3.0 * p.x + time);
          }
          float r = sin(p.x + p.y + 1.0) * 0.5 + 0.5;
          float g = sin(p.x + p.y + 2.0) * 0.5 + 0.5;
          float b = sin(p.x + p.y + 3.0) * 0.5 + 0.5;
          
          finalColor = mix(u_color, vec3(r, g, b), 0.4 + u_hover * 0.3);
          finalColor *= 0.8;
          alpha = 0.9;
        }
        else if (u_style < 2.5) { // CYBER GRID
          vec2 gridUv = uv;
          gridUv.y += time * 0.1;
          float grid = step(0.95, fract(gridUv.x * 10.0)) + step(0.95, fract(gridUv.y * 10.0));
          float pulse = step(0.98, fract(uv.y * 2.0 - time * 1.5)) * step(0.8, snoise(vec2(uv.x * 5.0, time)));
          
          finalColor = u_color * (grid * 0.3 + pulse * 2.0);
          finalColor += u_color * 0.1;
          alpha = length(finalColor) + 0.2;
        }
        else { // STELLAR NEBULA
          float n1 = snoise(uv * 2.0 + time * 0.1);
          float n2 = snoise(uv * 4.0 - time * 0.05);
          vec3 nebula = mix(u_color, vec3(1.0, 0.5, 1.0), n1 * 0.5 + 0.5);
          float stars = pow(fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453), 20.0);
          stars *= step(0.9, snoise(uv * 20.0 + time * 0.02));
          
          finalColor = nebula * (0.2 + n2 * 0.1) + vec3(stars) * (1.0 + u_hover);
          alpha = 0.8 + u_hover * 0.2;
        }

        // Final polishing + Chromatic aberration effect
        float shift = 0.005 * u_hover;
        finalColor.r *= 1.0 + shift;
        finalColor.b *= 1.0 - shift;
        
        finalColor *= (0.8 + 0.4 * u_hover);
        if (u_active > 0.5) {
            finalColor *= (1.0 + 0.2 * sin(u_time * 10.0));
        }

        gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
      }
    `;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader,
      vertexShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationId: number;
    const animate = (time: number) => {
      uniforms.u_time.value = time * 0.001;
      uniforms.u_hover.value = THREE.MathUtils.lerp(uniforms.u_hover.value, isHovered ? 1.0 : 0.0, 0.1);
      uniforms.u_active.value = THREE.MathUtils.lerp(uniforms.u_active.value, isActive ? 1.0 : 0.0, 0.1);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = containerRef.current?.clientWidth || 0;
      const h = containerRef.current?.clientHeight || 0;
      if (w && h) {
        renderer.setSize(w, h);
        uniforms.u_resolution.value.set(w * window.devicePixelRatio, h * window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [styleType, color, isHovered, isActive]);

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center justify-center cursor-pointer group px-10 py-4 min-w-[160px] select-none transition-transform active:scale-95 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onClick={() => !disabled && onClick?.()}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none rounded-lg overflow-hidden"
      />
      <span className="relative z-10 font-black tracking-[0.2em] text-white uppercase text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {children}
      </span>
    </div>
  );
};

export default WebGLButton;
