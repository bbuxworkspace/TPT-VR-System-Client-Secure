import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { Environment, PerspectiveCamera, OrbitControls, Html, useProgress, KeyboardControls, ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { TextureLoader, PMREMGenerator, MeshBasicMaterial, VideoTexture, SRGBColorSpace, ACESFilmicToneMapping, DefaultLoadingManager, SpotLight ,DirectionalLight } from "three";
import { Physics, RigidBody } from '@react-three/rapier';
import { useControls } from "leva";

import Navbar from "../components/UI/Navbar";
import Instructions from "../components/UI/Instructions";
import Camera from "../components/Camera";
import Controls from "../components/Controls";
import FloorCircle from "../components/FloorCircle";
import { useModel } from "../state/Store";

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const Model = () => {
  const { scene, gl } = useThree();
  const { setModel, setScene, setLightMaps } = useModel((state) => state);
  let pngCubeRenderTarget, pngBackground, envMap;

  const loader = new GLTFLoader();
  const pmremGenerator = new PMREMGenerator(gl);
  const video = document.getElementById("video");
  const videoTexture = new VideoTexture(video);

  let [
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

  // Set flipY for textures
  [ExteriorMap, SofaMap, DecorMap, CurtainCarpetsMap, FramesMap, CoffeeTableMap, TV_ShelfMap, TableMap, FurnitureMap].forEach(map => {
    map.flipY = false;
  });

  useMemo(() => {
    DefaultLoadingManager.onLoad = () => pmremGenerator.dispose();

    setLightMaps({
      empty: [Empty_ExteriorMap, Empty_FurnitureMap],
      nonEmpty: [ExteriorMap, FurnitureMap],
    });

    setScene(scene);

    const textureLoader = new TextureLoader();
    textureLoader.load("/assets/environment/hall_envMap.webp", texture => {
      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      pngBackground = renderTarget.texture;
      envMap = renderTarget.texture;

      pmremGenerator.dispose();

    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 1;
    gl.outputEncoding = SRGBColorSpace;
    gl.physicallyCorrectLights = true;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco-gltf/");
    loader.setDRACOLoader(dracoLoader);

    loader.load("/Hall_v12.gltf", function (gltf) {
      setModel(gltf.scene);
      scene.add(gltf.scene);

      gltf.scene.traverse((o) => {
        if (o.isMesh) {

          o.castShadow = true; // Enable casting shadows
          o.receiveShadow = true; // Enable receiving shadows
          o.material.envMapIntensity = 0.2;
          o.material.lightMapIntensity = 2;

          // Set special materials based on object names
          if (o.name.includes("TV_Screen")) {
            o.material = new MeshBasicMaterial({ map: videoTexture });
          }
          // } else if (o.name.includes("Interior_Chandeliers")) {
          //   o.material.envMap = envMap;
          //   o.material.envMapIntensity = 1;
          // } else if (o.name.includes("CoffeeTable")) {
          //   o.material.lightMap = CoffeeTableMap;
          //   o.material.envMap = envMap;
          //   o.material.envMapIntensity = 0.1;
          // } else if (o.name.includes("CurtainCarpet")) {
          //   o.material.lightMap = CurtainCarpetsMap;
          //   o.material.lightMapIntensity = 1.5;
          // } else if (o.name.includes("Decor")) {
          //   o.material.lightMap = DecorMap;
          //   o.material.lightMapIntensity = 1;
          // } else if (o.name.includes("Exterior")) {
          //   o.material.lightMap = ExteriorMap;
          // } else if (o.name.includes("Frames")) {
          //   o.material.lightMap = FramesMap;
          //   o.material.envMap = envMap;
          //   o.material.envMapIntensity = 0.3;
          //   if (o.material.name.includes("Frame_Image")) {
          //     o.material.roughness = 0;
          //     o.material.envMapIntensity = 0.3;
          //   }
          // } else if (o.name.includes("Sofa")) {
          //   o.material.lightMap = SofaMap;
          // } else if (o.name.includes("Table")) {
          //   o.material.lightMap = TableMap;
          //   o.material.envMap = envMap;
          //   o.material.envMapIntensity = 0.3;
          // } else if (o.name.includes("Furniture")) {
          //   o.material.lightMap = FurnitureMap;
          // } else if (o.name.includes("Glass")) {
          //   o.material.envMap = envMap;
          //   o.material.envMapIntensity = 1;
          // }
          // if (o.material.name.includes("Handle") || o.material.name.includes("Curtain_Sides")) {
          //   o.material.envMap = envMap;
          // }
        }
      });
    });
    });

    
  }, []);

  return <></>;
};

export default function Hall({ width }) {
  const [fov, setFov] = useState(65);

  useEffect(() => {
    setFov(width < 500 ? 65 : 65);
  }, [width]);


  return (
    <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      {/* <Leva /> */}
      <Canvas gl={{ antialias: true }}>
          <Suspense fallback={<Loader />}>
              <Camera fov={fov} position={[1.7, 1.5, -0.5]}/>

              {/* <PerspectiveCamera fov={fov} position={[15, 3, -0.5]} lookAt={[0, 0, 10]} /> */}
             
                {/* <ambientLight intensity={0.2} />
                <directionalLight
                  castShadow
                  position={[0, 0, 0]}
                  intensity={1}
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                  shadow-camera-far={50}
                  shadow-camera-left={-10}
                  shadow-camera-right={10}
                  shadow-camera-top={10}
                  shadow-camera-bottom={-10}
                />
                <spotLight
                  castShadow
                  position={[10, 10, 10]}
                  angle={0.15}
                  penumbra={1}
                  decay={0}
                  intensity={Math.PI}
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}

      <directionalLight position={[2,3,-0.16]} intensity={5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
       <ambientLight intensity={1}/>
       <ContactShadows frames={10} position={[0,-2,-0.16]} rotation={[0,-Math.PI/2,0]} scale={0.8} opacity={0.1} blur={0.5} color='black'/>
       
                <FloorCircle />
                <Model />
                <Controls settings={{ floorCircle: { yLevel: -0.03 } }} />
                <Environment preset="sunset" background />
          </Suspense>
      </Canvas>
      <video id="video" loop crossOrigin="anonymous" style={{ display: "none" }}>
        <source src="/assets/video/promo_compressed.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
      </video>
      <Navbar />
      <Instructions />
    </div>
  );
}
