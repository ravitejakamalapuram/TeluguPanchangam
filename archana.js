/**
 * archana.js
 * Daily archana / deity / mantra suggestion engine.
 * Rules:
 *   - Weekday → deity association
 *   - Special tithis (Ekadashi, Pradosham, Sankashti, Purnima, Amavasya) override
 *   - Returns the nearest temple from config.js based on user location
 */
(function (window) {
  'use strict';

  // Weekday → deity (Sun=0 … Sat=6)
  const WEEKDAY_DEITY = [
    { deity: 'శ్రీ సూర్యదేవుడు', latin: 'Surya Bhagavan',
      mantra: 'ఓం హ్రాం హ్రీం హ్రౌం సః సూర్యాయ నమః',
      meaning: 'ఆరోగ్యం, తేజస్సు ప్రదాతకై సూర్య నమస్కారాలు.' },
    { deity: 'శ్రీ పరమశివుడు', latin: 'Lord Shiva',
      mantra: 'ఓం నమః శివాయ',
      meaning: 'మనశ్శాంతి, ఆయురారోగ్యాలకై శివ స్మరణ.' },
    { deity: 'శ్రీ ఆంజనేయ స్వామి', latin: 'Hanuman',
      mantra: 'ఓం హనుమతే నమః',
      meaning: 'సాహసం, శత్రు భయ నివారణకై ఆంజనేయ స్తోత్రం.' },
    { deity: 'శ్రీ గణేశుడు', latin: 'Ganapathi',
      mantra: 'ఓం గం గణపతయే నమః',
      meaning: 'విఘ్నహర్తకై వినాయక పూజ.' },
    { deity: 'శ్రీ మహావిష్ణువు / గురువు', latin: 'Vishnu / Guru',
      mantra: 'ఓం నమో నారాయణాయ',
      meaning: 'ఐశ్వర్యం, జ్ఞానం కోసం విష్ణు సేవ.' },
    { deity: 'శ్రీ లక్ష్మీదేవి', latin: 'Lakshmi Devi',
      mantra: 'ఓం శ్రీం హ్రీం శ్రీం మహాలక్ష్మ్యై నమః',
      meaning: 'సౌభాగ్యం, ధనధాన్యాలకై లక్ష్మీ స్తోత్రం.' },
    { deity: 'శ్రీ శనీశ్వరుడు', latin: 'Shani',
      mantra: 'ఓం శం శనైశ్చరాయ నమః',
      meaning: 'శని దోష నివారణకై శనైశ్చర ప్రార్థన.' },
  ];

  // Special tithi overrides
  const SPECIAL_TITHI = {
    10: { deity: 'శ్రీ మహావిష్ణువు', latin: 'Vishnu (Ekadashi)',
          mantra: 'ఓం నమో భగవతే వాసుదేవాయ',
          meaning: 'ఏకాదశి ఉపవాస దినం. విష్ణు సహస్రనామ పారాయణ విశేషం.' },
    14: { deity: 'శ్రీ సత్యనారాయణ స్వామి', latin: 'Satyanarayana (Purnima)',
          mantra: 'ఓం నమో భగవతే శ్రీ సత్యనారాయణాయ',
          meaning: 'పూర్ణిమ నాడు సత్యనారాయణ వ్రతం శుభప్రదం.' },
    25: { deity: 'శ్రీ మహావిష్ణువు', latin: 'Vishnu (Ekadashi)',
          mantra: 'ఓం నమో భగవతే వాసుదేవాయ',
          meaning: 'కృష్ణ పక్ష ఏకాదశి. ఉపవాస వ్రతం పుణ్యప్రదం.' },
    29: { deity: 'పితృ దేవతలు / శివుడు', latin: 'Pitru Devata / Shiva (Amavasya)',
          mantra: 'ఓం పితృభ్యో నమః',
          meaning: 'అమావాస్య నాడు పితృ తర్పణం / శివారాధన.' },
    27: { deity: 'శ్రీ పరమశివుడు', latin: 'Shiva (Pradosham)',
          mantra: 'ఓం నమః శివాయ',
          meaning: 'ప్రదోష కాల శివ పూజ సకల పాపహరణం.' },
    12: { deity: 'శ్రీ పరమశివుడు', latin: 'Shiva (Pradosham)',
          mantra: 'ఓం నమః శివాయ',
          meaning: 'ప్రదోష కాల శివ ఆరాధన మహా పుణ్యప్రదం.' },
    3:  { deity: 'శ్రీ వినాయకుడు', latin: 'Ganapathi (Chavithi)',
          mantra: 'ఓం గం గణపతయే నమః',
          meaning: 'చవితి నాడు గణపతి పూజ విశేష ఫలప్రదం.' },
  };

  function getArchana(panchang, latitude, longitude) {
    const weekday = panchang.weekday;
    const tithi = panchang.tithi.index;
    let suggestion = WEEKDAY_DEITY[weekday];

    // Special tithi takes precedence
    if (SPECIAL_TITHI[tithi]) {
      suggestion = SPECIAL_TITHI[tithi];
    }

    const temple = (window.AppConfig && window.AppConfig.getNearestTemple)
      ? window.AppConfig.getNearestTemple(latitude, longitude)
      : null;

    return {
      deity: suggestion.deity,
      deityLatin: suggestion.latin,
      mantra: suggestion.mantra,
      meaning: suggestion.meaning,
      temple,
    };
  }

  window.Archana = { getArchana };
})(window);
