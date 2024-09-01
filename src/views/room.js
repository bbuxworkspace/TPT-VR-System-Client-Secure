import { Canvas } from "@react-three/fiber";
import { useLoader, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Html, useProgress, PerspectiveCamera, Stats } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import React, { useMemo, useState, useEffect, Suspense } from "react";
import { TextureLoader, PMREMGenerator, MeshBasicMaterial, VideoTexture, SRGBColorSpace, ACESFilmicToneMapping, DefaultLoadingManager, SpotLight ,DirectionalLight } from "three";
import { useControls } from 'leva'
import { useRef } from 'react'
import * as THREE from 'three'

import { useModel } from "../state/Store";
import Navbar from "../components/UI/Navbar";
import Instructions from "../components/UI/Instructions";
import Camera from "../components/Camera";
import Controls from "../components/Controls";
import FloorCircle from "../components/FloorCircle";
import LoadingManager from "../components/LoadingManager";
import LoadingPage from "../components/UI/LoadingPage";

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}


function Lights() {
  const ambientRef = useRef()
  const directionalRef = useRef()
  const pointRef = useRef()
  const spotRef = useRef()

  useControls('Ambient Light', {
    visible: {
      value: false,
      onChange: (v) => {
        ambientRef.current.visible = v
      },
    },
    color: {
      value: 'white',
      onChange: (v) => {
        ambientRef.current.color = new THREE.Color(v)
      },
    },
  })

  useControls('Directional Light', {
    visible: {
      value: true,
      onChange: (v) => {
        directionalRef.current.visible = v
      },
    },
    position: {
      x: 1,
      y: 1,
      z: 1,
      onChange: (v) => {
        directionalRef.current.position.copy(v)
      },
    },
    color: {
      value: 'white',
      onChange: (v) => {
        directionalRef.current.color = new THREE.Color(v)
      },
    },
  })

  useControls('Point Light', {
    visible: {
      value: false,
      onChange: (v) => {
        pointRef.current.visible = v
      },
    },
    position: {
      x: 2,
      y: 0,
      z: 0,
      onChange: (v) => {
        pointRef.current.position.copy(v)
      },
    },
    color: {
      value: 'white',
      onChange: (v) => {
        pointRef.current.color = new THREE.Color(v)
      },
    },
  })

  useControls('Spot Light', {
    visible: {
      value: false,
      onChange: (v) => {
        spotRef.current.visible = v
      },
    },
    position: {
      x: 3,
      y: 2.5,
      z: 1,
      onChange: (v) => {
        spotRef.current.position.copy(v)
      },
    },
    color: {
      value: 'white',
      onChange: (v) => {
        spotRef.current.color = new THREE.Color(v)
      },
    },
  })

  return (
    <>
      <ambientLight ref={ambientRef} />
      <directionalLight ref={directionalRef} />
      <pointLight ref={pointRef} />
      <spotLight ref={spotRef} />
    </>
  )
}


