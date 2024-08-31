import React, { useRef, useState, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useDrag, useMove } from "react-use-gesture";
import * as THREE from "three";
import gsap from "gsap";
import _ from "lodash";
import lerp from "lerp";
import { useModel } from "../../state/Store";

function findIntersectItems(array, activeFloor) {
  const result = [];
  array.forEach((o) => {
    if (o.name === activeFloor) {
      result.push(o);
    } else {
      result.push(...findIntersectItems(o.children || [], activeFloor));
    }
  });
  return result;
}

function intersectsObjects(items) {
  let flatArray = [];
  items.forEach((el) => {
    if (el.isGroup) {
      flatArray = flatArray.concat(el.children);
    } else if (el.isMesh) {
      flatArray.push(el);
    }
  });
  return flatArray;
}

function Controls({ settings }) {
  const { camera, gl, scene, raycaster, mouse } = useThree();
  const [isMoving, setIsMoving] = useState(false);
  const yawObject = useRef(new THREE.Object3D());
  const pitchObject = useRef(new THREE.Object3D());
  const floorCircle = useRef();
  const activeFloor = useModel((state) => state.activeFloor);
  const PI_2 = Math.PI / 2;
  const dragSpeed = 3;

  const yLevel = settings?.floorCircle?.yLevel || 0;

  const drag = useDrag(
    (state) => {
      const { down, delta: [mx, my], tap, first } = state;

      if (tap) {
        raycaster.setFromCamera(mouse, camera);

        const sceneObj = scene.getObjectByName("Scene");
        const intersectsItems = findIntersectItems(sceneObj.children, activeFloor);
        const intersects = raycaster.intersectObjects(intersectsItems, false);

        intersects.forEach((intersect) => {
          const isFloor = intersect.object.name === activeFloor;
          if (isFloor) {
            setIsMoving(true);
            floorCircle.current.position.copy(intersect.point);

            gsap.to(camera.position, {
              duration: 0.8,
              x: intersect.point.x,
              z: intersect.point.z,
              onUpdate: () => camera.updateProjectionMatrix(),
              onComplete: () => setIsMoving(false),
            });

            const tl = gsap.timeline();
            tl.fromTo(
              floorCircle.current.children[0].material,
              { opacity: 1 },
              {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                  document.body.style.cursor = "grab";
                  floorCircle.current.children[0].material.opacity = 0;
                  floorCircle.current.children[0].scale.set(1, 1, 1);
                },
              }
            );
          }
        });
      } else if (down) {
        if (first) {
          const instructions = document.querySelector(".instructions");
          gsap.to(instructions, {
            opacity: 0,
            duration: 1.5,
            onComplete: () => {
              instructions.style.display = "none";
            },
          });
          document.body.style.cursor = "grab";
        }
        document.body.style.cursor = "grabbing";
        yawObject.current.rotation.y += (mx * dragSpeed) / 1000;
        pitchObject.current.rotation.x += (my * dragSpeed) / 1000;
        pitchObject.current.rotation.x = Math.max(
          -PI_2,
          Math.min(PI_2, pitchObject.current.rotation.x)
        );
      } else {
        document.body.style.cursor = "grab";
      }
    },
    { domTarget: gl.domElement, filterTaps: true }
  );

  let move = useMove(
    (state) => {
      raycaster.setFromCamera(mouse, camera);
      let sceneObj = _.find(scene.children, function (o) {
        return o.name === "Scene";
      });
  
      if (sceneObj) {
        const intersectsItems = findIntersectItems(
          sceneObj.children,
          activeFloor
        );
  
        var intersects = raycaster.intersectObjects(intersectsItems, true);
  
        intersects.map((intersectItem) => {
          const name = intersectItem.object.name;

  
          if (floorCircle.current) { // Check if floorCircle.current is defined
            switch (name) {
              case activeFloor:

                floorCircle.current.visible = true;
                floorCircle.current.position
                  .copy(intersectItem.point)
                  .add({ x: 0, y: yLevel, z: 0 });
                break;
              case "Furniture_Door":
                console.log("this is door");
                break;
              default:
                floorCircle.current.visible = false;
                break;
            }
          }
        });
  
        if (intersects.length <= 0 && floorCircle.current) {
          floorCircle.current.visible = false;
        }
      }
    },
    { domTarget: gl.domElement } // bind this hook to canvas
  );
  

  useEffect(() => {
    drag();
    move();
  }, [scene]);

  useEffect(() => {
    floorCircle.current = scene.getObjectByName("floorCircle");
  }, [scene]);

  useFrame(() => {
    camera.rotation.x = lerp(
      camera.rotation.x,
      -pitchObject.current.rotation.x,
      0.2
    );
    camera.rotation.y = lerp(
      camera.rotation.y,
      -yawObject.current.rotation.y,
      0.2
    );
  });

  return <group />;
}

export default Controls;
