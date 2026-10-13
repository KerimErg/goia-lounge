/**
 * Données de démonstration GOIA Lounge.
 *   npm run db:seed
 * ⚠️ EFFACE les données existantes. Refuse de tourner sur une base distante
 * (Neon/Supabase…) sauf si SEED_ALLOW_RESET=yes est défini explicitement.
 * Aucun avis client n'est inventé : la table Review reste vide.
 */
import { PrismaClient, type MenuSection, type Occasion, type ReservationStatus, type TableShape } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { addDays, kehlToUtc, nowInKehl, toMinutes, fromMinutes, weekdayOf } from "../src/lib/time";

const prisma = new PrismaClient();

type L = { fr: string; de: string; en: string };
const l = (fr: string, de: string, en: string): L => ({ fr, de, en });

/* ---------- Garde-fou production ---------- */
function assertSafeToReset() {
  const url = process.env.DATABASE_URL ?? "";
  const local = /@(localhost|127\.0\.0\.1|postgres)(:|\/)/.test(url);
  if ((!local || process.env.VERCEL_ENV === "production") && process.env.SEED_ALLOW_RESET !== "yes") {
    console.error("✋ Base distante détectée : le seed EFFACE toutes les données.\n   Relancez avec SEED_ALLOW_RESET=yes si c'est bien voulu (base vide de démonstration).");
    process.exit(1);
  }
}

/* ---------- Générateur pseudo-aléatoire reproductible ---------- */
let seed = 20261016;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: readonly T[]) => a[Math.floor(rand() * a.length)];

/* ---------- Horaires (provisoires : à remplacer par les vrais dans l'admin) ---------- */
const HOURS: Record<number, [string, string]> = {
  1: ["17:00", "01:00"], 2: ["17:00", "01:00"], 3: ["17:00", "01:00"], 4: ["17:00", "01:00"],
  5: ["17:00", "03:00"], 6: ["17:00", "03:00"], 0: ["15:00", "01:00"],
};

/* ---------- Salle : 3 zones, 18 tables ---------- */
const ZONES = [
  { slug: "lounge", order: 1, outdoor: false, name: l("Lounge", "Lounge", "Lounge"),
    description: l("Canapés profonds, lumière tamisée, au cœur de l'ambiance.", "Tiefe Sofas, gedämpftes Licht, mitten im Geschehen.", "Deep sofas, dimmed lights, right in the heart of the atmosphere.") },
  { slug: "vip", order: 2, outdoor: false, name: l("Carré VIP", "VIP-Bereich", "VIP area"),
    description: l("Espaces privatifs pour les groupes, service dédié.", "Private Nischen für Gruppen, eigener Service.", "Private booths for groups, dedicated service.") },
  { slug: "terrasse", order: 3, outdoor: true, name: l("Terrasse", "Terrasse", "Terrace"),
    description: l("Chauffée en saison froide, ouverte selon la météo.", "Im Winter beheizt, je nach Wetter geöffnet.", "Heated in the cold season, open depending on the weather.") },
] as const;

