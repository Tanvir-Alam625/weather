import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import CitySearch from "./components/search/CitySearch.jsx";
import { DailyForecast, HourlyForecast } from "./components/forecast/ForecastPanels.jsx";
import InstallApp from "./components/pwa/InstallApp.jsx";
import Icon from "./components/ui/Icon.jsx";
import Temperature from "./components/weather/Temperature.jsx";
import WeatherDetails from "./components/weather/WeatherDetails.jsx";
import WeatherIcon from "./components/weather/WeatherIcon.jsx";
import WeatherScene from "./components/weather/WeatherScene.jsx";
import {
  formatClock,
  formatUpdatedTime,
  getForecast,
  getWeatherDescription,
  getWeatherKind,
  getWindDirection,
} from "./weather.js";
import { getSavedForecast, getSavedPlace } from "./weather/storage.js";

const spring = { type: "spring", stiffness: 190, damping: 24 };

export default function App() {
  const reducedMotion = useReducedMotion();
  const [place, setPlace] = useState(getSavedPlace);
  const [weatherResult, setWeatherResult] = useState(() => {
    const savedPlace = getSavedPlace();
    const forecast = getSavedForecast(savedPlace.id);
    return forecast ? { placeId: savedPlace.id, data: forecast } : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [geoMessage, setGeoMessage] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("weather-place", JSON.stringify(place));
    } catch (storageError) {
      console.warn("The weather location could not be saved.", storageError);
    }
  }, [place]);

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
      .then((data) => {
        setWeatherResult({ placeId: place.id, data });
        try {
          localStorage.setItem(`weather-forecast:${place.id}`, JSON.stringify(data));
        } catch (storageError) {
          console.warn("The offline forecast could not be saved.", storageError);
        }
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          const savedForecast = getSavedForecast(place.id);
          if (savedForecast) {
            setWeatherResult({ placeId: place.id, data: savedForecast });
            setError("You're offline. Showing your last saved forecast.");
          } else {
            setError(requestError.message);
          }
        }
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
      <header className={`topbar ${searchOpen ? "topbar--searching" : ""}`}>
        <a className="brand" href="/" aria-label="Weather home">
          <span className="brand-mark"><span /></span>
          <span>weather</span>
        </a>
        <CitySearch
          onSelect={setPlace}
          onOpenChange={setSearchOpen}
          reducedMotion={reducedMotion}
        />
        <div className="topbar-actions">
          <button
            className="icon-button location-button"
            onClick={useMyLocation}
            aria-label="Use my location"
            title="Use my location"
          >
            <Icon name="pin" size={19} /><span>My location</span>
          </button>
          <button
            className="icon-button theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -25 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 25 }}
                transition={{ duration: 0.15 }}
              >
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
          <div className="intro-actions">
            <InstallApp />
            <div className="updated-wrap">
              {geoMessage && <span className="inline-notice" role="status">{geoMessage}</span>}
              <button
                className="updated-button"
                onClick={() => setReloadKey((value) => value + 1)}
                disabled={loading}
              >
                <Icon name="refresh" size={15} className={loading ? "spin" : ""} />
                {weather ? `Updated ${formatUpdatedTime(weather.current.time)}` : "Refresh forecast"}
              </button>
            </div>
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
                <div className="hero-loading" role="status">
                  <span className="loader-ring" />Loading your forecast...
                </div>
              ) : current ? (
                <div className="current-weather">
                  <div className="current-copy">
                    <p className="current-description">{getWeatherDescription(current.weather_code)}</p>
                    <div className="hero-temperature">
                      <Temperature value={current.temperature_2m} />°<span>C</span>
                    </div>
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
              <p className="hero-footnote">
                {weather?.timezone_abbreviation ?? "LOCAL TIME"} <span>·</span> A fresh perspective on your day
              </p>
            </div>
            <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
            <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
            <div className="hero-glass" aria-hidden="true" />
          </motion.section>
        </AnimatePresence>

        {current && (
          <WeatherDetails
            current={current}
            reducedMotion={reducedMotion}
            getWindDirection={getWindDirection}
          />
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
