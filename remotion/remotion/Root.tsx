import { Composition } from "remotion";
import { TextClip, textClipCompSchema } from "./TextClip";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  
  // Default animations array
  const defaultAnimations = [
    {
      titleText: "Introducing Reelcat",
      titleColor: "#000000",
      backgroundColor: "#FFFFFF",
      rating: 0,
      logo: "https://remotion.dev/img/logo.png", // Optional logo URL
      animationStyle: "scale" as const,
      duration: 2.0,
    },
    {
      titleText: "An amazing mobile editor",
      titleColor: "#000000",
      backgroundColor: "#FFFFFF",
      rating: 0,
      logo: "https://remotion.dev/img/logo.png",
      // logo field is optional - this animation doesn't have one
      animationStyle: "fadeIn" as const,
      duration: 2.0,
    },
  ];
  
  // Calculate total duration dynamically (sum of all animation durations in seconds, converted to frames)
  const totalDuration = Math.round(
    defaultAnimations.reduce((sum, anim) => sum + anim.duration, 0) * fps
  );

  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render TextClip
        id="TextClip"
        component={TextClip}
        durationInFrames={totalDuration}
        fps={fps}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={textClipCompSchema}
        //Arafat : this is where we define default props for the TextClip component
        defaultProps={{
          animations: defaultAnimations,
          gradientOption: "option-1" as const,
          // Option 1: 3 colors for gradient
          option1Colors: ["#ff6b6b", "#6c5ce7", "#a29bfe"],
          // Option 2: 2 colors for gradient
          option2Colors: ["#00d2ff", "#3a7bd5"],
        }}
      />
    </>
  );
};