type T = { zone: string; label: string; min: number; max: number; shape: TableShape; x: number; y: number; w: number; h: number; rotation?: number };
const TABLES: T[] = [
  // Lounge (8)
  { zone: "lounge", label: "L1", min: 1, max: 2, shape: "ROUND", x: 80, y: 90, w: 90, h: 90 },
  { zone: "lounge", label: "L2", min: 1, max: 2, shape: "ROUND", x: 230, y: 90, w: 90, h: 90 },
  { zone: "lounge", label: "L3", min: 2, max: 4, shape: "SQUARE", x: 400, y: 80, w: 120, h: 120 },
  { zone: "lounge", label: "L4", min: 2, max: 4, shape: "SQUARE", x: 580, y: 80, w: 120, h: 120 },
  { zone: "lounge", label: "L5", min: 2, max: 4, shape: "SQUARE", x: 760, y: 80, w: 120, h: 120 },
  { zone: "lounge", label: "L6", min: 4, max: 6, shape: "BOOTH", x: 80, y: 330, w: 220, h: 130 },
  { zone: "lounge", label: "L7", min: 4, max: 6, shape: "BOOTH", x: 390, y: 330, w: 220, h: 130 },
  { zone: "lounge", label: "L8", min: 3, max: 6, shape: "RECT", x: 700, y: 330, w: 200, h: 120 },
  // VIP (4)
  { zone: "vip", label: "V1", min: 4, max: 8, shape: "BOOTH", x: 90, y: 100, w: 300, h: 180 },
  { zone: "vip", label: "V2", min: 4, max: 8, shape: "BOOTH", x: 560, y: 100, w: 300, h: 180 },
  { zone: "vip", label: "V3", min: 6, max: 10, shape: "BOOTH", x: 90, y: 400, w: 360, h: 200 },
  { zone: "vip", label: "V4", min: 2, max: 4, shape: "ROUND", x: 640, y: 440, w: 140, h: 140 },
  // Terrasse (6)
  { zone: "terrasse", label: "T1", min: 1, max: 2, shape: "ROUND", x: 80, y: 120, w: 90, h: 90 },
  { zone: "terrasse", label: "T2", min: 1, max: 2, shape: "ROUND", x: 240, y: 120, w: 90, h: 90 },
  { zone: "terrasse", label: "T3", min: 2, max: 4, shape: "SQUARE", x: 420, y: 110, w: 120, h: 120 },
  { zone: "terrasse", label: "T4", min: 2, max: 4, shape: "SQUARE", x: 620, y: 110, w: 120, h: 120 },
  { zone: "terrasse", label: "T5", min: 4, max: 6, shape: "RECT", x: 120, y: 380, w: 220, h: 120 },
  { zone: "terrasse", label: "T6", min: 4, max: 8, shape: "RECT", x: 480, y: 380, w: 280, h: 130 },
];

/* ---------- Carte : 25 chichas, 20 boissons (FR / DE / EN) ---------- */
type Item = { name: L; desc?: L; price: number; tags?: string[]; preorderable?: boolean };
type Cat = { slug: string; section: MenuSection; name: L; description?: L; items: Item[] };

