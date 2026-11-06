import React, { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function WeatherScene({ kind, isDay, precipitation = 0, reducedMotion }) {
  const particleCount = kind === "storm" ? 20 : precipitation > 2 ? 18 : 12;
  const particles = useMemo(
    () => Array.from({ length: particleCount }, (_, index) => index),
    [particleCount],
  );
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={kind}
        className={`weather-scene scene--${kind} ${isDay ? "scene--day" : "scene--night"} ${reducedMotion ? "motion-reduced" : ""}`}
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7 }}
      >
        <div className="scene-glow" />
        {["partly-cloudy", "cloudy", "rain", "storm", "fog"].includes(kind) && (
          <>
            <div className="scene-cloud scene-cloud--one" />
            <div className="scene-cloud scene-cloud--two" />
          </>
        )}
        {kind === "sunny" && <div className="scene-sun"><span /></div>}
        {(kind === "rain" || kind === "storm") && (
          <div className="scene-rain">
            {particles.map((particle) => (
              <i
                key={particle}
                style={{
                  "--particle": particle,
                  "--fall-duration": `${1.05 + (particle % 5) * 0.17}s`,
                  "--fall-delay": `${-particle * 0.22}s`,
                }}
              />
            ))}
          </div>
        )}
        {kind === "snow" && (
          <div className="scene-snow">
            {particles.map((particle) => (
              <i
                key={particle}
                style={{
                  "--particle": particle,
                  "--flake-size": `${3 + (particle % 3)}px`,
                  "--fall-duration": `${8 + (particle % 5) * 1.3}s`,
                  "--fall-delay": `${-particle * 0.75}s`,
                }}
              />
            ))}
          </div>
        )}
        {kind === "fog" && (
          <>
            <div className="scene-fog scene-fog--one" />
            <div className="scene-fog scene-fog--two" />
          </>
        )}
        {kind === "storm" && <div className="scene-lightning" />}
      </motion.div>
    </AnimatePresence>
  );
}
