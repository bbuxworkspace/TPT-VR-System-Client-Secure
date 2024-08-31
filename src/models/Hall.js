import React, { useMemo, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { TextureLoader, PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace, GammaEncoding, MeshBasicMaterial, VideoTexture } from "three";
import { useModel } from "../state/Store";

export default function Model() {
  const { scene, gl } = useThree();
  const { setModel, setLightMaps } = useModel((state) => state);

  const gltfLoader = useMemo(() => new GLTFLoader(), []);
  const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl]);

  // Load textures
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

  useEffect(() => {
    // DRACO loader setup
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco-gltf/");
    gltfLoader.setDRACOLoader(dracoLoader);

    // Load model
    gltfLoader.load(
      "/untitled.gltf",
      (gltf) => {
        setModel(gltf.scene);
        scene.add(gltf.scene);

        // Environment map setup
        const textureLoader = new TextureLoader();
        textureLoader.load("/assets/environment/hall_envMap.webp", (texture) => {
          texture.encoding = SRGBColorSpace;  // Updated encoding
          const renderTarget = pmremGenerator.fromEquirectangular(texture);
          const envMap = renderTarget.texture;
          texture.dispose();

          // Set up materials
          gltf.scene.traverse((o) => {
            if (o.isMesh) {
              o.material.envMap = envMap;
              o.material.envMapIntensity = 0.2;
              o.material.lightMapIntensity = 2;
              
              // Adjust material properties based on object names
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

          // Clean up resources
          pmremGenerator.dispose();
        });

        pmremGenerator.compileEquirectangularShader();
      },
      undefined, // Progress callback can be added here if needed
      (error) => console.error("An error happened", error)
    );
  }, [scene, gltfLoader, pmremGenerator, setModel]);

  return null;
}
