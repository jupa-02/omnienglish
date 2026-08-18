'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Environment, Float, Center } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarCanvasProps {
  isListening: boolean;
  isSpeaking: boolean;
  volumeLevel?: number; // 0 to 1
}

const AnimatedAvatar: React.FC<AvatarCanvasProps> = ({ isListening, isSpeaking, volumeLevel = 0 }) => {
  const materialRef = useRef<any>(null);
  
  // Base configuration based on state
  const targetDistort = isSpeaking ? 0.4 + (volumeLevel * 0.4) : isListening ? 0.2 : 0.1;
  const targetSpeed = isSpeaking ? 4 + (volumeLevel * 5) : isListening ? 2 : 1;
  
  // Colors for different states
  const colors = useMemo(() => {
    return {
      idle: new THREE.Color('#e0e7ff'), // indigo-100
      listening: new THREE.Color('#a7f3d0'), // emerald-200
      speaking: new THREE.Color('#818cf8'), // indigo-400
    };
  }, []);

  const targetColor = isSpeaking ? colors.speaking : isListening ? colors.listening : colors.idle;

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Smoothly interpolate material properties
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.1);
      
      // Smoothly interpolate color
      materialRef.current.color.lerp(targetColor, 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          ref={materialRef}
          color={colors.idle}
          envMapIntensity={1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          metalness={0.1}
          roughness={0.4}
          distort={0.1}
          speed={1}
        />
      </Sphere>
    </Float>
  );
};

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ isListening, isSpeaking, volumeLevel }) => {
  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[400px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 shadow-inner flex items-center justify-center">
      {/* Soft background glow based on state */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isSpeaking ? 'opacity-30 bg-indigo-300' : isListening ? 'opacity-30 bg-emerald-300' : 'opacity-0'
        } blur-[100px] rounded-full transform scale-150`} 
      />
      
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#818cf8" />
        
        <Center>
          <AnimatedAvatar 
            isListening={isListening} 
            isSpeaking={isSpeaking} 
            volumeLevel={volumeLevel} 
          />
        </Center>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
