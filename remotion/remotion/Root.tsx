import { Composition } from "remotion";
import { TextClip, textClipCompSchema } from "./TextClip";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  // Default animation durations (in frames)
  const defaultScaleDuration = 40;
  const defaultFadeInDuration = 40;
  const defaultSlideInDuration = 40;
  const defaultChangingWordDuration = 40;
  
  // Calculate total duration dynamically
  const totalDuration = 
    defaultScaleDuration + 
    defaultFadeInDuration + 
    defaultSlideInDuration + 
    defaultChangingWordDuration;

  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render TextClip
        id="TextClip"
        component={TextClip}
        durationInFrames={totalDuration}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={textClipCompSchema}
        //Arafat : this is where we define default props for the TextClip component
        defaultProps={{
          titleText: "Render Server Template",
          titleColor: "#000000",
          backgroundColor: "#FFFFFF",
          rating: 0,
          // Background gradient option (hardcoded schemes)
          gradientOption: "option-1",
          // Dynamic animation durations (in frames)
          scaleAnimationDuration: defaultScaleDuration,
          fadeInAnimationDuration: defaultFadeInDuration,
          slideInAnimationDuration: defaultSlideInDuration,
          changingWordAnimationDuration: defaultChangingWordDuration,
        }}
      />
    </>
  );
};
