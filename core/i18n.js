// Localized names keyed by canonical ID. Domain data never contains these strings.
import { TITHI, NAKSHATRA, YOGA, KARANA, VARA, MASA, RASI, RITU, SAMVATSARA } from './ids.js';

const zip = (ids, te, en) => Object.fromEntries(ids.map((id, i) => [id, { te: te[i], en: en[i] }]));
const words = (s) => s.split(',').map((w) => w.trim());

const tithiTe = words('పాడ్యమి, విదియ, తదియ, చవితి, పంచమి, షష్ఠి, సప్తమి, అష్టమి, నవమి, దశమి, ఏకాదశి, ద్వాదశి, త్రయోదశి, చతుర్దశి');
const tithiEn = words('Pratipada, Dwitiya, Tritiya, Chaturthi, Panchami, Shashthi, Saptami, Ashtami, Navami, Dashami, Ekadashi, Dwadashi, Trayodashi, Chaturdashi');

const NAMES = {
  ...zip(TITHI, [...tithiTe, 'పౌర్ణమి', ...tithiTe, 'అమావాస్య'], [...tithiEn, 'Purnima', ...tithiEn, 'Amavasya']),
  ...zip(NAKSHATRA,
    words('అశ్విని, భరణి, కృత్తిక, రోహిణి, మృగశిర, ఆర్ద్ర, పునర్వసు, పుష్యమి, ఆశ్లేష, మఖ, పుబ్బ, ఉత్తర, హస్త, చిత్త, స్వాతి, విశాఖ, అనూరాధ, జ్యేష్ఠ, మూల, పూర్వాషాఢ, ఉత్తరాషాఢ, శ్రవణం, ధనిష్ఠ, శతభిషం, పూర్వాభాద్ర, ఉత్తరాభాద్ర, రేవతి'),
    words('Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishtha, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, Revati')),
  ...zip(YOGA,
    words('విష్కంభం, ప్రీతి, ఆయుష్మాన్, సౌభాగ్యం, శోభనం, అతిగండం, సుకర్మ, ధృతి, శూలం, గండం, వృద్ధి, ధ్రువం, వ్యాఘాతం, హర్షణం, వజ్రం, సిద్ధి, వ్యతీపాతం, వరీయాన్, పరిఘ, శివం, సిద్ధం, సాధ్యం, శుభం, శుక్లం, బ్రహ్మం, ఐంద్రం, వైధృతి'),
    words('Vishkumbha, Priti, Ayushman, Saubhagya, Shobhana, Atiganda, Sukarma, Dhriti, Shula, Ganda, Vriddhi, Dhruva, Vyaghata, Harshana, Vajra, Siddhi, Vyatipata, Variyan, Parigha, Shiva, Siddha, Sadhya, Shubha, Shukla, Brahma, Indra, Vaidhriti')),
  ...zip(KARANA,
    words('కింస్తుఘ్నం, బవ, బాలవ, కౌలవ, తైతుల, గరజి, వణిజ, విష్టి (భద్ర), శకుని, చతుష్పాత్తు, నాగవం'),
    words('Kimstughna, Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (Bhadra), Shakuni, Chatushpada, Naga')),
  ...zip(VARA, words('ఆదివారం, సోమవారం, మంగళవారం, బుధవారం, గురువారం, శుక్రవారం, శనివారం'),
    words('Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday')),
  ...zip(MASA, words('చైత్రం, వైశాఖం, జ్యేష్ఠం, ఆషాఢం, శ్రావణం, భాద్రపదం, ఆశ్వయుజం, కార్తీకం, మార్గశిరం, పుష్యం, మాఘం, ఫాల్గుణం'),
    words('Chaitra, Vaishakha, Jyeshtha, Ashadha, Shravana, Bhadrapada, Ashwayuja, Karthika, Margashira, Pushya, Magha, Phalguna')),
  ...zip(RASI, words('మేషం, వృషభం, మిథునం, కర్కాటకం, సింహం, కన్య, తుల, వృశ్చికం, ధనస్సు, మకరం, కుంభం, మీనం'),
    words('Mesha, Vrishabha, Mithuna, Karkataka, Simha, Kanya, Tula, Vrischika, Dhanus, Makara, Kumbha, Meena')),
  ...zip(RITU, words('వసంత ఋతువు, గ్రీష్మ ఋతువు, వర్ష ఋతువు, శరదృతువు, హేమంత ఋతువు, శిశిర ఋతువు'),
    words('Vasanta, Grishma, Varsha, Sharad, Hemanta, Shishira')),
  ...zip(SAMVATSARA,
    words('ప్రభవ, విభవ, శుక్ల, ప్రమోదూత, ప్రజోత్పత్తి, అంగీరస, శ్రీముఖ, భావ, యువ, ధాత, ఈశ్వర, బహుధాన్య, ప్రమాది, విక్రమ, వృష, చిత్రభాను, స్వభాను, తారణ, పార్థివ, వ్యయ, సర్వజిత్తు, సర్వధారి, విరోధి, వికృతి, ఖర, నందన, విజయ, జయ, మన్మథ, దుర్ముఖి, హేవిళంబి, విళంబి, వికారి, శార్వరి, ప్లవ, శుభకృతు, శోభకృతు, క్రోధి, విశ్వావసు, పరాభవ, ప్లవంగ, కీలక, సౌమ్య, సాధారణ, విరోధికృతు, పరీధావి, ప్రమాదీచ, ఆనంద, రాక్షస, నల, పింగళ, కాళయుక్తి, సిద్ధార్థి, రౌద్రి, దుర్మతి, దుందుభి, రుధిరోద్గారి, రక్తాక్షి, క్రోధన, అక్షయ'),
    words('Prabhava, Vibhava, Shukla, Pramoduta, Prajotpatti, Angirasa, Shrimukha, Bhava, Yuva, Dhata, Ishvara, Bahudhanya, Pramadi, Vikrama, Vrisha, Chitrabhanu, Svabhanu, Tarana, Parthiva, Vyaya, Sarvajit, Sarvadhari, Virodhi, Vikruti, Khara, Nandana, Vijaya, Jaya, Manmatha, Durmukhi, Hevilambi, Vilambi, Vikari, Sharvari, Plava, Shubhakrutu, Shobhakrutu, Krodhi, Vishvavasu, Parabhava, Plavanga, Kilaka, Saumya, Sadharana, Virodhikrutu, Paridhavi, Pramadeecha, Ananda, Rakshasa, Nala, Pingala, Kalayukti, Siddharthi, Raudri, Durmati, Dundubhi, Rudhirodgari, Raktakshi, Krodhana, Akshaya')),
  PAKSHA_SHUKLA: { te: 'శుద్ధ', en: 'Shukla' },
  PAKSHA_KRISHNA: { te: 'బహుళ', en: 'Krishna' },
  AYANA_UTTARAYANA: { te: 'ఉత్తరాయణం', en: 'Uttarayana' },
  AYANA_DAKSHINAYANA: { te: 'దక్షిణాయనం', en: 'Dakshinayana' },

  FESTIVAL_UGADI: { te: 'ఉగాది', en: 'Ugadi' },
  FESTIVAL_SRI_RAMA_NAVAMI: { te: 'శ్రీరామ నవమి', en: 'Sri Rama Navami' },
  FESTIVAL_AKSHAYA_TRITIYA: { te: 'అక్షయ తృతీయ', en: 'Akshaya Tritiya' },
  FESTIVAL_NARASIMHA_JAYANTI: { te: 'నృసింహ జయంతి', en: 'Narasimha Jayanti' },
  FESTIVAL_HANUMAN_JAYANTI_TELUGU: { te: 'హనుమజ్జయంతి', en: 'Hanuman Jayanti' },
  FESTIVAL_ERUVAKA_PURNIMA: { te: 'ఏరువాక పౌర్ణమి', en: 'Eruvaka Purnima' },
  FESTIVAL_TOLI_EKADASHI: { te: 'తొలి ఏకాదశి', en: 'Toli Ekadashi' },
  FESTIVAL_GURU_PURNIMA: { te: 'గురు పౌర్ణమి', en: 'Guru Purnima' },
  FESTIVAL_BONALU: { te: 'బోనాలు', en: 'Bonalu' },
  FESTIVAL_NAGULA_PANCHAMI: { te: 'నాగుల పంచమి', en: 'Nagula Panchami' },
  FESTIVAL_RAKHI_PURNIMA: { te: 'రాఖీ పౌర్ణమి / జంధ్యాల పౌర్ణమి', en: 'Raksha Bandhan' },
  FESTIVAL_VARALAKSHMI_VRATAM: { te: 'వరలక్ష్మీ వ్రతం', en: 'Varalakshmi Vratam' },
  FESTIVAL_SHRAVANA_MANGALAVARAM: { te: 'శ్రావణ మంగళవారం (మంగళగౌరీ వ్రతం)', en: 'Shravana Mangalavaram' },
  FESTIVAL_KRISHNASHTAMI: { te: 'శ్రీ కృష్ణాష్టమి', en: 'Krishna Janmashtami' },
  FESTIVAL_VINAYAKA_CHAVITHI: { te: 'వినాయక చవితి', en: 'Vinayaka Chavithi' },
  FESTIVAL_MAHALAYA_PAKSHAM_START: { te: 'మహాలయ పక్షం ప్రారంభం', en: 'Mahalaya Paksham begins' },
  FESTIVAL_UNDRALLA_TADDE: { te: 'ఉండ్రాళ్ల తద్దె', en: 'Undralla Tadde' },
  FESTIVAL_MAHALAYA_AMAVASYA: { te: 'మహాలయ అమావాస్య', en: 'Mahalaya Amavasya' },
  FESTIVAL_ENGILI_PULA_BATHUKAMMA: { te: 'ఎంగిలి పూల బతుకమ్మ', en: 'Engili Pula Bathukamma' },
  FESTIVAL_NAVARATRI_START: { te: 'దేవీ నవరాత్రులు ప్రారంభం', en: 'Navaratri begins' },
  FESTIVAL_DURGASHTAMI: { te: 'దుర్గాష్టమి', en: 'Durgashtami' },
  FESTIVAL_SADDULA_BATHUKAMMA: { te: 'సద్దుల బతుకమ్మ', en: 'Saddula Bathukamma' },
  FESTIVAL_MAHANAVAMI: { te: 'మహర్నవమి', en: 'Mahanavami' },
  FESTIVAL_VIJAYADASHAMI: { te: 'విజయదశమి / దసరా', en: 'Vijayadashami / Dasara' },
  FESTIVAL_ATLA_TADDE: { te: 'అట్లతద్దె', en: 'Atla Tadde' },
  FESTIVAL_NARAKA_CHATURDASHI: { te: 'నరక చతుర్దశి', en: 'Naraka Chaturdashi' },
  FESTIVAL_DEEPAVALI: { te: 'దీపావళి', en: 'Deepavali' },
  FESTIVAL_KARTHIKA_MASA_START: { te: 'కార్తీక మాసం ప్రారంభం', en: 'Karthika Masam begins' },
  FESTIVAL_KARTHIKA_SOMAVARAM: { te: 'కార్తీక సోమవారం', en: 'Karthika Somavaram' },
  FESTIVAL_NAGULA_CHAVITHI: { te: 'నాగుల చవితి', en: 'Nagula Chavithi' },
  FESTIVAL_UTTHANA_EKADASHI: { te: 'ఉత్థాన ఏకాదశి', en: 'Utthana Ekadashi' },
  FESTIVAL_KSHEERABDI_DWADASHI: { te: 'క్షీరాబ్ది ద్వాదశి', en: 'Ksheerabdi Dwadashi' },
  FESTIVAL_KARTHIKA_PURNIMA: { te: 'కార్తీక పౌర్ణమి', en: 'Karthika Purnima' },
  FESTIVAL_SUBRAHMANYA_SHASHTHI: { te: 'సుబ్రహ్మణ్య షష్ఠి', en: 'Subrahmanya Shashthi' },
  FESTIVAL_DHANURMASA_START: { te: 'ధనుర్మాసం ప్రారంభం', en: 'Dhanurmasam begins' },
  FESTIVAL_VAIKUNTA_EKADASHI: { te: 'వైకుంఠ ఏకాదశి / ముక్కోటి ఏకాదశి', en: 'Vaikunta Ekadashi' },
  FESTIVAL_BHOGI: { te: 'భోగి', en: 'Bhogi' },
  FESTIVAL_MAKARA_SANKRANTI: { te: 'మకర సంక్రాంతి', en: 'Makara Sankranti' },
  FESTIVAL_KANUMA: { te: 'కనుమ', en: 'Kanuma' },
  FESTIVAL_MUKKANUMA: { te: 'ముక్కనుమ', en: 'Mukkanuma' },
  FESTIVAL_VASANTA_PANCHAMI: { te: 'శ్రీ పంచమి / వసంత పంచమి', en: 'Vasanta Panchami' },
  FESTIVAL_RATHA_SAPTAMI: { te: 'రథ సప్తమి', en: 'Ratha Saptami' },
  FESTIVAL_BHISHMA_EKADASHI: { te: 'భీష్మ ఏకాదశి', en: 'Bhishma Ekadashi' },
  FESTIVAL_MAHA_SHIVARATRI: { te: 'మహా శివరాత్రి', en: 'Maha Shivaratri' },
  FESTIVAL_HOLI: { te: 'కాముని పున్నమి / హోలీ', en: 'Holi' },
  VRATA_SHUKLA_EKADASHI: { te: 'ఏకాదశి', en: 'Ekadashi' },
  VRATA_KRISHNA_EKADASHI: { te: 'ఏకాదశి', en: 'Ekadashi' },
  VRATA_PURNIMA: { te: 'పౌర్ణమి', en: 'Purnima' },
  VRATA_AMAVASYA: { te: 'అమావాస్య', en: 'Amavasya' },
  VRATA_SANKASHTI_CHATURTHI: { te: 'సంకటహర చతుర్థి', en: 'Sankashti Chaturthi' },
  VRATA_SHUKLA_PRADOSHAM: { te: 'ప్రదోషం', en: 'Pradosham' },
  VRATA_KRISHNA_PRADOSHAM: { te: 'ప్రదోషం', en: 'Pradosham' },
  VRATA_MASA_SHIVARATRI: { te: 'మాస శివరాత్రి', en: 'Masa Shivaratri' },

  SANKRANTI_MESHA: { te: 'మేష సంక్రమణం', en: 'Mesha Sankranti' },
  SANKRANTI_VRISHABHA: { te: 'వృషభ సంక్రమణం', en: 'Vrishabha Sankranti' },
  SANKRANTI_MITHUNA: { te: 'మిథున సంక్రమణం', en: 'Mithuna Sankranti' },
  SANKRANTI_KARKATAKA: { te: 'కర్కాటక సంక్రమణం', en: 'Karkataka Sankranti' },
  SANKRANTI_SIMHA: { te: 'సింహ సంక్రమణం', en: 'Simha Sankranti' },
  SANKRANTI_KANYA: { te: 'కన్యా సంక్రమణం', en: 'Kanya Sankranti' },
  SANKRANTI_TULA: { te: 'తులా సంక్రమణం', en: 'Tula Sankranti' },
  SANKRANTI_VRISCHIKA: { te: 'వృశ్చిక సంక్రమణం', en: 'Vrischika Sankranti' },
  SANKRANTI_KUMBHA: { te: 'కుంభ సంక్రమణం', en: 'Kumbha Sankranti' },
  SANKRANTI_MEENA: { te: 'మీన సంక్రమణం', en: 'Meena Sankranti' },

  // Ekadashi names (event.nameId on VRATA_*_EKADASHI), keyed in the observance profile by amanta masa.
  EKADASHI_KAMADA: { te: 'కామద ఏకాదశి', en: 'Kamada Ekadashi' },
  EKADASHI_VARUTHINI: { te: 'వరూథిని ఏకాదశి', en: 'Varuthini Ekadashi' },
  EKADASHI_MOHINI: { te: 'మోహిని ఏకాదశి', en: 'Mohini Ekadashi' },
  EKADASHI_APARA: { te: 'అపర ఏకాదశి', en: 'Apara Ekadashi' },
  EKADASHI_NIRJALA: { te: 'నిర్జల ఏకాదశి', en: 'Nirjala Ekadashi' },
  EKADASHI_YOGINI: { te: 'యోగిని ఏకాదశి', en: 'Yogini Ekadashi' },
  EKADASHI_DEVASHAYANI: { te: 'తొలి ఏకాదశి (శయన ఏకాదశి)', en: 'Toli (Devashayani) Ekadashi' },
  EKADASHI_KAMIKA: { te: 'కామిక ఏకాదశి', en: 'Kamika Ekadashi' },
  EKADASHI_SHRAVANA_PUTRADA: { te: 'శ్రావణ పుత్రదా ఏకాదశి', en: 'Shravana Putrada Ekadashi' },
  EKADASHI_AJA: { te: 'అజ ఏకాదశి', en: 'Aja Ekadashi' },
  EKADASHI_PARIVARTINI: { te: 'పరివర్తన ఏకాదశి', en: 'Parivartini Ekadashi' },
  EKADASHI_INDIRA: { te: 'ఇందిరా ఏకాదశి', en: 'Indira Ekadashi' },
  EKADASHI_PAPANKUSHA: { te: 'పాపాంకుశ ఏకాదశి', en: 'Papankusha Ekadashi' },
  EKADASHI_RAMA: { te: 'రమా ఏకాదశి', en: 'Rama Ekadashi' },
  EKADASHI_PRABODHINI: { te: 'ఉత్థాన ఏకాదశి (ప్రబోధిని ఏకాదశి)', en: 'Prabodhini (Utthana) Ekadashi' },
  EKADASHI_UTPANNA: { te: 'ఉత్పన్న ఏకాదశి', en: 'Utpanna Ekadashi' },
  EKADASHI_MOKSHADA: { te: 'మోక్షద ఏకాదశి', en: 'Mokshada Ekadashi' },
  EKADASHI_SAPHALA: { te: 'సఫల ఏకాదశి', en: 'Saphala Ekadashi' },
  EKADASHI_PAUSHA_PUTRADA: { te: 'పుష్య పుత్రదా ఏకాదశి', en: 'Pausha Putrada Ekadashi' },
  EKADASHI_SHATTILA: { te: 'షట్తిల ఏకాదశి', en: 'Shattila Ekadashi' },
  EKADASHI_JAYA: { te: 'భీష్మ ఏకాదశి (జయ ఏకాదశి)', en: 'Jaya (Bhishma) Ekadashi' },
  EKADASHI_VIJAYA: { te: 'విజయ ఏకాదశి', en: 'Vijaya Ekadashi' },
  EKADASHI_AMALAKI: { te: 'ఆమలకీ ఏకాదశి', en: 'Amalaki Ekadashi' },
  EKADASHI_PAPAMOCHANI: { te: 'పాపమోచని ఏకాదశి', en: 'Papamochani Ekadashi' },
  EKADASHI_PADMINI: { te: 'పద్మిని ఏకాదశి', en: 'Padmini Ekadashi' },
  EKADASHI_PARAMA: { te: 'పరమ ఏకాదశి', en: 'Parama Ekadashi' }
};

export function name(id, lang = 'te') {
  const n = NAMES[id];
  return n ? n[lang] || n.en : id;
}

// A tithi with its paksha ("శుద్ధ సప్తమి", "Krishna Ashtami"); Purnima and Amavasya stand alone.
export function tithiLabel(id, lang = 'te') {
  if (id === 'TITHI_PURNIMA' || id === 'TITHI_AMAVASYA') return name(id, lang);
  return `${name(id.startsWith('TITHI_SHUKLA_') ? 'PAKSHA_SHUKLA' : 'PAKSHA_KRISHNA', lang)} ${name(id, lang)}`;
}

export const ALL_NAMES = NAMES;
