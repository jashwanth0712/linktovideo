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

export const textClipCompSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  backgroundColor: zColor(),
});

export const TextClip: React.FC<z.infer<typeof textClipCompSchema>> = ({
  titleText: propOne,
  titleColor: propTwo,
  backgroundColor: propThree,
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
  <AbsoluteFill style={{ backgroundColor: propThree }}>
      <AbsoluteFill style={{ opacity }}>
        {/* Sequences can shift the time for its children! */}
        <Sequence from={0}>
          <Title titleText={propOne} titleColor={propTwo} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
