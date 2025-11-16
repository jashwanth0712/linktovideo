import { spring } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Title } from "./TextClip/Title";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { FONT_FAMILY } from "./TextClip/constants";

// Arafat : this is where we define schema 
export const textClipCompSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  backgroundColor: zColor(),
  rating: z.number(),
  // Background gradient option (hardcoded schemes)
  gradientOption: z.enum(["option-1", "option-2"]).default("option-1"),
  // Dynamic animation durations (in frames)
  scaleAnimationDuration: z.number().default(40),
  fadeInAnimationDuration: z.number().default(40),
  slideInAnimationDuration: z.number().default(40),
  changingWordAnimationDuration: z.number().default(40),
});

// Helper function to create animated gradient based on option and frame
const getAnimatedGradient = (
  option: "option-1" | "option-2",
  frame: number,
  durationInFrames: number
): string => {
  // Animate gradient angle for rotating linear gradients (much slower)
  const cycleDuration = durationInFrames * 8; // Much slower - 8x longer cycle
  const progress = (frame % cycleDuration) / cycleDuration;
  const angle = progress * 360; // Rotating angle in degrees
  
  if (option === "option-1") {
    // Rotating linear gradient with 3 colors - creates a sweeping effect
    return `linear-gradient(${angle}deg, #ff6b6b 0%, #6c5ce7 50%, #a29bfe 100%)`;
  } else {
    // Rotating linear gradient with 3 colors - opposite rotation
    const angle2 = angle + 180; // Opposite rotation
    return `linear-gradient(${angle}deg, #00d2ff 0%, #3a7bd5 50%, #00f260 100%), linear-gradient(${angle2}deg, #00f260 0%, #3a7bd5 50%, #00d2ff 100%)`;
  }
};

// Animation component for fade-in effect
const FadeInTitle: React.FC<{
  titleText: string;
  titleColor: string;
  durationInFrames: number;
}> = ({ titleText, titleColor, durationInFrames }) => {
  const frame = useCurrentFrame();
  const words = titleText.split(" ");

  const title: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    fontSize: 100,
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
  };

  const word: React.CSSProperties = {
    marginLeft: 10,
    marginRight: 10,
    display: "inline-block",
  };

  // Scale timing based on duration
  const wordDelay = durationInFrames / (words.length * 2);
  const wordFadeDuration = durationInFrames / words.length;

  return (
    <h1 style={title}>
      {words.map((t, i) => {
        const opacity = interpolate(
          frame,
          [i * wordDelay, i * wordDelay + wordFadeDuration],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <span
            key={t}
            style={{
              ...word,
              color: titleColor,
              opacity,
            }}
          >
            {t}
          </span>
        );
      })}
    </h1>
  );
};

// Animation component for slide-in effect
const SlideInTitle: React.FC<{
  titleText: string;
  titleColor: string;
  durationInFrames: number;
}> = ({ titleText, titleColor, durationInFrames }) => {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();
  const words = titleText.split(" ");

  const title: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    fontSize: 100,
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
  };

  const word: React.CSSProperties = {
    marginLeft: 10,
    marginRight: 10,
    display: "inline-block",
  };

  // Scale timing based on duration
  const wordDelay = durationInFrames / (words.length * 2);
  const wordFadeDuration = durationInFrames / words.length;

  return (
    <h1 style={title}>
      {words.map((t, i) => {
        const adjustedFrame = frame - i * wordDelay;
        const translateX = spring({
          fps: videoConfig.fps,
          frame: adjustedFrame,
          config: {
            damping: 200,
          },
        });

        const opacity = interpolate(
          adjustedFrame,
          [0, wordFadeDuration],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <span
            key={t}
            style={{
              ...word,
              color: titleColor,
              transform: `translateX(${(1 - translateX) * 200}px)`,
              opacity,
            }}
          >
            {t}
          </span>
        );
      })}
    </h1>
  );
};

