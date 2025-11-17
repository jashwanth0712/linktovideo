import React from "react";
import { spring, useCurrentFrame, useVideoConfig, Img } from "remotion";
import { FONT_FAMILY } from "./constants";

const title: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontWeight: "bold",
  fontSize: 100, // Arafat : make this dynamic based on the number of words in the title
  textAlign: "center",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
};

const word: React.CSSProperties = {
  marginLeft: 12,
  marginRight: 12,
  display: "inline-block",
  letterSpacing: "2px",
};

// Logo component wrapper - displays logo on top and content below
const LogoWrapper: React.FC<{
  logoUrl?: string;
  children: React.ReactNode;
}> = ({ logoUrl, children }) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    gap: 60,
  };

  const logoStyle: React.CSSProperties = {
    maxWidth: 400,
    maxHeight: 200,
    width: "auto",
    height: "auto",
    objectFit: "contain",
  };

  return (
    <div style={containerStyle}>
      {logoUrl?.trim() && (
        <Img
          src={logoUrl}
          style={logoStyle}
        />
      )}
      <div style={{ width: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export const Title: React.FC<{
  readonly titleText: string;
  readonly titleColor: string;
  readonly durationInFrames?: number;
  readonly logoUrl?: string;
}> = ({ titleText, titleColor, durationInFrames, logoUrl }) => {
  const videoConfig = useVideoConfig();
  const frame = useCurrentFrame();

  const words = titleText.split(" ");

  return (
    <LogoWrapper logoUrl={logoUrl}>
      <h1 style={title}>
        {words.map((t, i) => {
          // Scale timing based on duration if provided
          const adjustedFrame = durationInFrames 
            ? frame - (i * (durationInFrames / (words.length * 2)))
            : frame;

          const scale = spring({
            fps: videoConfig.fps,
            frame: adjustedFrame,
            config: {
              damping: 200,
            },
          });

          return (
            <span
              key={t}
              style={{
                ...word,
                color: titleColor,
                transform: `scale(${scale})`,
                filter: `drop-shadow(0 0 8px ${titleColor}40)`,
              }}
            >
              {t}
            </span>
          );
        })}
      </h1>
    </LogoWrapper>
  );
};
