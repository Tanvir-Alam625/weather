import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { searchLocations } from "../../weather.js";
import Icon from "../ui/Icon.jsx";

export default function CitySearch({ onSelect, onOpenChange, reducedMotion }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const setOpen = (open) => {
    setIsOpen(open);
    onOpenChange(open);
  };

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
    setOpen(false);
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
          else setOpen(true);
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
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
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
                  <span>
                    <strong>{place.name}</strong>
                    <small>{[place.region, place.country].filter(Boolean).join(", ")}</small>
                  </span>
                  <Icon name="arrow" size={15} />
                </motion.button>
              ))
            ) : (
              <p className="suggestion-message">{searchError || "Type to search for a place."}</p>
            )}
          </motion.div>
        )}
      </form>
      {isOpen && (
        <button
          className="search-dismiss"
          aria-label="Close suggestions"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
