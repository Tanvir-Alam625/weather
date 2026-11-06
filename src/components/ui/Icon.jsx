import React from "react";

export default function Icon({ name, size = 20, ...props }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    install: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
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
