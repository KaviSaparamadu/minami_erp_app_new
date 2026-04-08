// ── Titles ────────────────────────────────────────────────────────────────────
export const TITLES = ['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.', 'Rev.', 'Eng.', 'Lt.', 'Capt.'];

// ─────────────────────────────────────────────────────────────────────────────
// SRI LANKA
// ─────────────────────────────────────────────────────────────────────────────
export const SL_PROVINCES: string[] = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
];

export const SL_DISTRICTS: Record<string, string[]> = {
  'Western':       ['Colombo', 'Gampaha', 'Kalutara'],
  'Central':       ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern':      ['Galle', 'Matara', 'Hambantota'],
  'Northern':      ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern':       ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva':           ['Badulla', 'Monaragala'],
  'Sabaragamuwa':  ['Ratnapura', 'Kegalle'],
};

export const SL_GN_DIVISIONS: Record<string, string[]> = {
  'Colombo':       ['Colombo Fort', 'Pettah', 'Maradana', 'Borella', 'Nugegoda', 'Maharagama', 'Dehiwala', 'Mt. Lavinia', 'Kotte', 'Kaduwela', 'Homagama'],
  'Gampaha':       ['Gampaha', 'Negombo', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Kadawatha', 'Minuwangoda', 'Divulapitiya'],
  'Kalutara':      ['Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama', 'Bandaragama', 'Mathugama'],
  'Kandy':         ['Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya', 'Akurana', 'Digana'],
  'Matale':        ['Matale', 'Dambulla', 'Sigiriya', 'Galewela', 'Rattota', 'Ukuwela'],
  'Nuwara Eliya':  ['Nuwara Eliya', 'Hatton', 'Nanu Oya', 'Bandarawela', 'Haputale', 'Maskeliya'],
  'Galle':         ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Karandeniya', 'Elpitiya', 'Baddegama'],
  'Matara':        ['Matara', 'Weligama', 'Dikwella', 'Akuressa', 'Kamburupitiya', 'Deniyaya'],
  'Hambantota':    ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota', 'Beliatta', 'Weeraketiya'],
  'Jaffna':        ['Jaffna', 'Nallur', 'Point Pedro', 'Chavakachcheri', 'Kayts', 'Kankesanthurai'],
  'Kilinochchi':   ['Kilinochchi', 'Paranthan', 'Poonakary', 'Kandavalai'],
  'Mannar':        ['Mannar', 'Nanattan', 'Madhu', 'Musali', 'Manthai West'],
  'Vavuniya':      ['Vavuniya', 'Vavuniya South', 'Vengalacheddikulam', 'Cheddikulam'],
  'Mullaitivu':    ['Mullaitivu', 'Oddusuddan', 'Puthukudiyiruppu', 'Manthai East'],
  'Trincomalee':   ['Trincomalee', 'Kinniya', 'Muttur', 'Seruvila', 'Kantale', 'Thambalagamuwa'],
  'Batticaloa':    ['Batticaloa', 'Eravur', 'Kattankudy', 'Valaichchenai', 'Manmunai North'],
  'Ampara':        ['Ampara', 'Kalmunai', 'Sammanthurai', 'Akkaraipattu', 'Pottuvil', 'Mahaoya'],
  'Kurunegala':    ['Kurunegala', 'Kuliyapitiya', 'Polgahawela', 'Narammala', 'Mawathagama', 'Nikaweratiya'],
  'Puttalam':      ['Puttalam', 'Chilaw', 'Wennappuwa', 'Nattandiya', 'Marawila', 'Mundel'],
  'Anuradhapura':  ['Anuradhapura', 'Medawachchiya', 'Eppawala', 'Tambuttegama', 'Kekirawa', 'Mihintale'],
  'Polonnaruwa':   ['Polonnaruwa', 'Kaduruwela', 'Hingurakgoda', 'Medirigiriya', 'Dimbulagala'],
  'Badulla':       ['Badulla', 'Bandarawela', 'Haputale', 'Welimada', 'Mahiyanganaya', 'Passara', 'Ella'],
  'Monaragala':    ['Monaragala', 'Wellawaya', 'Bibile', 'Buttala', 'Kataragama', 'Siyambalanduwa'],
  'Ratnapura':     ['Ratnapura', 'Embilipitiya', 'Balangoda', 'Eheliyagoda', 'Pelmadulla', 'Kuruwita'],
  'Kegalle':       ['Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana', 'Galigamuwa', 'Yatiyanthota'],
};

// ─────────────────────────────────────────────────────────────────────────────
// JAPAN
// ─────────────────────────────────────────────────────────────────────────────
export const JP_PREFECTURES: string[] = [
  'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka', 'Fukushima',
  'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo', 'Ibaraki', 'Ishikawa',
  'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa', 'Kochi', 'Kumamoto', 'Kyoto',
  'Mie', 'Miyagi', 'Miyazaki', 'Nagano', 'Nagasaki', 'Nara', 'Niigata', 'Oita',
  'Okayama', 'Okinawa', 'Osaka', 'Saga', 'Saitama', 'Shiga', 'Shimane',
  'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori', 'Toyama', 'Wakayama',
  'Yamagata', 'Yamaguchi', 'Yamanashi',
];

export const JP_CITIES: Record<string, string[]> = {
  'Tokyo':      ['Chiyoda', 'Chuo', 'Minato', 'Shinjuku', 'Bunkyo', 'Taito', 'Sumida', 'Koto', 'Shibuya', 'Toshima', 'Hachioji', 'Nerima', 'Setagaya'],
  'Osaka':      ['Osaka City', 'Sakai', 'Higashiosaka', 'Toyonaka', 'Suita', 'Hirakata', 'Takatsuki', 'Yao'],
  'Kyoto':      ['Kyoto City', 'Uji', 'Kameoka', 'Joyo', 'Nagaokakyo', 'Muko'],
  'Kanagawa':   ['Yokohama', 'Kawasaki', 'Sagamihara', 'Fujisawa', 'Yokosuka', 'Kamakura', 'Odawara'],
  'Aichi':      ['Nagoya', 'Toyota', 'Okazaki', 'Ichinomiya', 'Kasugai', 'Toyohashi'],
  'Fukuoka':    ['Fukuoka City', 'Kitakyushu', 'Kurume', 'Omuta', 'Iizuka', 'Dazaifu'],
  'Hokkaido':   ['Sapporo', 'Hakodate', 'Asahikawa', 'Obihiro', 'Kushiro', 'Otaru'],
  'Hyogo':      ['Kobe', 'Himeji', 'Amagasaki', 'Akashi', 'Nishinomiya', 'Takarazuka'],
  'Saitama':    ['Saitama City', 'Kawaguchi', 'Tokorozawa', 'Kasukabe', 'Koshigaya'],
  'Chiba':      ['Chiba City', 'Funabashi', 'Matsudo', 'Ichikawa', 'Kashiwa', 'Urayasu'],
  'Ibaraki':    ['Mito', 'Tsukuba', 'Hitachi', 'Kashima', 'Tsuchiura'],
  'Hiroshima':  ['Hiroshima City', 'Fukuyama', 'Kure', 'Higashihiroshima', 'Onomichi'],
  'Miyagi':     ['Sendai', 'Ishinomaki', 'Osaki', 'Natori', 'Kesennuma'],
  'Shizuoka':   ['Shizuoka City', 'Hamamatsu', 'Numazu', 'Fuji', 'Mishima'],
  'Nagano':     ['Nagano City', 'Matsumoto', 'Ueda', 'Iida', 'Suwa'],
  'Kumamoto':   ['Kumamoto City', 'Yatsushiro', 'Arao', 'Aso', 'Tamana'],
  'Okayama':    ['Okayama City', 'Kurashiki', 'Tsuyama', 'Tamano', 'Kasaoka'],
  'Nara':       ['Nara City', 'Kashihara', 'Tenri', 'Sakurai', 'Gose'],
  'Okinawa':    ['Naha', 'Okinawa City', 'Uruma', 'Urasoe', 'Ginowan', 'Nago'],
  'Niigata':    ['Niigata City', 'Nagaoka', 'Joetsu', 'Sanjyo', 'Kashiwazaki'],
  'Gunma':      ['Maebashi', 'Takasaki', 'Isesaki', 'Ota', 'Kiryu'],
  'Tochigi':    ['Utsunomiya', 'Oyama', 'Tochigi City', 'Sano', 'Nikko'],
  'Gifu':       ['Gifu City', 'Ogaki', 'Kakamigahara', 'Tajimi', 'Takayama'],
  'Mie':        ['Tsu', 'Yokkaichi', 'Suzuka', 'Matsusaka', 'Kuwana'],
  'Aomori':     ['Aomori City', 'Hirosaki', 'Hachinohe', 'Towada', 'Misawa'],
  'Akita':      ['Akita City', 'Yokote', 'Odate', 'Noshiro', 'Yuzawa'],
  'Iwate':      ['Morioka', 'Ichinoseki', 'Oshu', 'Hanamaki', 'Kitakami'],
  'Yamagata':   ['Yamagata City', 'Yonezawa', 'Tsuruoka', 'Sakata', 'Tendo'],
  'Fukushima':  ['Fukushima City', 'Koriyama', 'Iwaki', 'Aizuwakamatsu', 'Sukagawa'],
  'Ishikawa':   ['Kanazawa', 'Komatsu', 'Hakusan', 'Nanao', 'Kaga'],
  'Fukui':      ['Fukui City', 'Sakai', 'Echizen', 'Obama', 'Tsuruga'],
  'Yamanashi':  ['Kofu', 'Chuo', 'Kai', 'Fuefuki', 'Fujiyoshida'],
  'Shiga':      ['Otsu', 'Kusatsu', 'Moriyama', 'Higashiomi', 'Nagahama'],
  'Ehime':      ['Matsuyama', 'Imabari', 'Uwajima', 'Niihama', 'Saijo'],
  'Kagawa':     ['Takamatsu', 'Marugame', 'Sakaide', 'Kan-onji', 'Sanuki'],
  'Tokushima':  ['Tokushima City', 'Naruto', 'Anan', 'Yoshinogawa', 'Komatsushima'],
  'Kochi':      ['Kochi City', 'Nankoku', 'Susaki', 'Tosa', 'Muroto'],
  'Saga':       ['Saga City', 'Tosu', 'Karatsu', 'Imari', 'Takeo'],
  'Nagasaki':   ['Nagasaki City', 'Sasebo', 'Isahaya', 'Omura', 'Shimabara'],
  'Oita':       ['Oita City', 'Beppu', 'Nakatsu', 'Usuki', 'Bungo-Ono'],
  'Miyazaki':   ['Miyazaki City', 'Miyakonojo', 'Nobeoka', 'Nichinan', 'Kobayashi'],
  'Kagoshima':  ['Kagoshima City', 'Kirishima', 'Kanoya', 'Satsuma', 'Amami'],
  'Tottori':    ['Tottori City', 'Yonago', 'Kurayoshi', 'Sakaiminato'],
  'Shimane':    ['Matsue', 'Hamada', 'Izumo', 'Masuda', 'Oki'],
  'Toyama':     ['Toyama City', 'Takaoka', 'Uozu', 'Himi', 'Namerikawa'],
  'Wakayama':   ['Wakayama City', 'Kainan', 'Kinokawa', 'Hashimoto', 'Shirahama'],
  'Yamaguchi':  ['Yamaguchi City', 'Shimonoseki', 'Ube', 'Iwakuni', 'Hofu'],
};

export const JP_DISTRICTS: Record<string, string[]> = {
  'Shinjuku':     ['Kabukicho', 'Takadanobaba', 'Okubo', 'Yotsuya', 'Akebonobashi', 'Ichigaya', 'Wakamatsu'],
  'Shibuya':      ['Shibuya', 'Harajuku', 'Ebisu', 'Daikanyama', 'Nakameguro', 'Aoyama', 'Omotesando'],
  'Minato':       ['Roppongi', 'Azabu', 'Akasaka', 'Shibaura', 'Toranomon', 'Shinagawa', 'Shimbashi'],
  'Chiyoda':      ['Marunouchi', 'Akihabara', 'Kudanshita', 'Kanda', 'Hibiya', 'Jimbocho'],
  'Chuo':         ['Ginza', 'Nihonbashi', 'Tsukishima', 'Tsukiji', 'Kayabacho', 'Kyobashi'],
  'Yokohama':     ['Naka', 'Nishi', 'Kanagawa', 'Isogo', 'Kohoku', 'Tsurumi', 'Hodogaya', 'Midori'],
  'Osaka City':   ['Chuo', 'Namba', 'Shinsaibashi', 'Umeda', 'Tennoji', 'Abeno', 'Shinsaibashi'],
  'Kyoto City':   ['Gion', 'Arashiyama', 'Fushimi', 'Kinkakuji', 'Nishiki', 'Kawaramachi', 'Okazaki'],
  'Nagoya':       ['Naka', 'Sakae', 'Atsuta', 'Moriyama', 'Midori', 'Tempaku', 'Chikusa'],
  'Sapporo':      ['Chuo', 'Kita', 'Higashi', 'Shiroishi', 'Toyohira', 'Minami', 'Nishi'],
  'Fukuoka City': ['Hakata', 'Tenjin', 'Nakasu', 'Ohori', 'Nishijin', 'Daimyo', 'Yakuin'],
  'Kobe':         ['Chuo', 'Nada', 'Hyogo', 'Kitano', 'Rokko', 'Suma', 'Tarumi'],
  'Sendai':       ['Aoba', 'Wakabayashi', 'Miyagino', 'Izumi', 'Taihaku'],
  'Hiroshima City':['Naka', 'Minami', 'Nishi', 'Higashi', 'Asaminami', 'Asakita', 'Saeki'],
  'Okinawa City': ['Goya', 'Miyazato', 'Oura', 'Koza', 'Awase', 'Yagibaru'],
  'Naha':         ['Naha City Centre', 'Tomari', 'Omoromachi', 'Asato', 'Makishi'],
};

// Fill remaining cities with default district list
Object.values(JP_CITIES).flat().forEach(city => {
  if (!JP_DISTRICTS[city]) {
    JP_DISTRICTS[city] = [
      `${city} North`, `${city} South`, `${city} East`, `${city} West`, `${city} Central`,
    ];
  }
});
