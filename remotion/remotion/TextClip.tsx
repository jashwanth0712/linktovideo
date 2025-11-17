import { spring } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import { Title } from "./TextClip/Title";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { FONT_FAMILY } from "./TextClip/constants";

// Arafat : this is where we define schema 
// Schema for a single animation
const animationSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  backgroundColor: zColor(),
  rating: z.number(),
  // Optional logo URL - if provided, logo will be displayed on top
  logo: z.string().url().or(z.literal("")).optional(),
  // Animation style to use
  animationStyle: z.enum(["scale", "fadeIn", "slideIn", "changingWord"]).default("scale"),
  // Duration in seconds (will be converted to frames)
  duration: z.number().default(2.0),
});

// Main schema - array of animations with gradient configuration
export const textClipCompSchema = z.object({
  animations: z.array(animationSchema).min(1),
  // Background gradient option - choose between option-1 or option-2
  gradientOption: z.enum(["option-1", "option-2"]).default("option-1"),
  // Colors for option-1: array of 2 or 3 colors for company branding
  option1Colors: z.array(zColor()).min(2).max(3),
  // Colors for option-2: array of 2 or 3 colors for company branding
  option2Colors: z.array(zColor()).min(2).max(3),
});

// Helper function to create animated gradient based on colors and frame
const getAnimatedGradient = (
  colors: string[],
  frame: number,
  durationInFrames: number
): string => {
  // Animate gradient angle for rotating linear gradients (much slower)
  const cycleDuration = durationInFrames * 8; // Much slower - 8x longer cycle
  const progress = (frame % cycleDuration) / cycleDuration;
  const angle = progress * 360; // Rotating angle in degrees
  
  if (colors.length === 2) {
    // Rotating linear gradient with 2 colors - creates a sweeping effect
    return `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  } else {
    // Rotating linear gradient with 3 colors - creates a sweeping effect with middle color
    return `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
  }
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

// Animation component for fade-in effect
const FadeInTitle: React.FC<{
  titleText: string;
  titleColor: string;
  durationInFrames: number;
  logoUrl?: string;
}> = ({ titleText, titleColor, durationInFrames, logoUrl }) => {
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
    <LogoWrapper logoUrl={logoUrl}>
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
    </LogoWrapper>
  );
};

// Animation component for slide-in effect
const SlideInTitle: React.FC<{
  titleText: string;
  titleColor: string;
  durationInFrames: number;
  logoUrl?: string;
}> = ({ titleText, titleColor, durationInFrames, logoUrl }) => {
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
    <LogoWrapper logoUrl={logoUrl}>
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
    </LogoWrapper>
  );
};

// Animation component for changing last word one by one
const ChangingLastWordTitle: React.FC<{
  titleText: string;
  titleColor: string;
  durationInFrames: number;
  logoUrl?: string;
}> = ({ titleText, titleColor, durationInFrames, logoUrl }) => {
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
    <LogoWrapper logoUrl={logoUrl}>
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
    </LogoWrapper>
  );
};

export const TextClip: React.FC<z.infer<typeof textClipCompSchema>> = ({
  animations,
  gradientOption,
  option1Colors,
  option2Colors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate total duration for the entire video
  const totalDurationInFrames = Math.round(
    animations.reduce((sum, anim) => sum + anim.duration, 0) * fps
  );
  
  // Get the selected gradient colors based on option
  const selectedColors = gradientOption === "option-1" ? option1Colors : option2Colors;
  
  // Get animated background gradient for the entire video
  const backgroundGradient = getAnimatedGradient(
    selectedColors,
    frame,
    totalDurationInFrames
  );

  // Convert duration from seconds to frames for each animation
  const animationsWithFrames = animations.map((anim) => ({
    ...anim,
    durationInFrames: Math.round(anim.duration * fps),
  }));

  // Calculate start positions for each animation
  let currentStart = 0;
  const animationsWithStart = animationsWithFrames.map((anim) => {
    const start = currentStart;
    currentStart += anim.durationInFrames;
    return {
      ...anim,
      startFrame: start,
    };
  });

  // Render animation component based on style
  const renderAnimation = (anim: typeof animationsWithStart[0]) => {
    const { titleText, titleColor, animationStyle, durationInFrames: animDuration, logo } = anim;

    switch (animationStyle) {
      case "scale":
        return (
          <Title 
            titleText={titleText} 
            titleColor={titleColor} 
            durationInFrames={animDuration}
            logoUrl={logo}
          />
        );
      case "fadeIn":
        return (
          <FadeInTitle 
            titleText={titleText} 
            titleColor={titleColor} 
            durationInFrames={animDuration}
            logoUrl={logo}
          />
        );
      case "slideIn":
        return (
          <SlideInTitle 
            titleText={titleText} 
            titleColor={titleColor} 
            durationInFrames={animDuration}
            logoUrl={logo}
          />
        );
      case "changingWord":
        return (
          <ChangingLastWordTitle 
            titleText={titleText} 
            titleColor={titleColor} 
            durationInFrames={animDuration}
            logoUrl={logo}
          />
        );
      default:
        return (
          <Title 
            titleText={titleText} 
            titleColor={titleColor} 
            durationInFrames={animDuration}
            logoUrl={logo}
          />
        );
    }
  };

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill
      style={{
        backgroundImage: backgroundGradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {animationsWithStart.map((anim, index) => {
        // Calculate relative frame for this animation
        const relativeFrame = frame - anim.startFrame;
        const isActive = relativeFrame >= 0 && relativeFrame < anim.durationInFrames;

        // Fade out at the end of each animation
        const opacity = interpolate(
          relativeFrame,
          [anim.durationInFrames - 25, anim.durationInFrames - 15],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

        return (
          <Sequence
            key={index}
            from={anim.startFrame}
            durationInFrames={anim.durationInFrames}
          >
            <AbsoluteFill
              style={{
                opacity: isActive ? opacity : 0,
              }}
            >
              {renderAnimation(anim)}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
