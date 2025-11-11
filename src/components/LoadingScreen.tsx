import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import "./LoadingScreen.css";

export const LoadingScreen = ({ onStarted }) => {
  const { progress } = useProgress();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      setIsLoaded(true);
    }
  }, [progress]);

  return (
    <div className="loading-screen">
      <div className="loading-screen__container">
        {!isLoaded ? (
          <>
            <h1 className="loading-screen__title">Loading...</h1>
            <div className="progress-bar">
              <div
                className="progress-bar__value"
                style={{
                  width: `${progress}%`,
                }}
              ></div>
            </div>
          </>
        ) : (
          <>
            <h1 className="loading-screen__title">Welcome</h1>
            <button className="loading-screen__button" onClick={onStarted}>
              Enter
            </button>
          </>
        )}
      </div>
    </div>
  );
};
