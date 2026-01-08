var gamesData = {
  "mobile-legends": {
    slug: "mobile-legends",
    title: "Mobile Legends",
    publisher: "Moonton",
    description: "Top up Diamond Mobile Legends cepat, murah, dan aman.",
    image: "https://upload.wikimedia.org/wikipedia/en/c/cf/Mobile_Legends_Bang_Bang_cover_art.jpg",
    zoneRequired: true,
    fields: [
      { id: "user_id", label: "User ID", type: "number", placeholder: "Contoh: 12345678" },
      { id: "zone_id", label: "Zone ID", type: "number", placeholder: "Contoh: 1234" }
    ],
    nominal: [
      { code: "ML-5", label: "5 Diamonds", price: 1500 },
      { code: "ML-14", label: "14 Diamonds", price: 4000 },
      { code: "ML-28", label: "28 Diamonds", price: 8000 },
      { code: "ML-42", label: "42 Diamonds", price: 12000 },
      { code: "ML-86", label: "86 Diamonds", price: 24000 },
      { code: "ML-172", label: "172 Diamonds", price: 48000 },
      { code: "ML-257", label: "257 Diamonds", price: 72000 },
      { code: "ML-344", label: "344 Diamonds", price: 96000 },
      { code: "ML-706", label: "706 Diamonds", price: 192000 },
      { code: "ML-2195", label: "2195 Diamonds", price: 580000 },
      { code: "ML-WP", label: "Weekly Diamond Pass", price: 28000 },
      { code: "ML-SL", label: "Twilight Pass", price: 145000 }
    ]
  },
  "free-fire": {
    slug: "free-fire",
    title: "Free Fire",
    publisher: "Garena",
    description: "Beli Diamond Free Fire murah dan legal.",
    image: "https://upload.wikimedia.org/wikipedia/en/a/a6/Free_Fire_Battlegrounds_box_art.jpg",
    zoneRequired: false,
    fields: [
      { id: "user_id", label: "Player ID", type: "number", placeholder: "Contoh: 1234567890" }
    ],
    nominal: [
      { code: "FF-5", label: "5 Diamonds", price: 1000 },
      { code: "FF-12", label: "12 Diamonds", price: 2000 },
      { code: "FF-50", label: "50 Diamonds", price: 8000 },
      { code: "FF-70", label: "70 Diamonds", price: 10000 },
      { code: "FF-140", label: "140 Diamonds", price: 20000 },
      { code: "FF-355", label: "355 Diamonds", price: 50000 },
      { code: "FF-720", label: "720 Diamonds", price: 100000 },
      { code: "FF-1450", label: "1450 Diamonds", price: 200000 }
    ]
  },
  "valorant": {
    slug: "valorant",
    title: "Valorant",
    publisher: "Riot Games",
    description: "Top Up Valorant Points region Indonesia.",
    image: "https://upload.wikimedia.org/wikipedia/en/1/14/Valorant_cover_art.jpg",
    zoneRequired: false,
    fields: [
      { id: "user_id", label: "Riot ID (Username#Tag)", type: "text", placeholder: "Contoh: Jett#IND" }
    ],
    nominal: [
      { code: "VAL-125", label: "125 VP", price: 15000 },
      { code: "VAL-420", label: "420 VP", price: 50000 },
      { code: "VAL-700", label: "700 VP", price: 80000 },
      { code: "VAL-1375", label: "1375 VP", price: 150000 },
      { code: "VAL-2400", label: "2400 VP", price: 250000 },
      { code: "VAL-4000", label: "4000 VP", price: 400000 },
      { code: "VAL-8150", label: "8150 VP", price: 800000 }
    ]
  },
  "fcmobile": {
    slug: "fcmobile",
    title: "EA Sports FC Mobile",
    publisher: "EA Sports",
    description: "Top Up FC Points & Silver murah dan aman.",
    image: "https://upload.wikimedia.org/wikipedia/en/7/77/EA_Sports_FC_24_cover.jpg",
    zoneRequired: false,
    fields: [
      { id: "user_id", label: "UID", type: "text", placeholder: "Contoh: 1234567890123" }
    ],
    nominal: [
      { code: "FC-31", label: "31 FC Points", price: 5000 },
      { code: "FC-63", label: "63 FC Points", price: 10000 },
      { code: "FC-128", label: "128 FC Points", price: 20000 },
      { code: "FC-320", label: "320 FC Points", price: 50000 },
      { code: "FC-645", label: "645 FC Points", price: 100000 },
      { code: "FC-1310", label: "1310 FC Points", price: 200000 }
    ]
  },
  "genshin": {
    slug: "genshin",
    title: "Genshin Impact",
    publisher: "HoYoverse",
    description: "Top Up Genesis Crystals Genshin Impact.",
    image: "https://upload.wikimedia.org/wikipedia/en/5/5d/Genshin_Impact_cover.jpg",
    zoneRequired: true,
    fields: [
      { id: "user_id", label: "UID", type: "number", placeholder: "Contoh: 800000000" },
      { id: "zone_id", label: "Server", type: "select", options: ["Asia", "America", "Europe", "TW, HK, MO"], placeholder: "Pilih Server" }
    ],
    nominal: [
      { code: "GI-60", label: "60 Genesis Crystals", price: 15000 },
      { code: "GI-300", label: "300+30 Genesis Crystals", price: 75000 },
      { code: "GI-980", label: "980+110 Genesis Crystals", price: 250000 },
      { code: "GI-1980", label: "1980+260 Genesis Crystals", price: 500000 },
      { code: "GI-3280", label: "3280+600 Genesis Crystals", price: 800000 },
      { code: "GI-6480", label: "6480+1600 Genesis Crystals", price: 1600000 },
      { code: "GI-WELKIN", label: "Blessing of the Welkin Moon", price: 75000 }
    ]
  },
  "pubgm": {
    slug: "pubgm",
    title: "PUBG Mobile",
    publisher: "Tencent",
    description: "Top Up UC PUBG Mobile Global.",
    image: "https://upload.wikimedia.org/wikipedia/en/a/a2/PlayerUnknown%27s_Battlegrounds_Mobile_cover_art.jpg",
    zoneRequired: false,
    fields: [
      { id: "user_id", label: "Player ID", type: "number", placeholder: "Contoh: 5123456789" }
    ],
    nominal: [
      { code: "PUBG-60", label: "60 UC", price: 14000 },
      { code: "PUBG-325", label: "300+25 UC", price: 70000 },
      { code: "PUBG-660", label: "600+60 UC", price: 140000 },
      { code: "PUBG-1800", label: "1500+300 UC", price: 350000 },
      { code: "PUBG-3850", label: "3000+850 UC", price: 700000 },
      { code: "PUBG-8100", label: "6000+2100 UC", price: 1400000 }
    ]
  }
};
