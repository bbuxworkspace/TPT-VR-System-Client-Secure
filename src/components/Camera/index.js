import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Camera({ fov = 65, ...props }) {
  const ref = useRef();
  const { camera, gl, set } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    ref.current.rotation.order = "YXZ";
    set({ camera: ref.current });
  }, [set]);

  useFrame(() => {
    ref.current.updateMatrixWorld();
  });

  // Ensure these settings are applied correctly.
  // If you imported sRGBEncoding directly, use it instead of THREE.sRGBEncoding.
  gl.outputEncoding = THREE.SRGBColorSpace;
  gl.physicallyCorrectLights = true;
  gl.shadowMap.enabled = true;

  return (
    <>
      <perspectiveCamera
        ref={ref}
        fov={fov}
        far={100}
        near={0.5}
        {...props}
      />
    </>
  );
}
