export const initialPlace = {
  id: "dhaka",
  name: "Dhaka",
  region: "Dhaka",
  country: "Bangladesh",
  latitude: 23.8103,
  longitude: 90.4125,
};

export function getSavedPlace() {
  try {
    const saved = JSON.parse(localStorage.getItem("weather-place"));
    if (
      saved?.name &&
      Number.isFinite(saved.latitude) &&
      Number.isFinite(saved.longitude)
    ) {
      return saved;
    }
  } catch (error) {
    console.warn("The saved weather location could not be read.", error);
    return initialPlace;
  }
  return initialPlace;
}

export function getSavedForecast(placeId) {
  try {
    const saved = JSON.parse(localStorage.getItem(`weather-forecast:${placeId}`));
    if (saved?.current && saved?.hourly && saved?.daily) return saved;
  } catch (error) {
    console.warn("The saved forecast could not be read.", error);
    return null;
  }
  return null;
}
