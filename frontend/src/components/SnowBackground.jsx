import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function SnowBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dynamic Animated Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-blue-200 to-indigo-300 animate-gradient-slow bg-[length:400%_400%]"></div>
      
      {/* Shifting Glass Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-white/30 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-blue-400/20 blur-[120px] animate-float"></div>

      {init && (
        <Particles
          id="tsparticles"
          options={{
            fullScreen: { enable: false },
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            particles: {
              color: { value: "#ffffff" },
              move: {
                direction: "bottom",
                enable: true,
                outModes: { default: "out" },
                speed: { min: 0.5, max: 1.5 },
                straight: false,
              },
              number: { density: { enable: true, area: 800 }, value: 100 },
              opacity: { value: { min: 0.3, max: 0.7 } },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
              wobble: { enable: true, distance: 5, speed: { min: 0.5, max: 1.0 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0"
        />
      )}
    </div>
  );
}