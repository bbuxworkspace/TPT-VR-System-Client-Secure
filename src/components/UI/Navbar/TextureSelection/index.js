import React, { useState } from "react";
import { useModel } from "../../../../state/Store";
import { TextureLoader, RepeatWrapping, SRGBColorSpace, Color } from "three";
import {
  TextureSelectionWrapper,
  Title,
  SelectionList,
  SelectionItem,
  DoorItem
} from "./style";

const onSelectItem = (model, item, type, setSelectedItem) => {
  const { textureImg } = item;
  const loader = new TextureLoader();
  const color = new Color(item.color);

  if (model) {
    model.traverse((o) => {
      if (o.name.includes(type)) {
        if (type === "Wall") {
          o.material.color = color;
        } else if (type === "Door") {
          loader.load(
            textureImg,
            (texture) => {
              texture.repeat.set(4, 4);
              texture.wrapS = RepeatWrapping;
              texture.wrapT = RepeatWrapping;
              texture.flipY = false;
              o.material.map = texture;
              o.material.needsUpdate = true;
            },
            undefined,
            (error) => {
              console.error(error);
            }
          );
        } else {
          loader.load(
            textureImg,
            (texture) => {
              texture.repeat.set(4, 4);
              texture.colorSpace = SRGBColorSpace;
              texture.wrapS = RepeatWrapping;
              texture.wrapT = RepeatWrapping;
              o.material.map = texture;
              o.material.needsUpdate = true;
            },
            undefined,
            (error) => {
              console.error(error);
            }
          );
        }
      }
    });

    setSelectedItem(item);
  }
};

export default function TextureSelection({
  data,
  type,
  doorSelection = false
}) {
  const [selectedItem, setSelectedItem] = useState({
    id: null
  });

  const model = useModel((state) => state.model);

  return (
    <TextureSelectionWrapper isDoorSelection={doorSelection}>
      <Title>{"Please select"}:</Title>
      <SelectionList>
        {data.map((item) => {
          const isSelected = selectedItem.id === item.id;

          return (
            <SelectionItem
              onClick={() => onSelectItem(model, item, type, setSelectedItem)}
              isDoorSelection={doorSelection}
              key={item.id}
              className={isSelected ? "is-selected" : null}
              src={item.textureImg ? item.textureImg : item.color}
              isColor={item.color}
              title={item.name}
            >
              {isSelected ? (
                <div
                  id='tick-mark'
                  className={doorSelection ? "door" : null}
                ></div>
              ) : null}
              {doorSelection ? (
                <DoorItem>
                  <div className='door-img'>
                    <img src={item.textureImg} alt='' />
                  </div>
                  <div className='info-details'>
                    <h1>IKEA - 9203</h1>
                    <p>
                      <strong> color:</strong> white wood
                    </p>
                    <p>
                      <strong>lock:</strong> german hurtz
                    </p>
                  </div>
                </DoorItem>
              ) : null}
            </SelectionItem>
          );
        })}
      </SelectionList>
    </TextureSelectionWrapper>
  );
}
