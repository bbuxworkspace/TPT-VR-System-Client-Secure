import { Canvas } from "@react-three/fiber";
import { useLoader, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Html, useProgress, PerspectiveCamera } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import React, { useMemo, useState, useEffect, Suspense } from "react";
import { TextureLoader, PMREMGenerator, MeshBasicMaterial, VideoTexture, SRGBColorSpace } from "three";


import Navbar from "../components/UI/Navbar";
import Instructions from "../components/UI/Instructions";
import Camera from "../components/Camera";
import Controls from "../components/Controls";
import FloorCircle from "../components/FloorCircle";


function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const Model = () => {
  const { scene, gl } = useThree();
  const gltfLoader = useMemo(() => new GLTFLoader(), []);
  const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl]);

  gl.physicallyCorrectLights = true;
  gl.shadowMap.enabled = true;

  const [
    CoffeeTableMap,
    CurtainCarpetsMap,
    DecorMap,
    ExteriorMap,
    FramesMap,
    FurnitureMap,
    SofaMap,
    TableMap,
    TV_ShelfMap,
    Empty_ExteriorMap,
    Empty_FurnitureMap,
  ] = useLoader(TextureLoader, [
    "/assets/textures/AssalomHall/CoffeeTable3.webp",
    "/assets/textures/AssalomHall/CurtainCarpets3.webp",
    "/assets/textures/AssalomHall/Decor2.webp",
    "/assets/textures/AssalomHall/Exterior7.jpg",
    "/assets/textures/AssalomHall/Frames.webp",
    "/assets/textures/AssalomHall/Furniture2.webp",
    "/assets/textures/AssalomHall/Sofa2.webp",
    "/assets/textures/AssalomHall/Table2.webp",
    "/assets/textures/AssalomHall/TV_Shelf3.webp",
    "/assets/textures/AssalomHall/Empty_Exterior.webp",
    "/assets/textures/AssalomHall/Empty_Furniture.webp",
  ]);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco-gltf/");
  gltfLoader.setDRACOLoader(dracoLoader);

  const gltf = useLoader(GLTFLoader, "/Hall_v12.gltf", loader => {
    loader.setDRACOLoader(dracoLoader);
  });

  useMemo(() => {
    scene.add(gltf.scene);

    const textureLoader = new TextureLoader();
    textureLoader.load("/assets/environment/hall_envMap.webp", texture => {
      texture.encoding = SRGBColorSpace;
      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      const envMap = renderTarget.texture;
      texture.dispose();

      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.material.envMap = envMap;
          o.material.envMapIntensity = 1;
          o.material.lightMapIntensity = 2;

          if (o.name.includes("Interior_Chandeliers")) {
            o.material.envMapIntensity = 1;
          } else if (o.name.includes("CoffeeTable")) {
            o.material.lightMap = CoffeeTableMap;
            o.material.envMapIntensity = 0.1;
          } else if (o.name.includes("CurtainCarpet")) {
            o.material.lightMap = CurtainCarpetsMap;
            o.material.lightMapIntensity = 1.5;
          } else if (o.name.includes("Decor")) {
            o.material.lightMap = DecorMap;
            o.material.lightMapIntensity = 1;
          } else if (o.name.includes("Exterior")) {
            o.material.lightMap = ExteriorMap;
          } else if (o.name.includes("Frames")) {
            o.material.lightMap = FramesMap;
            o.material.envMapIntensity = 0.3;
          } else if (o.name.includes("Sofa")) {
            o.material.lightMap = SofaMap;
          } else if (o.name.includes("Table")) {
            o.material.lightMap = TableMap;
            o.material.envMapIntensity = o.material.name.includes("Chair_Base") ? 0.1 : 0.3;
          } else if (o.name.includes("TV_Shelf")) {
            o.material.lightMap = TV_ShelfMap;
          } else if (o.name.includes("TV_Screen")) {
            o.material = new MeshBasicMaterial({
              map: new VideoTexture(document.getElementById("video")),
            });
          } else if (o.name.includes("Door") || o.name.includes("Furniture")) {
            o.material.lightMap = FurnitureMap;
          }
        }
      });

      pmremGenerator.dispose();
    });

    return () => scene.remove(gltf.scene);
  }, [gltf.scene, scene, pmremGenerator]);

  return <primitive object={gltf.scene} scale={0.4} />;
};




export default function Hall({ width }) {

  const [fov, setFov] = useState(85);

  useEffect(() => {
    if (width < 500) {
      setFov(100);
    } else {
      setFov(120);
    }
  }, [width]);

  
  const config = {
    controls: {
      floorCircle: { yLevel: -0.03 },
    },
    camera: {},
  };



  return (
    <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      <Canvas gl={{ antialias: true }}>
        <Suspense fallback={<Loader />}>
        <Camera fov={fov} position={[1.5, 0.7, -0.5]} lookAt={[0, 0, 10]}/>

          {/* <PerspectiveCamera fov={fov} position={[1, 1.37, 0]} lookAt={[0, 0, 10]} /> */}
          {/* <OrbitControls
            enableDamping={true}
            dampingFactor={0.25}
            minDistance={0.5}
            maxDistance={10}
            minPolarAngle={Math.PI / 4} // Limit vertical rotation
            maxPolarAngle={Math.PI / 2} // Limit vertical rotation
            target={[1, 0, -1]} // Focus point of the camera
          /> */}

          <FloorCircle />
          <Model />
          <Controls settings={config.controls} />
          <Environment preset="sunset" background />
        </Suspense>
      </Canvas>
      <video
        id="video"
        loop
        crossOrigin="anonymous"
        style={{ display: "none" }}
      >
        <source
          src="/assets/video/promo_compressed.mp4"
          type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
        />
      </video>
      <Instructions />
      <Navbar active="Room-1" />
    </div>
  );
}
