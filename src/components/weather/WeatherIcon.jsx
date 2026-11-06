import React from "react";
import { getWeatherKind } from "../../weather.js";

export default function WeatherIcon({ code, size = "large", isDay = true }) {
  const kind = getWeatherKind(code);
  return (
    <svg
      aria-hidden="true"
      className={`weather-icon weather-icon--${kind} weather-icon--${size}`}
      viewBox="0 0 96 96"
      fill="none"
    >
      {(kind === "partly-cloudy" || (kind === "sunny" && isDay)) && (
        <g className="weather-sun">
          <circle cx="57" cy="37" r="17" fill="url(#sun)" />
          <g className="sun-rays" stroke="#FFCF74" strokeWidth="2.4" strokeLinecap="round">
            <path d="M57 9v7M57 58v7M29 37h7m42 0h7M37 17l5 5m30 30 5 5m0-40-5 5M42 52l-5 5" />
          </g>
        </g>
      )}
      {!isDay && kind === "sunny" && (
        <path d="M63 14a24 24 0 1 0 20 34A21 21 0 0 1 63 14Z" fill="#D9E7FF" />
      )}
      {["partly-cloudy", "cloudy", "rain", "snow", "storm", "fog"].includes(kind) && (
        <g className="weather-cloud">
          <path
            d="M25 67h45a14 14 0 0 0 0-28 20 20 0 0 0-38-3 15 15 0 0 0-7 31Z"
            fill="url(#cloud)"
            stroke="#E8F2FF"
            strokeOpacity=".35"
            strokeWidth="1.5"
          />
        </g>
      )}
      {kind === "rain" && (
        <g className="weather-rain" stroke="#8AC7FF" strokeWidth="3" strokeLinecap="round">
          <path d="m36 74-4 8m18-8-4 8m18-8-4 8" />
        </g>
      )}
      {kind === "snow" && (
        <g className="weather-snow" fill="#DDF1FF">
          <circle cx="36" cy="77" r="3" /><circle cx="51" cy="81" r="2.5" /><circle cx="65" cy="75" r="3" />
        </g>
      )}
      {kind === "storm" && (
        <path d="m52 66-10 17h10l-3 11 17-21H55l5-7Z" fill="#FFD47B" />
      )}
      {kind === "fog" && (
        <g className="weather-fog" stroke="#C9D7E9" strokeWidth="3" strokeLinecap="round">
          <path d="M24 75h48M31 83h37" />
        </g>
      )}
      <defs>
        <linearGradient id="sun" x1="42" y1="21" x2="73" y2="53" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE7A7" /><stop offset="1" stopColor="#FFAD61" />
        </linearGradient>
        <linearGradient id="cloud" x1="34" y1="35" x2="67" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4F8FF" /><stop offset="1" stopColor="#AFC5E1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
