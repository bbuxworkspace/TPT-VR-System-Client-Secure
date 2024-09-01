import React, { useRef } from "react";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";

export default ({ texture, transparent, opacity }) => {
  const circle = useRef();

  const circleTexture = useLoader(TextureLoader, texture);

  return (
    <mesh ref={circle} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry attach='geometry' args={[0.2, 32]} />
      <meshStandardMaterial
        attach='material'
        map={circleTexture}
        transparent={true}
        opacity={opacity || 1}
      />
    </mesh>
  );
};