// Animation component for changing last word one by one
const ChangingLastWordTitle: React.FC<{
  titleText: string;
  titleColor: string;
  durationInFrames: number;
}> = ({ titleText, titleColor, durationInFrames }) => {
  const frame = useCurrentFrame();
  const words = titleText.split(" ");

  // Example words to cycle through for the last word
  const changingWords = [
    "Amazing", 
    "Awesome", 
    "Incredible", 
    "Fantastic", 
    "Wonderful", 
    "Brilliant", 
    "Excellent", 
    "Perfect",
    "Outstanding",
    "Remarkable",
    "Spectacular",
    "Stunning",
    "Magnificent",
    "Extraordinary",
    "Phenomenal",
    "Impressive",
    "Superb",
    "Marvelous",
    "Exceptional"
  ];
  
  // Calculate which word index to show (slower word changes - minimum 25 frames per word)
  // This ensures words change at a more readable pace (about 0.8 seconds per word at 30fps)
  const minFramesPerWord = 25;
  const wordChangeInterval = Math.max(minFramesPerWord, durationInFrames / changingWords.length);
  const currentWordIndex = Math.floor(frame / wordChangeInterval) % changingWords.length;
  const currentLastWord = changingWords[currentWordIndex];

  const title: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    fontSize: 100,
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
  };

  const word: React.CSSProperties = {
    marginLeft: 10,
    marginRight: 10,
    display: "inline-block",
  };

  // Fade effect for the changing word (scaled to duration)
  const fadeProgress = (frame % wordChangeInterval) / wordChangeInterval;
  const opacity = interpolate(
    fadeProgress,
    [0, 0.3, 0.7, 1],
    [1, 0, 0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <h1 style={title}>
      {words.slice(0, -1).map((t, i) => (
        <span
          key={`${t}-${i}`}
          style={{
            ...word,
            color: titleColor,
          }}
        >
          {t}
        </span>
      ))}
      <span
        style={{
          ...word,
          color: titleColor,
          opacity,
        }}
      >
        {currentLastWord}
      </span>
    </h1>
  );
};

export const TextClip: React.FC<z.infer<typeof textClipCompSchema>> = ({
  titleText: propOne,
  titleColor: propTwo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backgroundColor: _propThree,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rating: _propFour,
  gradientOption,
  scaleAnimationDuration,
  fadeInAnimationDuration,
  slideInAnimationDuration,
  changingWordAnimationDuration,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate sequence start positions dynamically
  const scaleStart = 0;
  const fadeInStart = scaleAnimationDuration;
  const slideInStart = fadeInStart + fadeInAnimationDuration;
  const changingWordStart = slideInStart + slideInAnimationDuration;

  // Fade out the animation at the end
  const opacity = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames - 15],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Get animated background gradient based on selected option
  const backgroundGradient = getAnimatedGradient(
    gradientOption || "option-1",
    frame,
    durationInFrames
  );

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill style={{ 
      backgroundImage: backgroundGradient,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <AbsoluteFill style={{ opacity }}>
        {/* Animation 1: Scale animation (original) */}
        <Sequence durationInFrames={scaleAnimationDuration} from={scaleStart}>
          <Title 
            titleText={propOne} 
            titleColor={propTwo} 
            durationInFrames={scaleAnimationDuration}
          />
        </Sequence>
        {/* Animation 2: Fade-in animation */}
        <Sequence from={fadeInStart} durationInFrames={fadeInAnimationDuration}>
          <FadeInTitle 
            titleText={propOne} 
            titleColor={propTwo} 
            durationInFrames={fadeInAnimationDuration}
          />
        </Sequence>
        {/* Animation 3: Slide-in animation */}
        <Sequence from={slideInStart} durationInFrames={slideInAnimationDuration}>
          <SlideInTitle 
            titleText={propOne} 
            titleColor={propTwo} 
            durationInFrames={slideInAnimationDuration}
          />
        </Sequence>
        {/* Animation 4: Changing last word animation */}
        <Sequence from={changingWordStart} durationInFrames={changingWordAnimationDuration}>
          <ChangingLastWordTitle 
            titleText={propOne} 
            titleColor={propTwo} 
            durationInFrames={changingWordAnimationDuration}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
