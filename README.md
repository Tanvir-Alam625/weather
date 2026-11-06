# Weather

Weather is a responsive weather dashboard built with React, Vite, and Motion. It uses Open-Meteo's free geocoding and forecast APIs, so no API key or backend setup is required.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`.

## Run with Docker

Build the production image and start the app on port 8080:

```sh
docker build -t weather .
docker run --rm -p 8080:8080 weather
```

Open [http://localhost:8080](http://localhost:8080). The container serves the optimized static build with Nginx, supports client-side routes, and includes the offline app shell. Browser geolocation and PWA installation require a secure context; they work on `localhost` and on HTTPS deployments. On iPhone or iPad, tap **Install app**, then use the browser's Share menu and choose **Add to Home Screen**.

## Features

- Search worldwide locations with keyboard-accessible suggestions.
- View current conditions, 12 hourly periods, and a seven-day forecast.
- Use browser geolocation when available.
- Switch between dark and light themes.
- Weather-specific sun, cloud, rain, snow, and fog effects; CSS handles atmospheric loops and Motion handles responsive interface transitions.
- Reduced-motion preferences, mobile layouts, loading feedback, and explicit network errors.
- Installable PWA with an offline app shell and cached recent forecasts and location searches.

Forecast data is provided by [Open-Meteo](https://open-meteo.com/).
