import React, { useRef, useEffect } from "react";
import Logo from "../Logo";
import LoadingIndicator from "../LoadingIndicator";
import { useLoader } from "../../../state/Store";
import { useLocation } from "react-router-dom";
import { LoadingContent, LoadingPageWrapper } from "./style";
import gsap from "gsap";
import { DefaultLoadingManager } from "three";

export default ({ total = 40 }) => {
  const pageRef = useRef();
  const contentRef = useRef();
  const logoRef = useRef();
  const bgImageRef = useRef();
  const { progress, reset, setProgress } = useLoader();
  const location = useLocation();

  useEffect(() => {
    DefaultLoadingManager.onProgress = function (url, itemsLoaded) {
      const progressPercent = Math.floor((itemsLoaded / total) * 100);

      setProgress(progressPercent);
    };
  }, []);

  useEffect(() => {
    // Reset progress to zero when the component mounts
    setProgress(0);
  }, [setProgress]);

  useEffect(() => {
    if (progress >= 100) {
      closeAnimation();
    }
  }, [progress]);

  const closeAnimation = () => {
    const tl = gsap.timeline();
    const indicatorProgressRef = document.querySelector(".indicator-progress");

    tl.to(logoRef.current, 0.3, { y: -20, opacity: 0 });
    tl.to(indicatorProgressRef, 0.3, { x: -20, scaleX: 0 });
    tl.to(".indicator-text", 0.3, {
      x: -20,
      opacity: 0,
      stagger: 0.2
    });
    tl.to(contentRef.current, 0.4, { x: "-100%" });
    tl.to(bgImageRef.current, 1, {
      opacity: 0,
      onComplete: () => {
        const video = document.getElementById("video");
        reset();
        bgImageRef.current.style.display = "none";

        if (video) {
          video.play();
        }
        pageRef.current.classList.add("hidden");
      }
    });
  };

  return (
    <LoadingPageWrapper ref={pageRef}>
      <LoadingContent ref={contentRef}>
        <div className='inner'>
          <div className='logo-animations' ref={logoRef}>
            <Logo />
          </div>
          <LoadingIndicator progress={progress} />
        </div>
        <div className='copyright'>
          <p className='text'>powered by</p>
          <a href='https://tpt.ie'>
            <img src='/assets/images/logo.jpg' alt='' />
          </a>
        </div>
      </LoadingContent>
      <div className='bg-image' ref={bgImageRef}>
        {location.pathname === "/hall" ? (
          <img src='/hall_wallpaper.webp' alt='' />
        ) : (
          <img src='/room_1_wallpaper.webp' alt='' />
        )}
      </div>
    </LoadingPageWrapper>
  );
};
