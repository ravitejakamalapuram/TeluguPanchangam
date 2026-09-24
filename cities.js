/**
 * cities.js
 * Built-in city presets for the location picker: lat/lon + IANA timezone.
 * No geocoding service, no network calls — this is the entire location dataset.
 */

(function (window) {
  'use strict';

  const PRESETS = [
    // India
    { id: 'hyderabad', name: 'హైదరాబాద్ (Hyderabad)', region: 'IN', lat: 17.3850, lon: 78.4867, timeZone: 'Asia/Kolkata' },
    { id: 'vijayawada', name: 'విజయవాడ (Vijayawada)', region: 'IN', lat: 16.5062, lon: 80.6480, timeZone: 'Asia/Kolkata' },
    { id: 'visakhapatnam', name: 'విశాఖపట్నం (Visakhapatnam)', region: 'IN', lat: 17.6868, lon: 83.2185, timeZone: 'Asia/Kolkata' },
    { id: 'bengaluru', name: 'బెంగళూరు (Bengaluru)', region: 'IN', lat: 12.9716, lon: 77.5946, timeZone: 'Asia/Kolkata' },
    { id: 'chennai', name: 'చెన్నై (Chennai)', region: 'IN', lat: 13.0827, lon: 80.2707, timeZone: 'Asia/Kolkata' },
    { id: 'delhi', name: 'ఢిల్లీ (Delhi)', region: 'IN', lat: 28.6139, lon: 77.2090, timeZone: 'Asia/Kolkata' },

    // US metros with large Telugu diaspora populations
    { id: 'dallas', name: 'డల్లాస్ (Dallas)', region: 'US', lat: 32.7767, lon: -96.7970, timeZone: 'America/Chicago' },
    { id: 'austin', name: 'ఆస్టిన్ (Austin)', region: 'US', lat: 30.2672, lon: -97.7431, timeZone: 'America/Chicago' },
    { id: 'houston', name: 'హ్యూస్టన్ (Houston)', region: 'US', lat: 29.7604, lon: -95.3698, timeZone: 'America/Chicago' },
    { id: 'atlanta', name: 'అట్లాంటా (Atlanta)', region: 'US', lat: 33.7490, lon: -84.3880, timeZone: 'America/New_York' },
    { id: 'chicago', name: 'చికాగో (Chicago)', region: 'US', lat: 41.8781, lon: -87.6298, timeZone: 'America/Chicago' },
    { id: 'newyork', name: 'న్యూయార్క్ / న్యూజెర్సీ (New York / Edison, NJ)', region: 'US', lat: 40.5187, lon: -74.4121, timeZone: 'America/New_York' },
    { id: 'bayarea', name: 'శాన్‌ఫ్రాన్సిస్కో బే ఏరియా (Bay Area - San Jose)', region: 'US', lat: 37.3382, lon: -121.8863, timeZone: 'America/Los_Angeles' },
    { id: 'seattle', name: 'సియాటిల్ (Seattle)', region: 'US', lat: 47.6062, lon: -122.3321, timeZone: 'America/Los_Angeles' },
    { id: 'phoenix', name: 'ఫీనిక్స్ (Phoenix)', region: 'US', lat: 33.4484, lon: -112.0740, timeZone: 'America/Phoenix' },
    { id: 'charlotte', name: 'షార్లెట్ (Charlotte)', region: 'US', lat: 35.2271, lon: -80.8431, timeZone: 'America/New_York' },
    { id: 'boston', name: 'బోస్టన్ (Boston)', region: 'US', lat: 42.3601, lon: -71.0589, timeZone: 'America/New_York' },
    { id: 'raleigh', name: 'రాలీ (Raleigh)', region: 'US', lat: 35.7796, lon: -78.6382, timeZone: 'America/New_York' }
  ];

  const DEFAULT_CITY_ID = 'hyderabad';

  function getById(id) {
    return PRESETS.find((c) => c.id === id) || null;
  }

  function getDefault() {
    return getById(DEFAULT_CITY_ID);
  }

  window.CityPresets = { PRESETS, DEFAULT_CITY_ID, getById, getDefault };

})(window);
