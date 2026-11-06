import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  formatClock,
  formatDay,
  formatHour,
  formatUpdatedTime,
  getForecast,
  getWeatherDescription,
  getWeatherKind,
  getWindDirection,
  searchLocations,
} from "./weather.js";

const initialPlace = {
  id: "dhaka",
  name: "Dhaka",
  region: "Dhaka",
  country: "Bangladesh",
  latitude: 23.8103,
  longitude: 90.4125,
};

const spring = { type: "spring", stiffness: 190, damping: 24 };

function Icon({ name, size = 20, ...props }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.8 13A8.4 8.4 0 0 1 11 3.2 8.5 8.5 0 1 0 20.8 13Z" />,
    refresh: <><path d="M20 7v5h-5" /><path d="M4.9 9A7.5 7.5 0 0 1 18 5.3L20 7M4 17v-5h5" /><path d="M19.1 15A7.5 7.5 0 0 1 6 18.7L4 17" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    drop: <path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z" />,
    wind: <><path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h6a3 3 0 1 1-3 3" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    gauge: <><path d="M12 14 16 8" /><path d="M3.3 16a9 9 0 1 1 17.4 0" /><path d="M5 18h14" /></>,
    sunrise: <><path d="M3 18h18M5 21h14M12 2v7m-4-3 4 3 4-3" /><path d="M5.6 14a7 7 0 0 1 12.8 0" /></>,
    sunset: <><path d="M3 18h18M5 21h14M12 15V2m-4 4 4-3 4 3" /><path d="M5.6 14a7 7 0 0 1 12.8 0" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

function WeatherIcon({ code, size = "large", isDay = true }) {
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

function WeatherScene({ kind, isDay, precipitation = 0, reducedMotion }) {
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

function SearchBox({ onSelect, reducedMotion }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      setSearchError("");
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const results = await searchLocations(trimmed, controller.signal);
        setSuggestions(results);
        if (results.length === 0) setSearchError("No matching places found.");
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setSearchError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const choosePlace = (place) => {
    onSelect(place);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="search-wrap">
      <form
        className={`search-box ${isOpen ? "search-box--open" : ""}`}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (suggestions[0]) choosePlace(suggestions[0]);
          else if (query.trim().length < 2) setSearchError("Enter at least two characters.");
          else setIsOpen(true);
        }}
      >
        <Icon name="search" size={19} />
        <input
          aria-label="Search for a city"
          aria-autocomplete="list"
          aria-expanded={isOpen && query.length >= 2}
          aria-controls="location-suggestions"
          placeholder="Search any city..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
            if (event.key === "ArrowDown" && suggestions.length) {
              event.preventDefault();
              document.querySelector("#location-suggestions button")?.focus();
            }
          }}
        />
        {query && (
          <button
            className="icon-button search-clear"
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <Icon name="close" size={16} />
          </button>
        )}
        {isOpen && query.length >= 2 && (
          <motion.div
            id="location-suggestions"
            className="suggestions"
            role="listbox"
            initial={reducedMotion ? false : { opacity: 0, y: -7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
          >
            {searching ? (
              <p className="suggestion-message"><span className="mini-spinner" /> Finding places</p>
            ) : suggestions.length ? (
              suggestions.map((place, index) => (
                <motion.button
                  type="button"
                  role="option"
                  aria-selected="false"
                  key={place.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, delay: reducedMotion ? 0 : index * 0.035 }}
                  onClick={() => choosePlace(place)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      event.currentTarget.nextElementSibling?.focus();
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      event.currentTarget.previousElementSibling?.focus();
                    }
                  }}
                >
                  <span className="suggestion-pin"><Icon name="pin" size={17} /></span>
                  <span><strong>{place.name}</strong><small>{[place.region, place.country].filter(Boolean).join(", ")}</small></span>
                  <Icon name="arrow" size={15} />
                </motion.button>
              ))
            ) : (
              <p className="suggestion-message">{searchError || "Type to search for a place."}</p>
            )}
          </motion.div>
        )}
      </form>
      {isOpen && <button className="search-dismiss" aria-label="Close suggestions" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

function Temperature({ value, className = "" }) {
  return (
    <span className={className} aria-label={`${Math.round(value)} degrees Celsius`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={Math.round(value)}
          className="temperature-value"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24 }}
        >
          {Math.round(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function HourlyForecast({ hourly, startIndex, reducedMotion }) {
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

function DailyForecast({ daily, reducedMotion }) {
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

function App() {
  const reducedMotion = useReducedMotion();
  const [place, setPlace] = useState(initialPlace);
  const [weatherResult, setWeatherResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [theme, setTheme] = useState(() => {
    return "dark";
  });
  const [geoMessage, setGeoMessage] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const syncVisibility = () => {
      document.documentElement.classList.toggle("page-hidden", document.hidden);
    };
    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getForecast(place, controller.signal)
      .then((data) => setWeatherResult({ placeId: place.id, data }))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [place, reloadKey]);

  const weather = weatherResult?.placeId === place.id ? weatherResult.data : null;
  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const kind = current ? getWeatherKind(current.weather_code) : "sunny";
  const nextHour = useMemo(() => {
    if (!weather?.hourly?.time?.length || !weather?.current?.time) return 0;
    const index = weather.hourly.time.findIndex((time) => time >= weather.current.time);
    return index < 0 ? 0 : index;
  }, [weather]);
  const localDate = useMemo(() => {
    if (!weather?.timezone) return "";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: weather.timezone,
    }).format(new Date());
  }, [weather?.timezone]);

  const useMyLocation = () => {
    setGeoMessage("");
    if (!navigator.geolocation) {
      setGeoMessage("Location is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPlace({
          id: `current-${coords.latitude}-${coords.longitude}`,
          name: "Your location",
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      () => setGeoMessage("Location access was unavailable. Search for a city instead."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const sunrise = daily?.sunrise?.[0] ? formatClock(daily.sunrise[0]) : "—";
  const sunset = daily?.sunset?.[0] ? formatClock(daily.sunset[0]) : "—";
  const isDay = current?.is_day === 1;
  const locationLabel = [place.region, place.country].filter(Boolean).join(", ");

  return (
    <div className={`app-shell theme-${theme}`}>
      <WeatherScene
        kind={kind}
        isDay={isDay}
        precipitation={current?.precipitation ?? 0}
        reducedMotion={reducedMotion}
      />
      <header className="topbar">
        <a className="brand" href="/" aria-label="Weather home">
          <span className="brand-mark"><span /></span>
          <span>weather</span>
        </a>
        <SearchBox onSelect={setPlace} reducedMotion={reducedMotion} />
        <div className="topbar-actions">
          <button className="icon-button location-button" onClick={useMyLocation} aria-label="Use my location" title="Use my location">
            <Icon name="pin" size={19} /><span>My location</span>
          </button>
          <button
            className="icon-button theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ opacity: 0, rotate: -25 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 25 }} transition={{ duration: 0.15 }}>
                <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-intro">
          <div className="intro-copy">
            <p className="eyebrow">{localDate || "YOUR PERSONAL WEATHER"}</p>
            <h1>Weather, with a little <span>more feeling.</span></h1>
          </div>
          <div className="updated-wrap">
            {geoMessage && <span className="inline-notice" role="status">{geoMessage}</span>}
            <button className="updated-button" onClick={() => setReloadKey((value) => value + 1)} disabled={loading}>
              <Icon name="refresh" size={15} className={loading ? "spin" : ""} />
              {weather ? `Updated ${formatUpdatedTime(weather.current.time)}` : "Refresh forecast"}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button onClick={() => setReloadKey((value) => value + 1)}>Try again</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.section
            className="hero-card"
            key={place.id}
            aria-label="Current weather"
            initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={spring}
          >
            <div className="hero-content">
              <div className="hero-location">
                <span className="location-pin"><Icon name="pin" size={16} /></span>
                <span>{place.name}</span>
                {locationLabel && <span className="location-subtitle">{locationLabel}</span>}
              </div>
              {loading && !current ? (
                <div className="hero-loading" role="status"><span className="loader-ring" />Loading your forecast...</div>
              ) : current ? (
                <div className="current-weather">
                  <div className="current-copy">
                    <p className="current-description">{getWeatherDescription(current.weather_code)}</p>
                    <div className="hero-temperature"><Temperature value={current.temperature_2m} />°<span>C</span></div>
                    <p className="feels-like">Feels like {Math.round(current.apparent_temperature)}°</p>
                  </div>
                  <div className="current-art">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${current.weather_code}-${isDay}`}
                        className="current-icon-wrap"
                        initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
                        transition={{ duration: reducedMotion ? 0 : 0.28 }}
                      >
                        <WeatherIcon code={current.weather_code} isDay={isDay} />
                      </motion.div>
                    </AnimatePresence>
                    <span className="sunrise-label"><Icon name="sunrise" size={15} /> {sunrise}</span>
                    <span className="sunset-label"><Icon name="sunset" size={15} /> {sunset}</span>
                  </div>
                </div>
              ) : (
                <div className="hero-loading">Weather is unavailable for this location.</div>
              )}
              <p className="hero-footnote">{weather?.timezone_abbreviation ?? "LOCAL TIME"} <span>·</span> A fresh perspective on your day</p>
            </div>
            <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
            <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
            <div className="hero-glass" aria-hidden="true" />
          </motion.section>
        </AnimatePresence>

        {current && weather && (
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
        )}

        {weather && hourly && daily && (
          <div className="forecast-grid">
            <HourlyForecast hourly={hourly} startIndex={nextHour} reducedMotion={reducedMotion} />
            <DailyForecast daily={daily} reducedMotion={reducedMotion} />
          </div>
        )}

        <footer className="page-footer">
          <span>Made for the feeling of being outside.</span>
          <span>Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span>
        </footer>
      </main>
    </div>
  );
}

export default App;