const MENU: Cat[] = [
  { slug: "classiques", section: "SHISHA", name: l("Classiques", "Klassiker", "Classics"), items: [
    { name: l("Double Pomme", "Doppelapfel", "Double Apple"), desc: l("L'incontournable, anisé et doux", "Der Klassiker, mild mit Anisnote", "The classic, smooth with a hint of anise"), price: 1700, tags: ["popular"], preorderable: true },
    { name: l("Raisin", "Traube", "Grape"), price: 1700, preorderable: true },
    { name: l("Pastèque", "Wassermelone", "Watermelon"), price: 1700, preorderable: true },
    { name: l("Pêche", "Pfirsich", "Peach"), price: 1700, preorderable: true },
    { name: l("Citron", "Zitrone", "Lemon"), price: 1700, preorderable: true },
  ] },
  { slug: "fruitees", section: "SHISHA", name: l("Fruitées", "Fruchtig", "Fruity"), items: [
    { name: l("Mangue Passion", "Mango Maracuja", "Mango Passion"), desc: l("Mangue mûre, fruit de la passion", "Reife Mango, Maracuja", "Ripe mango, passion fruit"), price: 1800, preorderable: true },
    { name: l("Fruits rouges", "Rote Beeren", "Red berries"), price: 1800, preorderable: true },
    { name: l("Ananas Coco", "Ananas Kokos", "Pineapple Coconut"), price: 1800, preorderable: true },
    { name: l("Kiwi Fraise", "Kiwi Erdbeere", "Kiwi Strawberry"), price: 1800, preorderable: true },
    { name: l("Melon blanc", "Honigmelone", "Honeydew melon"), price: 1800, preorderable: true },
    { name: l("Litchi Rose", "Litschi Rose", "Lychee Rose"), desc: l("Floral et délicat", "Blumig und fein", "Floral and delicate"), price: 1800, tags: ["new"], preorderable: true },
  ] },
  { slug: "menthe", section: "SHISHA", name: l("Menthe & fraîcheur", "Minze & Frische", "Mint & fresh"), items: [
    { name: l("Menthe glaciale", "Eisminze", "Ice mint"), desc: l("Fraîcheur intense", "Intensive Frische", "Intense freshness"), price: 1700, preorderable: true },
    { name: l("Raisin Menthe", "Traube Minze", "Grape Mint"), price: 1700, tags: ["popular"], preorderable: true },
    { name: l("Citron Menthe", "Zitrone Minze", "Lemon Mint"), price: 1700, preorderable: true },
    { name: l("Pastèque Menthe", "Wassermelone Minze", "Watermelon Mint"), price: 1700, preorderable: true },
  ] },
  { slug: "signatures", section: "SHISHA", name: l("Signatures GOIA", "GOIA Signatures", "GOIA signatures"),
    description: l("Nos créations maison, servies sur tête premium.", "Unsere Hauskreationen auf Premium-Kopf.", "Our house creations, served on a premium bowl."), items: [
    { name: l("GOIA Gold", "GOIA Gold", "GOIA Gold"), desc: l("Mangue, vanille, menthe glaciale", "Mango, Vanille, Eisminze", "Mango, vanilla, ice mint"), price: 2300, tags: ["signature"], preorderable: true },
    { name: l("Nuit de Kehl", "Kehler Nacht", "Kehl Night"), desc: l("Fruits rouges, citron vert, menthe", "Rote Beeren, Limette, Minze", "Red berries, lime, mint"), price: 2300, tags: ["signature"], preorderable: true },
    { name: l("Rhin doré", "Goldener Rhein", "Golden Rhine"), desc: l("Pêche blanche, thé glacé, fleur d'oranger", "Weißer Pfirsich, Eistee, Orangenblüte", "White peach, iced tea, orange blossom"), price: 2300, tags: ["signature"], preorderable: true },
    { name: l("Velours bordeaux", "Bordeaux-Samt", "Burgundy velvet"), desc: l("Cerise noire, cassis, pointe de cannelle", "Schwarzkirsche, Cassis, Hauch Zimt", "Black cherry, blackcurrant, a touch of cinnamon"), price: 2300, tags: ["signature", "new"], preorderable: true },
    { name: l("Émeraude", "Smaragd", "Emerald"), desc: l("Pomme verte, kiwi, menthe poivrée", "Grüner Apfel, Kiwi, Pfefferminze", "Green apple, kiwi, peppermint"), price: 2300, tags: ["signature"], preorderable: true },
  ] },
  { slug: "premium", section: "SHISHA", name: l("Premium", "Premium", "Premium"),
    description: l("Tabacs haut de gamme, préparation soignée.", "Hochwertige Tabake, sorgfältig zubereitet.", "High-end tobaccos, carefully prepared."), items: [
    { name: l("Tête fruit ananas", "Ananaskopf", "Pineapple bowl"), desc: l("Servie dans un ananas frais, parfum au choix", "Im frischen Ananaskopf, Sorte nach Wahl", "Served in a fresh pineapple, flavour of your choice"), price: 3200, tags: ["premium"], preorderable: true },
    { name: l("Tête fruit melon", "Melonenkopf", "Melon bowl"), desc: l("Servie dans un melon (selon saison)", "Im Melonenkopf (saisonal)", "Served in a melon (seasonal)"), price: 3200, tags: ["premium"], preorderable: true },
    { name: l("Blend du chef", "Blend des Hauses", "Head shisha master's blend"), desc: l("Mélange préparé à la table selon vos goûts", "Am Tisch nach deinem Geschmack gemischt", "Mixed at your table to your taste"), price: 2600, tags: ["premium"], preorderable: true },
    { name: l("Dark leaf", "Dark Leaf", "Dark leaf"), desc: l("Tabac foncé, pour amateurs", "Dunkler Tabak, für Kenner", "Dark-leaf tobacco, for connoisseurs"), price: 2600, tags: ["premium"], preorderable: true },
    { name: l("Ice Blueberry", "Ice Blueberry", "Ice Blueberry"), price: 2600, tags: ["premium"], preorderable: true },
  ] },

  // Boissons
  { slug: "softs", section: "DRINK", name: l("Softs", "Softdrinks", "Soft drinks"), items: [
    { name: l("Cola (33 cl)", "Cola (0,33 l)", "Cola (33 cl)"), price: 400 },
    { name: l("Cola zéro (33 cl)", "Cola Zero (0,33 l)", "Zero cola (33 cl)"), price: 400 },
    { name: l("Ginger beer", "Ginger Beer", "Ginger beer"), price: 450 },
    { name: l("Eau plate (50 cl)", "Stilles Wasser (0,5 l)", "Still water (50 cl)"), price: 350 },
    { name: l("Eau pétillante (50 cl)", "Sprudelwasser (0,5 l)", "Sparkling water (50 cl)"), price: 350 },
  ] },
  { slug: "mocktails", section: "DRINK", name: l("Mocktails", "Mocktails", "Mocktails"),
    description: l("Cocktails sans alcool préparés au bar.", "Alkoholfreie Cocktails von der Bar.", "Alcohol-free cocktails made at the bar."), items: [
    { name: l("Virgin Mojito", "Virgin Mojito", "Virgin Mojito"), desc: l("Citron vert, menthe fraîche, sucre de canne", "Limette, frische Minze, Rohrzucker", "Lime, fresh mint, cane sugar"), price: 850, tags: ["popular"] },
    { name: l("Passion Sunset", "Passion Sunset", "Passion Sunset"), desc: l("Fruit de la passion, orange, grenadine", "Maracuja, Orange, Grenadine", "Passion fruit, orange, grenadine"), price: 850 },
    { name: l("GOIA Breeze", "GOIA Breeze", "GOIA Breeze"), desc: l("Mangue, ananas, coco, citron vert", "Mango, Ananas, Kokos, Limette", "Mango, pineapple, coconut, lime"), price: 900, tags: ["signature"] },
    { name: l("Berry Fizz", "Berry Fizz", "Berry Fizz"), desc: l("Fruits rouges, basilic, tonic", "Rote Beeren, Basilikum, Tonic", "Red berries, basil, tonic"), price: 850 },
    { name: l("Pink Lemonade", "Pink Lemonade", "Pink Lemonade"), desc: l("Citron, framboise, eau pétillante", "Zitrone, Himbeere, Sprudel", "Lemon, raspberry, sparkling water"), price: 750 },
  ] },
  { slug: "thes", section: "DRINK", name: l("Thés", "Tee", "Tea"), items: [
    { name: l("Thé à la menthe (verre)", "Minztee (Glas)", "Mint tea (glass)"), desc: l("Menthe fraîche, à la marocaine", "Frische Minze, marokkanisch", "Fresh mint, Moroccan style"), price: 400 },
    { name: l("Théière menthe (2–3 pers.)", "Kanne Minztee (2–3 Pers.)", "Mint tea pot (2–3 people)"), price: 1000, tags: ["popular"] },
    { name: l("Thé noir", "Schwarzer Tee", "Black tea"), price: 350 },
    { name: l("Thé vert jasmin", "Grüner Jasmintee", "Jasmine green tea"), price: 350 },
  ] },
  { slug: "cafes", section: "DRINK", name: l("Cafés", "Kaffee", "Coffee"), items: [
    { name: l("Espresso", "Espresso", "Espresso"), price: 280 },
    { name: l("Cappuccino", "Cappuccino", "Cappuccino"), price: 400 },
    { name: l("Café turc", "Türkischer Mokka", "Turkish coffee"), price: 380 },
  ] },
  { slug: "jus", section: "DRINK", name: l("Jus frais", "Frische Säfte", "Fresh juices"), items: [
    { name: l("Orange pressée", "Frisch gepresster O-Saft", "Fresh orange juice"), price: 650 },
    { name: l("Citronnade gingembre", "Ingwer-Zitronade", "Ginger lemonade"), price: 600 },
    { name: l("Pomme Kiwi", "Apfel Kiwi", "Apple Kiwi"), price: 650 },
  ] },
  // Douceurs
  { slug: "desserts", section: "FOOD", name: l("Douceurs", "Süßes", "Sweets"), items: [
    { name: l("Cheesecake spéculoos", "Spekulatius-Cheesecake", "Speculoos cheesecake"), desc: l("Fait maison, base biscuitée croustillante", "Hausgemacht, knuspriger Keksboden", "Homemade, crunchy biscuit base"), price: 750, tags: ["signature"] },
    { name: l("Cheesecake fruits rouges", "Beeren-Cheesecake", "Red berry cheesecake"), price: 750 },
    { name: l("Assiette de fruits frais", "Frischer Obstteller", "Fresh fruit platter"), desc: l("À partager, selon la saison", "Zum Teilen, je nach Saison", "To share, seasonal"), price: 1400 },
  ] },
];

