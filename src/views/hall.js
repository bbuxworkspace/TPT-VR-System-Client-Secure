import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import * as THREE from 'three';
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Html, useProgress, PerspectiveCamera, Stats } from "@react-three/drei";
import { XR, useXR } from '@react-three/xr';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { TextureLoader, PMREMGenerator, MeshBasicMaterial, VideoTexture, SRGBColorSpace, ACESFilmicToneMapping, DefaultLoadingManager, SpotLight ,DirectionalLight } from "three";
import { useControls } from 'leva';


import { useModel } from "../state/Store";
import Navbar from "../components/UI/Navbar";
import Instructions from "../components/UI/Instructions";
import Camera from "../components/Camera";
import Controls from "../components/Controls";
import FloorCircle from "../components/FloorCircle";
import LoadingManager from "../components/LoadingManager";
import LoadingPage from "../components/UI/LoadingPage";
import AudioPlayer from '../components/AudioPlayer'; // Import the AudioPlayer component

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


const Model = ({toggleAudio}) => {
  const { scene, gl } = useThree();
  const { setModel, setScene, setLightMaps } = useModel((state) => state);
  const isMounted = useRef(true);
  // const gltfLoader = useMemo(() => new GLTFLoader(), []);
  // const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl]);
  const loader = new GLTFLoader();
  const pmremGenerator = new PMREMGenerator(gl);
  const video = document.getElementById("video");
  const videoTexture = new VideoTexture(video);
  videoTexture.flipY = false; // Ensure the video texture is not inverted


  gl.physicallyCorrectLights = true;
  gl.shadowMap.enabled = true;
  gl.toneMapping = ACESFilmicToneMapping;
  gl.toneMappingExposure = 1;
  gl.outputEncoding = SRGBColorSpace;

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
  loader.setDRACOLoader(dracoLoader);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useMemo(() => {
    let envMap;

    // scene.add(scene);
    setModel(scene);


    setLightMaps({
      empty: [Empty_ExteriorMap, Empty_FurnitureMap],
      nonEmpty: [ExteriorMap, FurnitureMap],
    });


    const textureLoader = new TextureLoader();
    textureLoader.load("/assets/environment/hall_envMap.webp", texture => {

      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      envMap = renderTarget.texture;
      pmremGenerator.dispose();


    });

    loader.load('/Hall_v12.gltf', function(gltf) {

      scene.add(gltf.scene);
      setScene(gltf.scene);
      setModel(gltf.scene);  // Correctly set the loaded GLTF model



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

               // Add click event listener
            o.onClick = () => {
              toggleAudio();
            };
            }



          // if (o.name.includes("Interior_Chandeliers")) {
          //   o.material.envMapIntensity = 1;
          // } else if (o.name.includes("CoffeeTable")) {
          //   o.material.lightMap = CoffeeTableMap;
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
          //   o.material.envMapIntensity = 0.3;
          // } else if (o.name.includes("Sofa")) {
          //   o.material.lightMap = SofaMap;
          // } else if (o.name.includes("Table")) {
          //   o.material.lightMap = TableMap;
          //   o.material.envMapIntensity = o.material.name.includes("Chair_Base") ? 0.1 : 0.3;
          // } else if (o.name.includes("TV_Shelf")) {
          //   o.material.lightMap = TV_ShelfMap;
          // } else if (o.name.includes("TV_Screen")) {
          //   o.material = new MeshBasicMaterial({
          //     map: new VideoTexture(document.getElementById("video")),
          //   });
          // } else if (o.name.includes("Door") || o.name.includes("Furniture")) {
          //   o.material.lightMap = FurnitureMap;
          // }
        }
      });

    });

    


    
  }, []);
  return <></>;
};




export default function Hall({ width }) {

  const [fov, setFov] = useState(55);
  const [isPlaying, setIsPlaying] = useState(false);
  const rendererRef = useRef();

  // Add VRButton to the document
  useEffect(() => {
    if (rendererRef.current) {
      const renderer = rendererRef.current;
      document.body.appendChild(VRButton.createButton(renderer));
    }
  }, [rendererRef]);


  useEffect(() => {
    if (width < 500) {
      setFov(85);
    } else {
      setFov(55);
    }
  }, [width]);

  const handleAudioEnd = () => {
    setIsPlaying(false); // Handle when audio ends
  };


  

  
  const config = {
    controls: {
      floorCircle: { yLevel: -0.03 },
    },
    camera: {},
  };



  return (
    <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      <Canvas gl={{ antialias: true, physicallyCorrectLights: true}} ref={rendererRef}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#202020"));
          gl.xr.enabled = true; // Enable XR (VR)
        }}>

        <LoadingManager total={39} />

        <Suspense fallback={<Loader />}>
        {/* <Lights /> */}
        {/* <Camera fov={fov} position={[0.7, 0.5, -0.5]} lookAt={[0, 0, 10]}/> */}
        <Camera fov={fov} position={[1.7, 1.5, -0.5]}/>

        {/* <PerspectiveCamera fov={fov} position={[15, 3, -0.5]} lookAt={[0, 0, 10]} /> */}

          <ambientLight intensity={0.5} />
          {/* <directionalLight
            castShadow
            position={[5,3,12]}
            intensity={2}
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
          {/* <directionalLight position={[2,3,-0.16]} intensity={2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /> */}
          {/* <ContactShadows frames={10} position={[0,-2,-0.16]} rotation={[0,-Math.PI/2,0]} scale={0.8} opacity={0.1} blur={0.5} color='black'/> */}
          <FloorCircle />
          <Model/>
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
          type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
        />
      </video>

      <AudioPlayer 
        url="/assets/audio/voiceover.mp3" 
        isPlaying={isPlaying}
        onEnded={handleAudioEnd} 
      />
      <Instructions />
      <LoadingPage />
      <Navbar active="hall" />
    </div>
  );
}
