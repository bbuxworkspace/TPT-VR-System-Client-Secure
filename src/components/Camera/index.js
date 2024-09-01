import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

export default function Camera({ fov = 55, ...props }) {
  const ref = useRef();
  const { camera, gl, set } = useThree();

  useEffect(() => {
    ref.current.rotation.order = "YXZ";
    ref.current.aspect = window.innerWidth / window.innerHeight; // Ensures correct aspect ratio
    ref.current.updateProjectionMatrix();
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
        aspect={window.innerWidth / window.innerHeight} // Set aspect ratio
        far={100}
        near={0.5}
        {...props}
      />
    </>
  );
}
