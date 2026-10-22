// The deity traditionally worshipped on each weekday, with a dhyana shloka and short nama mantras.
// Index = JS weekday (0 Sunday). Mantras and shlokas are liturgical: Telugu script always, with a
// plain romanisation for English readers. Pure data, no DOM.

export const DEITIES = [
  {
    id: 'surya', sticker: 'art/deities/surya.webp', tint: '#FFF3DF',
    name: { te: 'శ్రీ సూర్యనారాయణ స్వామి', en: 'Sri Surya Narayana' },
    blessing: { te: 'ఆరోగ్య ప్రదాత', en: 'Giver of health' },
    mantras: [
      { te: 'ఓం సూర్యాయ నమః', en: 'Om Sūryāya Namaḥ' },
      { te: 'ఓం భాస్కరాయ నమః', en: 'Om Bhāskarāya Namaḥ' },
      { te: 'ఓం ఆదిత్యాయ నమః', en: 'Om Ādityāya Namaḥ' }
    ],
    dhyana: {
      te: 'జపాకుసుమ సంకాశం కాశ్యపేయం మహాద్యుతిమ్ | తమోఽరిం సర్వపాపఘ్నం ప్రణతోఽస్మి దివాకరమ్ ||',
      en: 'Japā-kusuma saṅkāśaṁ kāśyapeyaṁ mahā-dyutim | tamo-’riṁ sarva-pāpa-ghnaṁ praṇato-’smi divākaram ||'
    }
  },
  {
    id: 'shiva', sticker: 'art/deities/shiva.webp', tint: '#EEF4FD',
    name: { te: 'శ్రీ శివుడు', en: 'Lord Shiva' },
    blessing: { te: 'శాంతి ప్రదాత', en: 'Giver of peace' },
    mantras: [
      { te: 'ఓం నమః శివాయ', en: 'Om Namaḥ Śivāya' },
      { te: 'శివాయ గురవే నమః', en: 'Śivāya Gurave Namaḥ' },
      { te: 'హర హర మహాదేవ', en: 'Hara Hara Mahādeva' }
    ],
    dhyana: {
      te: 'కర్పూరగౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారమ్ | సదా వసంతం హృదయారవిందే భవం భవానీసహితం నమామి ||',
      en: 'Karpūra-gauraṁ karuṇāvatāraṁ saṁsāra-sāraṁ bhujagendra-hāram | sadā vasantaṁ hṛdayāravinde bhavaṁ bhavānī-sahitaṁ namāmi ||'
    }
  },
  {
    id: 'hanuman', sticker: 'art/deities/hanuman.webp', tint: '#FFF0E6',
    name: { te: 'శ్రీ ఆంజనేయ స్వామి', en: 'Sri Hanuman' },
    blessing: { te: 'ధైర్య ప్రదాత', en: 'Giver of courage' },
    mantras: [
      { te: 'ఓం ఆంజనేయాయ నమః', en: 'Om Āñjaneyāya Namaḥ' },
      { te: 'శ్రీ రామదూతాయ నమః', en: 'Śrī Rāma-dūtāya Namaḥ' },
      { te: 'ఓం వాయుపుత్రాయ నమః', en: 'Om Vāyu-putrāya Namaḥ' }
    ],
    dhyana: {
      te: 'మనోజవం మారుతతుల్యవేగం జితేంద్రియం బుద్ధిమతాం వరిష్ఠమ్ | వాతాత్మజం వానరయూథముఖ్యం శ్రీరామదూతం శరణం ప్రపద్యే ||',
      en: 'Manojavaṁ māruta-tulya-vegaṁ jitendriyaṁ buddhimatāṁ variṣṭham | vātātmajaṁ vānara-yūtha-mukhyaṁ śrī-rāma-dūtaṁ śaraṇaṁ prapadye ||'
    }
  },
  {
    id: 'ganesha', sticker: 'art/deities/ganesha.webp', tint: '#EEF8EC',
    name: { te: 'శ్రీ వినాయకుడు', en: 'Sri Ganesha' },
    blessing: { te: 'విఘ్న నివారకుడు', en: 'Remover of obstacles' },
    mantras: [
      { te: 'ఓం గం గణపతయే నమః', en: 'Om Gaṁ Gaṇapataye Namaḥ' },
      { te: 'ఓం విఘ్నేశ్వరాయ నమః', en: 'Om Vighneśvarāya Namaḥ' },
      { te: 'ఓం ఏకదంతాయ నమః', en: 'Om Ekadantāya Namaḥ' }
    ],
    dhyana: {
      te: 'వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ | నిర్విఘ్నం కురు మే దేవ సర్వకార్యేషు సర్వదా ||',
      en: 'Vakratuṇḍa mahākāya sūrya-koṭi samaprabha | nirvighnaṁ kuru me deva sarva-kāryeṣu sarvadā ||'
    }
  },
  {
    id: 'dattatreya', sticker: 'art/deities/dattatreya.webp', tint: '#FFF8DC',
    name: { te: 'శ్రీ దత్తాత్రేయ స్వామి', en: 'Sri Dattatreya' },
    blessing: { te: 'గురు కృప', en: "The Guru's grace" },
    mantras: [
      { te: 'ఓం శ్రీ గురుదేవ దత్త', en: 'Om Śrī Gurudeva Datta' },
      { te: 'దిగంబరా దిగంబరా శ్రీపాద వల్లభ దిగంబరా', en: 'Digambarā Digambarā Śrīpāda Vallabha Digambarā' },
      { te: 'ఓం ద్రాం దత్తాత్రేయాయ నమః', en: 'Om Drāṁ Dattātreyāya Namaḥ' }
    ],
    dhyana: {
      te: 'జటాధరం పాండురంగం శూలహస్తం కృపానిధిమ్ | సర్వరోగహరం దేవం దత్తాత్రేయమహం భజే ||',
      en: 'Jaṭādharaṁ pāṇḍuraṅgaṁ śūla-hastaṁ kṛpā-nidhim | sarva-roga-haraṁ devaṁ dattātreyam ahaṁ bhaje ||'
    }
  },
  {
    id: 'lakshmi', sticker: 'art/deities/lakshmi.webp', tint: '#FDEEF4',
    name: { te: 'శ్రీ మహాలక్ష్మి', en: 'Sri Mahalakshmi' },
    blessing: { te: 'ఐశ్వర్య ప్రదాత్రి', en: 'Giver of prosperity' },
    mantras: [
      { te: 'ఓం శ్రీం మహాలక్ష్మ్యై నమః', en: 'Om Śrīṁ Mahālakṣmyai Namaḥ' },
      { te: 'ఓం పద్మాసనాయై నమః', en: 'Om Padmāsanāyai Namaḥ' },
      { te: 'ఓం హరివల్లభాయై నమః', en: 'Om Harivallabhāyai Namaḥ' }
    ],
    dhyana: {
      te: 'నమస్తేఽస్తు మహామాయే శ్రీపీఠే సురపూజితే | శంఖచక్రగదాహస్తే మహాలక్ష్మి నమోఽస్తు తే ||',
      en: 'Namaste-’stu mahāmāye śrī-pīṭhe sura-pūjite | śaṅkha-cakra-gadā-haste mahālakṣmi namo-’stu te ||'
    }
  },
  {
    id: 'venkateswara', sticker: 'art/deities/venkateswara.webp', tint: '#F3EEFB',
    name: { te: 'శ్రీ వేంకటేశ్వర స్వామి', en: 'Sri Venkateswara' },
    blessing: { te: 'స్వామివారి అనుగ్రహం', en: "The Lord's blessing" },
    mantras: [
      { te: 'ఓం నమో వేంకటేశాయ', en: 'Om Namo Veṅkaṭeśāya' },
      { te: 'ఓం శ్రీనివాసాయ నమః', en: 'Om Śrīnivāsāya Namaḥ' },
      { te: 'గోవిందా గోవిందా', en: 'Govindā Govindā' }
    ],
    dhyana: {
      te: 'శ్రియః కాంతాయ కళ్యాణనిధయే నిధయేఽర్థినామ్ | శ్రీవేంకటనివాసాయ శ్రీనివాసాయ మంగళమ్ ||',
      en: 'Śriyaḥ kāntāya kalyāṇa-nidhaye nidhaye-’rthinām | śrī-veṅkaṭa-nivāsāya śrīnivāsāya maṅgalam ||'
    }
  }
];

