import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface GroceryItemDisplayProps {
  imageUrl: string;
  itemName: string;
  modelUrl?: string | null;
}

// Mapping of grocery item names to their 3D model files and scales
const MODEL_MAP: Record<string, { url: string; scale: number }> = {
  "Eggs 10pcs": { url: "/egg.glb", scale: 2 },
  "Fresh Chicken 1kg": { url: "/chicken.glb", scale: 1.5 },
  "White Rice 5kg": { url: "/rice.glb", scale: 9 },
  "Cooking Oil 1L": { url: "/gameready_oil_bottle_model.glb", scale: 2.5 },
  "Tomatoes 1kg": { url: "/tomato.glb", scale: 0.2 },
  "Milk 1L": { url: "/super_awesome_milk_carton.glb", scale: 0.09 },
  "Bread White Loaf": {
    url: "/a_soviet_white_bread_nareznoy_baton..glb",
    scale: 0.8,
  },
  "Onions 1kg": { url: "/red_onion.glb", scale: 2.5 },
};

function Model3D({ url, scale }: { url: string; scale: number }) {
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

export default function GroceryItemDisplay({
  imageUrl,
  itemName,
  modelUrl,
}: GroceryItemDisplayProps) {
  // Determine which model to use
  const modelInfo = modelUrl
    ? { url: modelUrl, scale: 2 } // Default scale for custom modelUrl
    : MODEL_MAP[itemName] || null;

  // If no model available, use image
  if (!modelInfo) {
    return (
      <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-lg ring-4 ring-primary/10 bg-white">
        <img
          src={imageUrl}
          alt={itemName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/200?text=No+Image";
          }}
        />
      </div>
    );
  }

  // Use 3D model
  return (
    <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Environment preset="sunset" />
        <Suspense fallback={null}>
          <Model3D url={modelInfo.url} scale={modelInfo.scale} />
        </Suspense>
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
