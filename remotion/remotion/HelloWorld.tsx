import { spring } from "remotion";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "./HelloWorld/Logo";
import { Subtitle } from "./HelloWorld/Subtitle";
import { Title } from "./HelloWorld/Title";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const helloWorldCompSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  logoColor1: zColor(),
  logoColor2: zColor(),
});

export const HelloWorld: React.FC<z.infer<typeof helloWorldCompSchema>> = ({
  titleText: propOne,
  titleColor: propTwo,
  logoColor1,
  logoColor2,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();


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

  // A <AbsoluteFill> is just a absolutely positioned <div>!
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill style={{ opacity }}>
        {/* Sequences can shift the time for its children! */}
        <Sequence from={35}>
          <Title titleText={propOne} titleColor={propTwo} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
