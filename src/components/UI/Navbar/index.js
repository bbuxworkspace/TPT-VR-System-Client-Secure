import React, { useState, useEffect } from "react";
import {
  NavbarWrapper,
  NavbarIcon,
  NavbarContent,
  AccordionWrapper,
  LanguageButton,
  Contacts,
} from "./style";
import { withTheme } from "styled-components";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import TextureSelection from "./TextureSelection";
import { useModel } from "../../../state/Store";
import { useNavigate } from 'react-router-dom';
import { doorData, floorData as floorData2, wallData } from "./data";
import Button from "../Button";

const Navbar = ({ active, theme }) => {
  const nav = React.useRef();
  const navIcon = React.useRef();
  const navigate = useNavigate();
  const [floorData, setFloorData] = useState([]);
  const [toggleFurniture, setToggleFurniture] = useState(false);
  const [toggleRoom, setToggleRoom] = useState(true);

  const { model, scene, setActiveFloor, lightMaps } = useModel((state) => state);

  const accordionList = [
    {
      id: 1,
      title: "Flooring",
      type: "Floor",
      isDoorSelection: false,
      data: floorData,  // Use the floorData state here
    },
    // {
    //   id: 2,
    //   title: "Wall Paint",
    //   type: "Wall",
    //   isDoorSelection: false,
    //   data: wallData,
    // },
    // {
    //   id: 3,
    //   title: "Doors",
    //   type: "Door",
    //   isDoorSelection: true,
    //   data: doorData,
    // },
  ];

  // Retrieve floor data from localStorage and filter it
  useEffect(() => {
    const storedTiles = localStorage.getItem('tiles');
    if (storedTiles) {
      try {
        const parsedTiles = JSON.parse(storedTiles).map((tile, index) => ({
          id: index + 1,
          name: tile.name,
          textureImg: `/assets/floors/${tile.image}`, // Adding /assets prefix to textureImg
        }));
        setFloorData(parsedTiles);
        console.log("NavBar Parsed",parsedTiles);
      } catch (error) {
        console.error("Error parsing tiles from localStorage:", error);
        setFloorData(floorData2);
        console.log("NavBar Error",floorData2);

      }
    } else {
      setFloorData(floorData2);
    }
  }, []);

  function handleOpen() {
    if (nav.current.classList.contains("show-nav")) {
      nav.current.classList.remove("show-nav");
    } else {
      nav.current.classList.add("show-nav");
    }

    if (navIcon.current.classList.contains("open")) {
      navIcon.current.classList.remove("open");
    } else {
      navIcon.current.classList.add("open");
    }
  }

  function handleDisableFurniture() {
    
    if (model) {
      model.traverse((o) => {
        if (o.isMesh) {
          if (o.name.includes("Interior")) {
            o.visible = !o.visible;
          }
        }
      });
    }
  }

  const changeRoom = (page) => {
    navigate(page); // Navigate to the specific page
  };

  

  return (
    <NavbarWrapper ref={nav}>
      <NavbarIcon onClick={handleOpen}>
        <div id='nav-icon4' ref={navIcon}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </NavbarIcon>
      <NavbarContent>
        <div className='logo' style={{ marginBottom: 20 }}>
          <img
            src='/assets/images/logo.jpg'
            style={{ width: 120 }}
            alt='Logo'
          />
        </div>
        <div className='title'>{"TPT VR System"}</div>
        <div
          style={{
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <LanguageButton 
            onClick={() => changeRoom('/hall')} 
            active={active !== 'hall'}
          >
            Hall
          </LanguageButton>
          <LanguageButton 
            onClick={() => changeRoom('/room')} 
            active={active === 'hall'}
          >
            Room
          </LanguageButton>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            margin: "20px 0",
          }}
        >
          <Button onClick={handleDisableFurniture}>
            {toggleFurniture
              ? "View with furniture"
              : "View without furniture"}
          </Button>
        </div>

        
        <AccordionWrapper>
          <Accordion allowZeroExpanded preExpanded={[1]}>
            {accordionList.map((item) => (
              <AccordionItem key={item.id} uuid={item.id}>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    {item.title}
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <TextureSelection
                    doorSelection={item.isDoorSelection}
                    data={item.data}
                    type={item.type}
                  />
                </AccordionItemPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </AccordionWrapper>
        <Contacts>
          <h2>{"Contact Us"}</h2>
          <a className='contact-item' href='mailto:mailbox@bytebux.ie'>
            <img src='/assets/images/email.svg' alt='Email' />
            <span>mailbox@bytebux.ie</span>
          </a>
          <a className='contact-item' href='tel:+123456789'>
            <img src='/assets/images/call.svg' alt='Call' />
            <span>+123456789</span>
          </a>
        </Contacts>
        <div
          style={{
            padding: "32px 20px 64px",
            textAlign: "center",
            fontSize: 14,
            color: "#ccc",
          }}
        >
          <p> TPT VR System v1.0</p>
          <p> {"All rights reserved."}</p>
          <p> 2024 © ByteBux</p>
        </div>
      </NavbarContent>
    </NavbarWrapper>
  );
};

export default withTheme(Navbar);
