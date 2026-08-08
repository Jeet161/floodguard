import { createContext, useContext, useState } from "react";

const LocationContext = createContext(null);

const DEFAULT_LOCATION = { latitude: 26.9124, longitude: 75.7873, name: "Jaipur, Rajasthan, India" };

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