const Model = () => {
  const { scene, gl } = useThree();
  const { setModel, setScene, setLightMaps } = useModel((state) => state);
  // const gltfLoader = useMemo(() => new GLTFLoader(), []);
  // const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl]);
  const loader = new GLTFLoader();
  const pmremGenerator = new PMREMGenerator(gl);
  const video = document.getElementById("video");
  const videoTexture = new VideoTexture(video);
  videoTexture.flipY = false; // Ensure the video texture is not inverted
  videoTexture.needsUpdate = true;

  gl.physicallyCorrectLights = true;
  gl.shadowMap.enabled = true;
  gl.toneMapping = ACESFilmicToneMapping;
  gl.toneMappingExposure = 1;
  gl.outputEncoding = SRGBColorSpace;


  const [
    exteriorLightMap,
    interiorLightMap_1,
    interiorLightMap_2,
    interiorLightMap_3,
    Empty_ExteriorMap
  ] = useLoader(TextureLoader, [
    "/assets/textures/room2/Exterior_LightMap_compressed.jpg",
    "/assets/textures/room2/Interior_1_LightMap_compressed.webp",
    "/assets/textures/room2/Interior_2_LightMap_compressed.webp",
    "/assets/textures/room2/Interior_3_LightMap_compressed.webp",
    "/assets/textures/room2/Exterior_Empty_LightMap.webp"
  ]);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco-gltf/");
  loader.setDRACOLoader(dracoLoader);


  exteriorLightMap.flipY = false;
  interiorLightMap_1.flipY = false;
  interiorLightMap_2.flipY = false;
  interiorLightMap_3.flipY = false;



  useMemo(() => {
    let envMap;
    // DefaultLoadingManager.onLoad = () => pmremGenerator.dispose();

    // scene.add(scene);
    setModel(scene);
    // setScene(scene);


    setLightMaps({
      empty: [Empty_ExteriorMap],
      nonEmpty: [exteriorLightMap],
    });


    const textureLoader = new TextureLoader();
    textureLoader.load("/assets/environment/room_2_1.webp", (texture) => {

      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      envMap = renderTarget.texture;
      pmremGenerator.dispose();
    

    });

    textureLoader.load("assets/environment/room_2_2.webp", (texture) => {
      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      envMap = renderTarget.texture;
      texture.dispose();

  
    });

    textureLoader.load("assets/environment/hdri3_compressed.jpg", (texture) => {
      // texture.encoding = SRGBColorSpace;
      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      scene.background = renderTarget.current;
      texture.dispose();

    });


    loader.load('/Room_v2.gltf', function(gltf) {

      scene.add(gltf.scene);
      setScene(gltf.scene);

      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true; // Enable casting shadows
          o.receiveShadow = true; // Enable receiving shadows
          o.material.envMap = envMap;
          o.material.envMapIntensity = 1;
          o.material.lightMapIntensity = 2;

          if (o.name.includes("TV_Screen")) {
              o.material = new MeshBasicMaterial({
                map: videoTexture,

              });
            }

          // o.material.needsUpdate = true;


          // if (
          //   o.name.includes("Exterior") &&
          //   !o.name.includes("Curtain_Exterior")
          // ) {
          //   o.material.lightMap = exteriorLightMap;
          //   if (o.material.name.includes("Door_Handle")) {
          //     o.material.envMap = envMap;
          //   }
          // } else if (o.name.includes("Interior_1")) {
          //   o.material.lightMap = interiorLightMap_1;
          //   o.material.lightMapIntensity = 2;
          // } else if (o.name.includes("Interior_2")) {
          //   o.material.lightMap = interiorLightMap_2;
          //   o.material.lightMapIntensity = 1;
          //   if (
          //     o.material.name.includes("Mac_Corpus") ||
          //     o.material.name.includes("Mac_Screen") ||
          //     o.material.name.includes("Mac_Keyboard")
          //   ) {
          //     o.material.envMap = envMap;
          //     o.material.envMapIntensity = 0.3;
          //   }
          //   if (o.material.name.includes("TV_Screen")) {
          //     o.material.envMap = envMap;
          //     o.material.roughness = 0;
          //     o.material.envMapIntensity = 0.3;
          //   }
          // } else if (o.name.includes("Interior_3")) {
          //   o.material.lightMap = interiorLightMap_3;
          //   o.material.lightMapIntensity = 1;
          //   o.material.envMap = envMap;
          //   o.material.envMapIntensity = 0.3;
          //   o.material.roughness = 0;
          // } else if (o.name.includes("Glasses")) {
          //   o.material.envMap = envMap;
          //   o.material.roughness = 0;
          //   o.material.refractionRatio = 0;
          //   o.material.opacity = 0.2;
          //   o.material.metalness = 1;
          //   o.material.envMapIntensity = 2;
          // } else if (o.name.includes("Lamp")) {
          //   if (o.material.name.includes("Lamp_Corpus")) {
          //     o.material.envMap = envMap;
          //     o.material.roughness = 0.2;
          //     o.material.envMapIntensity = 1;
          //   }
          // } else {
          //   o.material.envMapIntensity = 1;
          // }
          // o.material.needsUpdate = true;
        }
      });

    });




    

    
  }, []);
  return <></>;
};




export default function Room({ width }) {

  const [fov, setFov] = useState(55);


  useEffect(() => {
    if (width < 500) {
      setFov(85);
    } else {
      setFov(55);
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
      <Canvas gl={{ antialias: true, physicallyCorrectLights: true}}>

      <LoadingManager total={27} />
        
        <Suspense fallback={<Loader />}>
        {/* <Lights /> */}
        {/* <Camera fov={fov} position={[0.7, 0.5, -0.5]} lookAt={[0, 0, 10]}/> */}
        <Camera fov={fov} position={[0.7, 1.5, 2.5]}/>

        {/* <PerspectiveCamera fov={fov} position={[15, 3, -0.5]} lookAt={[0, 0, 10]} /> */}

          <ambientLight intensity={0.5} />
          {/* <directionalLight
            castShadow
            position={[5,3,12]}
            intensity={3}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          /> */}
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
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
          {/* <directionalLight position={[2,3,-0.16]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /> */}
          {/* <ContactShadows frames={10} position={[0,-2,-0.16]} rotation={[0,-Math.PI/2,0]} scale={0.8} opacity={0.1} blur={0.5} color='black'/> */}
          <FloorCircle />
          <Model />
          <Controls settings={config.controls} />
          {/* <Environment preset="sunset" background /> */}
          <Stats />
        </Suspense>
      </Canvas>

      <video
        id="video"
        loop
        crossOrigin="anonymous"
        style={{ display: "none" }}
        autoplay="true"
        muted="muted"
        >
        <source
          src="/assets/video/promo_compressed.mp4"
          type="video/mp4"
        />
      </video>
      <Instructions />
      <LoadingPage />
      <Navbar active="room" />
    </div>
  );
}