export const WEEKDAY_NAMES = {
  te: ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

// The weekday's deity in one language: plain strings ready for textContent.
export function deityFor(weekday, lang = 'te') {
  const d = DEITIES[((weekday % 7) + 7) % 7];
  const l = lang === 'en' ? 'en' : 'te';
  return {
    id: d.id, sticker: d.sticker, tint: d.tint, weekday,
    weekdayName: WEEKDAY_NAMES[l][weekday],
    name: d.name[l], blessing: d.blessing[l],
    mantras: d.mantras.map((m) => m[l]),
    dhyana: d.dhyana[l]
  };
}

// The pooja, in the traditional order (an abridged shodashopachara). Shlokas are the standard
// verses for each upachara; `{dhyana}` and `{mantras}` take the day's deity.
export const POOJA_STEPS = [
  { id: 'deepa-aradhana', name: { te: 'దీపారాధన', en: 'Lighting the lamp' },
    line: { te: 'దీపం జ్యోతి పరబ్రహ్మ దీపం సర్వతమోపహమ్ | దీపేన సాధ్యతే సర్వం సంధ్యాదీప నమోఽస్తు తే ||',
      en: 'Dīpaṁ jyoti parabrahma dīpaṁ sarva-tamopaham | dīpena sādhyate sarvaṁ sandhyā-dīpa namo-’stu te ||' } },
  { id: 'ganapati', name: { te: 'గణపతి ప్రార్థన', en: 'Prayer to Ganapati' },
    line: { te: 'శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజమ్ | ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే ||',
      en: 'Śuklāmbara-dharaṁ viṣṇuṁ śaśi-varṇaṁ catur-bhujam | prasanna-vadanaṁ dhyāyet sarva-vighnopaśāntaye ||' } },
  { id: 'ghanta', name: { te: 'శంఖ ఘంటా నాదం', en: 'Conch and bell' },
    line: { te: 'ఆగమార్థం తు దేవానాం గమనార్థం తు రక్షసామ్ | కుర్వే ఘంటారవం తత్ర దేవతాహ్వాన లాంఛనమ్ ||',
      en: 'Āgamārthaṁ tu devānāṁ gamanārthaṁ tu rakṣasām | kurve ghaṇṭā-ravaṁ tatra devatāhvāna-lāñchanam ||' } },
  { id: 'dhyanam', name: { te: 'ధ్యానం · ఆవాహనం', en: 'Meditation and invocation' },
    line: { te: '{dhyana}', en: '{dhyana}' }, note: { te: 'ధ్యాయామి · ఆవాహయామి', en: 'Dhyāyāmi · āvāhayāmi' } },
  { id: 'snanam', name: { te: 'స్నానం (అభిషేకం)', en: 'Holy bath (abhishekam)' },
    line: { te: 'శుద్ధోదక స్నానం సమర్పయామి', en: 'Śuddhodaka snānaṁ samarpayāmi' } },
  { id: 'archana', name: { te: 'గంధ పుష్ప అర్చన', en: 'Sandal paste and flowers' },
    line: { te: '{mantras}', en: '{mantras}' }, note: { te: 'గంధం ధారయామి · పుష్పైః పూజయామి', en: 'Gandhaṁ dhārayāmi · puṣpaiḥ pūjayāmi' } },
  { id: 'dhupam', name: { te: 'ధూపం', en: 'Incense' },
    line: { te: 'ధూపమాఘ్రాపయామి', en: 'Dhūpam āghrāpayāmi' } },
  { id: 'deepam', name: { te: 'దీపం', en: 'Lamp' },
    line: { te: 'దీపం దర్శయామి', en: 'Dīpaṁ darśayāmi' } },
  { id: 'naivedyam', name: { te: 'నైవేద్యం', en: 'Food offering' },
    line: { te: 'నైవేద్యం సమర్పయామి · తాంబూలం సమర్పయామి', en: 'Naivedyaṁ samarpayāmi · tāmbūlaṁ samarpayāmi' } },
  { id: 'neerajanam', name: { te: 'కర్పూర నీరాజనం', en: 'Camphor aarti' },
    line: { te: 'కర్పూర నీరాజనం సమర్పయామి', en: 'Karpūra nīrājanaṁ samarpayāmi' },
    note: { te: 'పాదాలకు 4 · నాభికి 2 · ముఖానికి 1 · సర్వాంగాలకు 7, ప్రదక్షిణ దిశలో', en: 'Clockwise: 4 times at the feet, 2 at the navel, 1 at the face, 7 over the whole form' } },
  { id: 'mantrapushpam', name: { te: 'మంత్రపుష్పం', en: 'Mantra pushpam' },
    line: { te: 'మంత్రపుష్పం సమర్పయామి', en: 'Mantra-puṣpaṁ samarpayāmi' } },
  { id: 'pradakshina', name: { te: 'ప్రదక్షిణ నమస్కారం', en: 'Circling and bowing' },
    line: { te: 'యాని కాని చ పాపాని జన్మాంతర కృతాని చ | తాని తాని వినశ్యంతి ప్రదక్షిణ పదే పదే ||',
      en: 'Yāni kāni ca pāpāni janmāntara-kṛtāni ca | tāni tāni vinaśyanti pradakṣiṇa pade pade ||' } },
  { id: 'samarpana', name: { te: 'సమర్పణ', en: 'Offering it all' },
    line: { te: 'కాయేన వాచా మనసేంద్రియైర్వా బుద్ధ్యాత్మనా వా ప్రకృతేః స్వభావాత్ | కరోమి యద్యత్ సకలం పరస్మై నారాయణాయేతి సమర్పయామి ||',
      en: 'Kāyena vācā manasendriyair vā buddhyātmanā vā prakṛteḥ svabhāvāt | karomi yad yat sakalaṁ parasmai nārāyaṇāyeti samarpayāmi ||' } }
];

// One step's text for a deity: { name, lines[], note }.
export function poojaStepText(step, deity, lang = 'te') {
  const l = lang === 'en' ? 'en' : 'te';
  const raw = step.line[l];
  const lines = raw === '{dhyana}' ? [deity.dhyana] : raw === '{mantras}' ? deity.mantras : [raw];
  return { name: step.name[l], lines, note: step.note ? step.note[l] : '' };
}