const EXTRAS: { section: MenuSection; name: L; price: number }[] = [
  { section: "SHISHA", name: l("Tête fruit (ananas ou melon)", "Fruchtkopf (Ananas oder Melone)", "Fruit bowl (pineapple or melon)"), price: 1000 },
  { section: "SHISHA", name: l("Tête premium", "Premium-Kopf", "Premium bowl"), price: 400 },
  { section: "SHISHA", name: l("Changement de parfum", "Sortenwechsel", "Flavour change"), price: 600 },
  { section: "SHISHA", name: l("Embout personnel", "Eigenes Mundstück", "Personal mouthpiece"), price: 100 },
];

/* ---------- Clients de démonstration (adresses en .example) ---------- */
const FIRST = ["Léa", "Thomas", "Sarah", "Yanis", "Jonas", "Inès", "Mehdi", "Laura", "Lukas", "Amina", "Hugo", "Sofia", "Nils", "Camille", "Emre", "Julia", "Rayan", "Clara", "Noah", "Lina", "Adam", "Mia"];
const LAST = ["Martin", "Schmidt", "Bernard", "Weber", "Haddad", "Müller", "Laurent", "Yilmaz", "Fischer", "Benali", "Roux", "Wagner"];

async function main() {
  assertSafeToReset();
  console.log("→ Nettoyage…");
  await prisma.$transaction([
    prisma.reservationTable.deleteMany(), prisma.reservation.deleteMany(), prisma.customer.deleteMany(),
    prisma.tableBlock.deleteMany(), prisma.table.deleteMany(), prisma.zone.deleteMany(),
    prisma.menuItem.deleteMany(), prisma.menuCategory.deleteMany(), prisma.menuExtra.deleteMany(),
    prisma.event.deleteMany(), prisma.galleryImage.deleteMany(), prisma.review.deleteMany(),
    prisma.privatizationRequest.deleteMany(), prisma.contactMessage.deleteMany(), prisma.rateEvent.deleteMany(),
    prisma.specialDay.deleteMany(), prisma.openingHours.deleteMany(), prisma.settings.deleteMany(), prisma.user.deleteMany(),
  ]);

  /* Réglages — coordonnées PROVISOIRES à compléter dans l'admin */
  await prisma.settings.create({
    data: {
      id: 1, venueName: "GOIA Lounge", street: "Bahnhofstraße 6", postalCode: "77694", city: "Kehl",
      latitude: 48.5717, longitude: 7.8113,
      phone: "+49 0000 000000", whatsapp: "490000000000", email: "kontakt@example.com",
      instagramUrl: "https://www.instagram.com/goia.kehl/",
    },
  });
  await prisma.openingHours.createMany({
    data: Object.entries(HOURS).map(([d, [opensAt, closesAt]]) => ({ weekday: Number(d), opensAt, closesAt })),
  });

  /* Compte admin */
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@goia.test").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  await prisma.user.create({ data: { email, name: "Admin GOIA", role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) } });

  /* Salle */
  const zoneIds: Record<string, string> = {};
  for (const z of ZONES) zoneIds[z.slug] = (await prisma.zone.create({ data: { ...z, name: z.name, description: z.description } })).id;
  const tables = [];
  for (const [i, t] of TABLES.entries()) {
    tables.push(await prisma.table.create({
      data: { zoneId: zoneIds[t.zone], label: t.label, minCovers: t.min, maxCovers: t.max, shape: t.shape,
        x: t.x, y: t.y, width: t.w, height: t.h, rotation: t.rotation ?? 0, order: i },
    }));
  }

  /* Carte */
  let itemCount = 0;
  for (const [ci, c] of MENU.entries()) {
    await prisma.menuCategory.create({
      data: {
        slug: c.slug, section: c.section, name: c.name, description: c.description, order: ci,
        items: { create: c.items.map((it, ii) => ({ name: it.name, description: it.desc, priceCents: it.price, tags: it.tags ?? [], preorderable: !!it.preorderable, order: ii })) },
      },
    });
    itemCount += c.items.length;
  }
  await prisma.menuExtra.createMany({ data: EXTRAS.map((e, i) => ({ section: e.section, name: e.name, priceCents: e.price, order: i })) });

  /* Galerie : photos fournies par le GOIA (à remplacer par les originaux haute définition) */
  const g = (file: string, alt: L, order: number, width = 447, height = 447) => ({ url: `/images/goia/${file}`, alt, width, height, order });
  await prisma.galleryImage.createMany({
    data: [
      g("chicha-fumee-ambiance.jpg", l("Chicha et volutes de fumée dans la lumière tamisée du GOIA", "Shisha und Rauchschwaden im gedämpften Licht des GOIA", "Shisha and swirling smoke in GOIA's soft light"), 0),
      g("table-desserts-cocktails.jpg", l("Table dressée avec desserts et cocktails sans alcool", "Gedeckter Tisch mit Desserts und alkoholfreien Cocktails", "Table set with desserts and alcohol-free cocktails"), 1),
      g("cheesecake-speculoos.jpg", l("Cheesecake spéculoos maison", "Hausgemachter Spekulatius-Cheesecake", "Homemade speculoos cheesecake"), 2, 387, 516),
      g("chicha-cocktail-dessert.jpg", l("Chicha, cocktail et cheesecake sur table en marbre", "Shisha, Cocktail und Cheesecake auf Marmortisch", "Shisha, cocktail and cheesecake on a marble table"), 3),
    ],
  });

  /* Événements d'exemple (3 prochaines semaines) — NON publiés : à valider ou remplacer dans l'admin */
  const today = nowInKehl().ymd;
  const nextWeekday = (from: string, wd: number) => { let d = addDays(from, 1); while (weekdayOf(d) !== wd) d = addDays(d, 1); return d; };
  const fri = nextWeekday(today, 5);
  const wed = nextWeekday(today, 3);
  const sat2 = addDays(nextWeekday(today, 6), 7);
  await prisma.event.createMany({
    data: [
      { slug: "goia-nights-dj", type: "DJ", published: false, startsAt: kehlToUtc(fri, "21:00"),
        title: l("GOIA Nights — DJ set", "GOIA Nights — DJ-Set", "GOIA Nights — DJ set"),
        description: l("Deep house et sonorités orientales jusqu'à la fermeture. Réservation conseillée.", "Deep House und orientalische Klänge bis zum Schluss. Reservierung empfohlen.", "Deep house and oriental sounds until closing. Booking recommended.") },
      { slug: "soiree-match", type: "SPORT", published: false, startsAt: kehlToUtc(wed, "20:45"),
        title: l("Soirée match sur grand écran", "Fußballabend auf Großbildleinwand", "Match night on the big screen"),
        description: l("Les grands matchs européens en direct, ambiance lounge.", "Die großen europäischen Spiele live, Lounge-Atmosphäre.", "The big European games live, in a lounge atmosphere.") },
      { slug: "nuit-orientale", type: "THEME", published: false, startsAt: kehlToUtc(sat2, "21:30"),
        title: l("Nuit orientale", "Orientalische Nacht", "Oriental night"),
        description: l("Percussions live et chichas signature à l'honneur.", "Live-Percussion und Signature-Shishas im Mittelpunkt.", "Live percussion and our signature shishas in the spotlight.") },
    ],
  });

  /* Clients */
  const customers = [];
  for (let i = 0; i < 22; i++) {
    const firstName = FIRST[i % FIRST.length];
    const lastName = pick(LAST);
    customers.push(await prisma.customer.create({
      data: {
        firstName, lastName,
        email: `${firstName.normalize("NFD").replace(/[^\w]/g, "").toLowerCase()}.${lastName.normalize("NFD").replace(/[^\w]/g, "").toLowerCase()}${i}@example.com`,
        phone: `+49 151 ${String(1000000 + i * 7919).slice(0, 7)}`,
        locale: pick(["fr", "fr", "de", "de", "en"]), vip: i % 9 === 0,
      },
    }));
  }

  /* 30 réservations sur les 3 prochaines semaines, sans chevauchement (vérifié par la base) */
  const settings = { slot: 30, duration: 150, lastSeatingBeforeClose: 60 };
  const busy: Record<string, { start: number; end: number }[]> = {};
  const overlaps = (tableId: string, s: number, e: number) => (busy[tableId] ?? []).some((b) => s < b.end && b.start < e);
  const statuses: ReservationStatus[] = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "CANCELLED"];
  const occasions: Occasion[] = ["NONE", "NONE", "FRIENDS", "BIRTHDAY", "DATE", "NONE", "BUSINESS"];
  const preorderable = await prisma.menuItem.findMany({ where: { preorderable: true }, select: { id: true } });
  let created = 0;
  let attempts = 0;
  while (created < 30 && attempts++ < 500) {
    const day = addDays(today, 1 + Math.floor(rand() * 21));
    const [opensAt, closesAt] = HOURS[weekdayOf(day)];
    const open = toMinutes(opensAt);
    let close = toMinutes(closesAt);
    if (close <= open) close += 1440;
    const slots = [];
    for (let m = open; m <= close - settings.lastSeatingBeforeClose; m += settings.slot) slots.push(m);
    const m = pick(slots);
    const time = fromMinutes(m);
    const startDay = m >= 1440 ? addDays(day, 1) : day; // créneau après minuit
    const startAt = kehlToUtc(startDay, time);
    const endAt = new Date(startAt.getTime() + settings.duration * 60000);
    const party = pick([2, 2, 2, 3, 4, 4, 5, 6, 8]);
    const candidates = tables.filter((t) => t.minCovers <= party && party <= t.maxCovers)
      .sort((a, b) => a.maxCovers - b.maxCovers);
    const table = candidates.find((t) => !overlaps(t.id, startAt.getTime(), endAt.getTime()));
    if (!table) continue;
    const status = pick(statuses);
    if (status !== "CANCELLED") (busy[table.id] ??= []).push({ start: startAt.getTime(), end: endAt.getTime() });
    const customer = pick(customers);
    const occasion = pick(occasions);
    await prisma.reservation.create({
      data: {
        reference: `GO-${randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`,
        status, source: pick(["WEBSITE", "WEBSITE", "WEBSITE", "PHONE"] as const),
        customerId: customer.id, startAt, endAt, partySize: party, preferredZoneId: table.zoneId,
        occasion, specialRequest: occasion === "BIRTHDAY" ? "Bougie sur le dessert si possible 🎂" : null,
        preorder: rand() < 0.3 ? [{ menuItemId: pick(preorderable).id, quantity: 1 }] : undefined,
        locale: customer.locale, adultConfirmed: true, privacyAcceptedAt: new Date(),
        cancelledBy: status === "CANCELLED" ? "client" : null,
        tables: { create: [{ tableId: table.id, startAt, endAt }] },
      },
    });
    created++;
  }

  console.log(`✓ ${ZONES.length} zones, ${tables.length} tables, ${itemCount} produits (${MENU.filter((c) => c.section === "SHISHA").reduce((n, c) => n + c.items.length, 0)} chichas), ${EXTRAS.length} suppléments, 3 événements, ${customers.length} clients, ${created} réservations`);
  console.log(`✓ Compte admin : ${email} / ${process.env.SEED_ADMIN_PASSWORD ? "(mot de passe SEED_ADMIN_PASSWORD)" : password}`);
  console.log("  Aucun avis n'a été créé : ajoutez de vrais avis depuis l'admin.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
