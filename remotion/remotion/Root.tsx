import { Composition } from "remotion";
import { TextClip, textClipCompSchema } from "./TextClip";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render TextClip
        id="TextClip"
        component={TextClip}
        durationInFrames={200}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={textClipCompSchema}
        defaultProps={{
          titleText: "Render Server Template",
          titleColor: "#000000",
          backgroundColor: "#FFFFFF",
        }}
      />
    </>
  );
};
