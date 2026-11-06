import React, { useMemo } from "react";
import { motion } from "motion/react";
import { formatDay, formatHour, getWeatherDescription } from "../../weather.js";
import Icon from "../ui/Icon.jsx";
import Temperature from "../weather/Temperature.jsx";
import WeatherIcon from "../weather/WeatherIcon.jsx";

const spring = { type: "spring", stiffness: 190, damping: 24 };

export function HourlyForecast({ hourly, startIndex, reducedMotion }) {
  const hours = hourly.time.slice(startIndex, startIndex + 12);
  return (
    <section className="panel hourly-panel" aria-labelledby="hourly-title">
      <div className="section-heading">
        <div><p className="eyebrow">THE NEXT HOURS</p><h2 id="hourly-title">Hourly forecast</h2></div>
        <span className="heading-note">Next 12 hours</span>
      </div>
      <div className="hourly-list">
        {hours.map((time, index) => {
          const itemIndex = startIndex + index;
          const code = hourly.weather_code[itemIndex];
          return (
            <motion.article
              className={`hour-card ${index === 0 ? "hour-card--current" : ""}`}
              key={time}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: reducedMotion ? 0 : index * 0.035 }}
              aria-label={`${index === 0 ? "Now" : formatHour(time)}, ${Math.round(hourly.temperature_2m[itemIndex])} degrees, ${getWeatherDescription(code)}`}
            >
              <span className="hour-time">{index === 0 ? "Now" : formatHour(time)}</span>
              <WeatherIcon code={code} size="small" isDay={hourly.is_day[itemIndex] === 1} />
              <strong><Temperature value={hourly.temperature_2m[itemIndex]} />°</strong>
              <span className="hour-rain"><Icon name="drop" size={12} />{hourly.precipitation_probability[itemIndex] ?? 0}%</span>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export function DailyForecast({ daily, reducedMotion }) {
  const range = useMemo(() => {
    const values = [...daily.temperature_2m_min, ...daily.temperature_2m_max];
    return { low: Math.min(...values), span: Math.max(...values) - Math.min(...values) || 1 };
  }, [daily]);
  return (
    <section className="panel daily-panel" aria-labelledby="daily-title">
      <div className="section-heading">
        <div><p className="eyebrow">A LOOK AHEAD</p><h2 id="daily-title">7-day forecast</h2></div>
        <span className="heading-note">Daily outlook</span>
      </div>
      <div className="daily-list">
        {daily.time.map((day, index) => {
          const min = daily.temperature_2m_min[index];
          const max = daily.temperature_2m_max[index];
          const left = ((min - range.low) / range.span) * 100;
          const width = Math.max(((max - min) / range.span) * 100, 8);
          return (
            <motion.div
              className="daily-row"
              key={day}
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: reducedMotion ? 0 : index * 0.045 }}
            >
              <span className="daily-day">{index === 0 ? "Today" : formatDay(day, { short: true })}</span>
              <WeatherIcon code={daily.weather_code[index]} size="tiny" />
              <span className="daily-rain"><Icon name="drop" size={12} />{daily.precipitation_probability_max[index] ?? 0}%</span>
              <span className="daily-low">{Math.round(min)}°</span>
              <span className="temperature-track" aria-hidden="true">
                <motion.span
                  className="temperature-range"
                  initial={{ scaleX: reducedMotion ? 1 : 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: reducedMotion ? 0 : 0.12 + index * 0.045 }}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </span>
              <span className="daily-high">{Math.round(max)}°</span>
              <span className="daily-description">{getWeatherDescription(daily.weather_code[index])}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
