/**
 * config.js
 * Locale + Regional configuration for the calendar dashboard.
 * Designed so future versions can ship Tamil/Kannada/Hindi packs without
 * touching application logic — just register a new locale here.
 *
 * window.AppConfig.locale = 'te'   (default Telugu)
 */
(function (window) {
  'use strict';

  const STRINGS = {
    te: {
      // Branding
      app_title: 'శ్రీ తెలుగు పంచాంగం',
      app_subtitle: 'Daily Panchangam · Sankalpam · Rasi Phalalu',
      // Profile / location placeholders
      profile_default_name: 'యజమాని',
      location_detecting: 'స్థానం గుర్తిస్తోంది…',
      location_default: 'హైదరాబాద్',
      open_settings: 'జన్మ వివరాలు',
      // Section headings
      birth_rasi: 'జన్మ రాశి',
      birth_rasi_caption: 'Birth Rasi',
      night_mode: 'చంద్ర కాంతి',
      night_mode_caption: 'Night Mode',
      panchang_today: 'నేటి పంచాంగం',
      panchang_today_caption: 'Today\'s Panchangam',
      muhurtham_timeline: 'దిన ముహూర్త కాల పట్టిక',
      muhurtham_timeline_caption: 'Daily Muhurthams',
      sankalpam_heading: 'దిన సంకల్ప పత్రం',
      sankalpam_caption: 'Vedic Sankalpam',
      copy_sankalpam: 'సంకల్పము నకలు చేయి',
      copy_sankalpam_done: 'నకలు చేయబడింది ✓',
      monthly_calendar: 'నెలసరి పంచాంగం',
      monthly_calendar_caption: 'Monthly Calendar',
      year_overview: 'వార్షిక సింహావలోకనం',
      year_overview_caption: 'Year Overview',
      archana_heading: 'నేటి అర్చన',
      archana_caption: 'Today\'s Archana',
      horoscope_heading: 'గోచార రాశి ఫలాలు',
      horoscope_caption: 'Daily Rasi Phalalu',
      upcoming_festivals: 'రాబోయే పండుగలు',
      upcoming_festivals_caption: 'Upcoming Festivals',
      reminders_heading: 'నేటి ఈవెంట్లు',
      reminders_caption: 'Today\'s Reminders / Events',
      no_reminders: 'నేటికి ఈవెంట్లు లేవు',
      // Panchang labels
      tithi: 'తిథి',
      nakshatram: 'నక్షత్రం',
      yogam: 'యోగం',
      karanam: 'కరణం',
      // Timeline labels
      auspicious_legend: 'శుభ కాలములు',
      inauspicious_legend: 'వర్జ్య కాలములు',
      now_label: 'ఇప్పుడు',
      rahu_kalam: 'రాహుకాలం',
      yama_gandam: 'యమగండం',
      durmuhurtham: 'దుర్ముహూర్తం',
      varjyam: 'వర్జ్యం',
      amritakalam: 'అమృతకాలం',
      abhijit: 'అభిజిత్ ముహూర్తం',
      sunrise: 'సూర్యోదయం',
      sunset: 'సూర్యాస్తమయం',
      // Banners
      eclipse_solar_title: 'సూర్య గ్రహణ హెచ్చరిక',
      eclipse_lunar_title: 'చంద్ర గ్రహణ హెచ్చరిక',
      eclipse_desc_prefix: 'గ్రహణ పీక్',
      birthday_greeting: 'జన్మదిన శుభాకాంక్షలు!',
      birthday_desc: 'తెలుగు పంచాంగం ప్రకారం ఈరోజు మీ జన్మ తిథి / నక్షత్రం. సకల శుభాలు కలుగుగాక.',
      // Year overview
      year_samvatsara: 'సంవత్సరం',
      year_ayanam: 'అయనం',
      year_ritu: 'ఋతువు',
      year_masa: 'మాసం',
      year_paksham: 'పక్షం',
      year_archana_for: 'అర్చనకై స్థలం',
      // Horoscope tabs
      tab_health: 'ఆరోగ్యం',
      tab_wealth: 'ఆదాయం',
      tab_career: 'కెరీర్',
      tab_love: 'ప్రేమ',
      // Forms
      event_title: 'ఈవెంట్ పేరు',
      event_desc: 'వివరణ (ఐచ్ఛికం)',
      event_type_solar: 'తేదీ (Gregorian)',
      event_type_lunar: 'తిథి (Telugu Lunar)',
      add_event: 'ఈవెంట్ జోడించు',
      // Settings
      settings_title: 'జన్మ వివరముల సవరణ',
      set_name: 'పేరు',
      set_dob: 'పుట్టిన తేదీ',
      set_tob: 'పుట్టిన సమయం',
      set_lat: 'అక్షాంశం (Latitude)',
      set_lng: 'రేఖాంశం (Longitude)',
      save_details: 'భద్రపరుచు',
      // Weekday short names (Sun first to match getDay())
      weekday_short: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
    },
  };

  // Famous Telugu temple landmarks for nearest-archana suggestion
  const TEMPLES = [
    { name: 'తిరుమల వేంకటేశ్వర స్వామి', latin: 'Tirumala Venkateswara', deity: 'శ్రీ వేంకటేశ్వరుడు', lat: 13.6831, lng: 79.3474 },
    { name: 'శ్రీశైలం మల్లికార్జున', latin: 'Srisailam Mallikarjuna', deity: 'శ్రీ మల్లికార్జున స్వామి', lat: 16.0740, lng: 78.8683 },
    { name: 'భద్రాచల రామచంద్ర', latin: 'Bhadrachalam', deity: 'శ్రీ సీతారాముడు', lat: 17.6688, lng: 80.8865 },
    { name: 'యాదాద్రి లక్ష్మీ నరసింహ', latin: 'Yadadri Narasimha', deity: 'శ్రీ లక్ష్మీ నరసింహుడు', lat: 17.5944, lng: 78.9442 },
    { name: 'విజయవాడ కనకదుర్గ', latin: 'Kanaka Durga, Vijayawada', deity: 'శ్రీ కనకదుర్గమ్మ', lat: 16.5193, lng: 80.6305 },
    { name: 'అన్నవరం సత్యనారాయణ', latin: 'Annavaram Satyanarayana', deity: 'శ్రీ సత్యనారాయణ స్వామి', lat: 17.2810, lng: 82.3970 },
    { name: 'సింహాచలం వరాహ నరసింహ', latin: 'Simhachalam Narasimha', deity: 'శ్రీ వరాహ లక్ష్మీ నరసింహ', lat: 17.7670, lng: 83.2517 },
    { name: 'ద్వారక తిరుమల చిన తిరుపతి', latin: 'Dwaraka Tirumala', deity: 'శ్రీ వేంకటేశ్వరుడు', lat: 17.0334, lng: 81.3294 },
    { name: 'బిర్లా మందిర్, హైదరాబాద్', latin: 'Birla Mandir, Hyderabad', deity: 'శ్రీ వేంకటేశ్వరుడు', lat: 17.4063, lng: 78.4691 },
    { name: 'చిల్కూర్ బాలాజీ', latin: 'Chilkur Balaji', deity: 'శ్రీ బాలాజీ', lat: 17.3489, lng: 78.2960 },
    { name: 'రామప్ప దేవాలయం', latin: 'Ramappa Temple', deity: 'శ్రీ రామలింగేశ్వరుడు', lat: 18.2596, lng: 79.9426 },
    { name: 'వేములవాడ రాజరాజేశ్వర', latin: 'Vemulawada Rajarajeshwara', deity: 'శ్రీ రాజరాజేశ్వర స్వామి', lat: 18.4673, lng: 78.8669 },
    { name: 'బాసర సరస్వతీ దేవి', latin: 'Basara Saraswati', deity: 'శ్రీ సరస్వతీ దేవి', lat: 18.8536, lng: 77.9420 },
    { name: 'మహానంది', latin: 'Mahanandi', deity: 'శ్రీ మహానందీశ్వరుడు', lat: 15.4732, lng: 78.4006 },
    { name: 'మన్త్రాలయ రాఘవేంద్ర', latin: 'Mantralayam Raghavendra', deity: 'శ్రీ రాఘవేంద్ర స్వామి', lat: 15.9610, lng: 77.5039 },
  ];

  const t = (key) => {
    const lang = window.AppConfig.locale || 'te';
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.te[key] || key;
  };

  // Haversine distance in km
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getNearestTemple = (lat, lng) => {
    let best = TEMPLES[0];
    let bestDist = Infinity;
    for (const temple of TEMPLES) {
      const d = haversineKm(lat, lng, temple.lat, temple.lng);
      if (d < bestDist) { bestDist = d; best = temple; }
    }
    return { ...best, distanceKm: Math.round(bestDist) };
  };

  window.AppConfig = {
    locale: 'te',
    strings: STRINGS,
    temples: TEMPLES,
    t,
    getNearestTemple,
  };
})(window);
