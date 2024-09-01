import React from "react";
import { DefaultLoadingManager } from "three";
import { useLoader } from "../../state/Store";

export default ({ total = 40 }) => {
  const { setProgress } = useLoader();
  const progressRef = React.useRef(1); // Start progress at 1% to avoid showing 0% initially

  React.useEffect(() => {
    const handleProgress = (url, itemsLoaded) => {
      // Calculate progress percentage
      const progressPercent = Math.min(
        Math.floor((itemsLoaded / total) * 100),
        100
      );

      // Only update progress if it's increasing
      if (progressPercent > progressRef.current) {
        setProgress(progressPercent);
        progressRef.current = progressPercent;
      }
    };

    DefaultLoadingManager.onProgress = handleProgress;

    DefaultLoadingManager.onLoad = () => {
      // Ensure progress is set to 100% upon completion

      
      if (progressRef.current > 100) {
        setProgress(100);
        progressRef.current = 100;
      }
    
    };

    // Clean up the effect by resetting to default on unmount
    return () => {
      DefaultLoadingManager.onProgress = null;
      DefaultLoadingManager.onLoad = null;
    };
  }, [total, setProgress]);

  return <group></group>;
};
