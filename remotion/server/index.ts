import express from "express";
import { makeRenderQueue } from "./render-queue";
import { bundle } from "@remotion/bundler";
import path from "node:path";
import { ensureBrowser } from "@remotion/renderer";

const { PORT = 5000, REMOTION_SERVE_URL } = process.env;

function setupApp({ remotionBundleUrl }: { remotionBundleUrl: string }) {
  const app = express();

  const rendersDir = path.resolve("renders");

  const queue = makeRenderQueue({
    port: Number(PORT),
    serveUrl: remotionBundleUrl,
    rendersDir,
  });

  // Host renders on /renders
  app.use("/renders", express.static(rendersDir));
  app.use(express.json());

  // Endpoint to create a new job
  app.post("/renders", async (req, res) => {
    const body = req.body;
    console.log("body", body);
    // Validate animations array
    if (!Array.isArray(body?.animations) || body.animations.length === 0) {
      res.status(400).json({ 
        message: "animations must be a non-empty array" 
      });
      return;
    }

    // Validate each animation object
    for (const anim of body.animations) {
      if (typeof anim.titleText !== "string") {
        res.status(400).json({ 
          message: "Each animation must have a titleText string" 
        });
        return;
      }
      if (typeof anim.titleColor !== "string") {
        res.status(400).json({ 
          message: "Each animation must have a titleColor string" 
        });
        return;
      }
      if (typeof anim.backgroundColor !== "string") {
        res.status(400).json({ 
          message: "Each animation must have a backgroundColor string" 
        });
        return;
      }
      if (typeof anim.rating !== "number") {
        res.status(400).json({ 
          message: "Each animation must have a rating number" 
        });
        return;
      }
      if (anim.animationStyle && !["scale", "fadeIn", "slideIn", "changingWord"].includes(anim.animationStyle)) {
        res.status(400).json({ 
          message: "animationStyle must be one of: scale, fadeIn, slideIn, changingWord" 
        });
        return;
      }
      if (typeof anim.duration !== "number" || anim.duration <= 0) {
        res.status(400).json({ 
          message: "Each animation must have a positive duration number" 
        });
        return;
      }
    }

    // Validate gradientOption
    const gradientOption = body?.gradientOption || "option-1";
    if (!["option-1", "option-2"].includes(gradientOption)) {
      res.status(400).json({ 
        message: "gradientOption must be 'option-1' or 'option-2'" 
      });
      return;
    }

    // Validate option1Colors
    if (!Array.isArray(body?.option1Colors) || body.option1Colors.length < 2 || body.option1Colors.length > 3) {
      res.status(400).json({ 
        message: "option1Colors must be an array of 2-3 color strings" 
      });
      return;
    }
    for (const color of body.option1Colors) {
      if (typeof color !== "string") {
        res.status(400).json({ 
          message: "All colors in option1Colors must be strings" 
        });
        return;
      }
    }

    // Validate option2Colors
    if (!Array.isArray(body?.option2Colors) || body.option2Colors.length < 2 || body.option2Colors.length > 3) {
      res.status(400).json({ 
        message: "option2Colors must be an array of 2-3 color strings" 
      });
      return;
    }
    for (const color of body.option2Colors) {
      if (typeof color !== "string") {
        res.status(400).json({ 
          message: "All colors in option2Colors must be strings" 
        });
        return;
      }
    }

    // Validate audioUrl if provided
    if (body?.audioUrl && typeof body.audioUrl !== "string") {
      res.status(400).json({ 
        message: "audioUrl must be a string URL if provided" 
      });
      return;
    }

    // Prepare job data with defaults
    const jobData = {
      animations: body.animations.map((anim: any) => ({
        titleText: anim.titleText,
        titleColor: anim.titleColor,
        backgroundColor: anim.backgroundColor,
        rating: anim.rating,
        logo: anim.logo || undefined,
        animationStyle: anim.animationStyle || "scale",
        duration: anim.duration,
      })),
      gradientOption: gradientOption,
      option1Colors: body.option1Colors,
      option2Colors: body.option2Colors,
      ...(body.audioUrl && { audioUrl: body.audioUrl }),
    };

    const jobId = queue.createJob(jobData);

    res.json({ jobId });
  });

  // Endpoint to get a job status
  app.get("/renders/:jobId", (req, res) => {
    const jobId = req.params.jobId;
    const job = queue.jobs.get(jobId);

    res.json(job);
  });

  // Endpoint to cancel a job
  app.delete("/renders/:jobId", (req, res) => {
    const jobId = req.params.jobId;

    const job = queue.jobs.get(jobId);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (job.status !== "queued" && job.status !== "in-progress") {
      res.status(400).json({ message: "Job is not cancellable" });
      return;
    }

    job.cancel();

    res.json({ message: "Job cancelled" });
  });

  return app;
}

async function main() {
  await ensureBrowser();

  const remotionBundleUrl = REMOTION_SERVE_URL
    ? REMOTION_SERVE_URL
    : await bundle({
        entryPoint: path.resolve("remotion/index.ts"),
        onProgress(progress) {
          console.info(`Bundling Remotion project: ${progress}%`);
        },
      });

  const app = setupApp({ remotionBundleUrl });

  app.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`);
  });
}

main();
