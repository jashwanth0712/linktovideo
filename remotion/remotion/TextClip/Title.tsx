import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
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

export const Title: React.FC<{
  readonly titleText: string;
  readonly titleColor: string;
  readonly durationInFrames?: number;
}> = ({ titleText, titleColor, durationInFrames }) => {
  const videoConfig = useVideoConfig();
  const frame = useCurrentFrame();

  const words = titleText.split(" ");

  return (
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
  );
};
