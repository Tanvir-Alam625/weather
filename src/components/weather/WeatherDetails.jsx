import React from "react";
import { motion } from "motion/react";
import Icon from "../ui/Icon.jsx";

const spring = { type: "spring", stiffness: 190, damping: 24 };

function DetailCard({ icon, label, value, note, index, reducedMotion }) {
  return (
    <motion.article
      className="detail-card"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: reducedMotion ? 0 : index * 0.06 }}
    >
      <div className="detail-top"><span className="detail-icon"><Icon name={icon} size={19} /></span><span>{label}</span></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </motion.article>
  );
}

export default function WeatherDetails({ current, reducedMotion, getWindDirection }) {
  return (
    <motion.section
      className="detail-grid"
      aria-label="Weather details"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.06 } } }}
    >
      <DetailCard icon="wind" label="Wind" value={`${Math.round(current.wind_speed_10m)} km/h`} note={`${getWindDirection(current.wind_direction_10m)} direction`} index={0} reducedMotion={reducedMotion} />
      <DetailCard icon="drop" label="Humidity" value={`${current.relative_humidity_2m}%`} note="Relative humidity" index={1} reducedMotion={reducedMotion} />
      <DetailCard icon="eye" label="Cloud cover" value={`${current.cloud_cover}%`} note={current.cloud_cover < 25 ? "Mostly clear skies" : current.cloud_cover > 75 ? "Mostly cloudy skies" : "Some clouds around"} index={2} reducedMotion={reducedMotion} />
      <DetailCard icon="gauge" label="Pressure" value={`${Math.round(current.pressure_msl)} hPa`} note="Mean sea level" index={3} reducedMotion={reducedMotion} />
    </motion.section>
  );
}
