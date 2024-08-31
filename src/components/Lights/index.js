import React from "react";
import { useControls } from "leva";
import { AmbientLight, HemisphereLight, PointLight } from "@react-three/drei";

export default function LightingControls() {
  // Using Leva to create control panels
  const { ambientIntensity } = useControls("Ambient Light", {
    ambientIntensity: {
      value: 1,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  const { hemisphereIntensity } = useControls("Hemisphere Light", {
    hemisphereIntensity: {
      value: 0.5,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  const { pointIntensity, posX, posY, posZ } = useControls("Point Light", {
    pointIntensity: {
      value: 1,
      min: 0,
      max: 10,
      step: 0.1,
    },
    posX: {
      value: 0,
      min: -10,
      max: 10,
      step: 0.1,
    },
    posY: {
      value: 0,
      min: -10,
      max: 10,
      step: 0.1,
    },
    posZ: {
      value: 0,
      min: -10,
      max: 10,
      step: 0.1,
    },
  });

  return (
    <group>
      {/* Ambient Light */}
      <ambientLight intensity={ambientIntensity} />

      {/* Hemisphere Light */}
      <hemisphereLight intensity={hemisphereIntensity} />

      {/* Point Light */}
      <pointLight intensity={pointIntensity} position={[posX, posY, posZ]} />
    </group>
  );
}
