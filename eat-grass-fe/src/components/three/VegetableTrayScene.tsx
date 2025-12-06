import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface VegetableTraySceneProps {
  modelUrl?: string;
}

function Model({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      rotation={[0, 0, 0]}
    />
  );
}

export default function VegetableTrayScene({
  modelUrl = "/3d/vegetable_tray.glb",
}: VegetableTraySceneProps) {
  const [scale, setScale] = useState(5);

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 720) {
        setScale(3);
      } else {
        setScale(5);
      }
    };

    // Set initial scale
    updateScale();

    // Listen for window resize
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div className="w-full h-[320px] relative">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Model with Suspense */}
        <Suspense fallback={null}>
          <Model url={modelUrl} scale={scale} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/3d/vegetable_tray.glb");
