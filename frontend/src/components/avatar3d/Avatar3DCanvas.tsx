"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Environment, Float, ContactShadows, SpotLight } from "@react-three/drei";
import * as THREE from "three";

interface Avatar3DCanvasProps {
  personaKey: "emma" | "liam" | "chloe" | "arthur";
  isSpeaking: boolean;
  isListening: boolean;
  audioLevel?: number;
  onCanvasClick?: () => void;
}

const PERSONA_THEMES = {
  emma: { color: "#10b981", emissive: "#059669" }, // Emerald
  liam: { color: "#0ea5e9", emissive: "#0284c7" }, // Sky Blue
  chloe: { color: "#8b5cf6", emissive: "#6d28d9" }, // Violet
  arthur: { color: "#f59e0b", emissive: "#d97706" } // Amber
};

const NeuralOrb = ({ isSpeaking, isListening, audioLevel = 0, theme }: any) => {
  const materialRef = useRef<any>();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Animate the orb based on audio level and state
  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;
    
    // Base rotation
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;

    // Reactivity
    let targetDistort = 0.2;
    let targetSpeed = 2;
    let targetScale = 1;

    if (isSpeaking) {
      targetDistort = 0.4 + (audioLevel * 0.8);
      targetSpeed = 4 + (audioLevel * 5);
      targetScale = 1.05 + (audioLevel * 0.1);
    } else if (isListening) {
      targetDistort = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      targetSpeed = 3;
      targetScale = 1;
    } else if (hovered) {
      targetDistort = 0.5;
      targetSpeed = 3;
      targetScale = 1.02;
    }

    materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
    materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.1);
    
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
      <Sphere 
        ref={meshRef}
        args={[1.4, 64, 64]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <MeshDistortMaterial
          ref={materialRef}
          color={theme.color}
          emissive={theme.emissive}
          emissiveIntensity={isSpeaking ? 0.8 : 0.2}
          envMapIntensity={2.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={0.2}
          speed={2}
          transparent
          opacity={0.95}
        />
      </Sphere>
    </Float>
  );
};

export const Avatar3DCanvas: React.FC<Avatar3DCanvasProps> = ({
  personaKey,
  isSpeaking,
  isListening,
  audioLevel = 0,
  onCanvasClick
}) => {
  const theme = PERSONA_THEMES[personaKey] || PERSONA_THEMES.emma;

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      onClick={onCanvasClick}
      title="Tap to interrupt"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-5, -5, 5]} intensity={0.5} color={theme.color} />
        
        {/* Soft volumetric lighting effect */}
        <SpotLight
          position={[0, 5, 2]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color={theme.color}
          castShadow
        />

        <NeuralOrb 
          isSpeaking={isSpeaking} 
          isListening={isListening} 
          audioLevel={audioLevel} 
          theme={theme} 
        />

        <Environment preset="city" />
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4}
          color={theme.color}
        />
      </Canvas>
    </div>
  );
};
