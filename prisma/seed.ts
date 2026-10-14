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

/* ---------- Salle : intérieur + terrasse, 30 tables (à ajuster dans l'admin) ---------- */
const ZONES = [
  { slug: "interieur", order: 1, outdoor: false, name: l("Intérieur", "Innenbereich", "Indoor"),
    description: l("Au cœur du lounge.", "Mitten in der Lounge.", "Inside the lounge.") },
  { slug: "terrasse", order: 2, outdoor: true, name: l("Terrasse", "Terrasse", "Terrace"),
    description: l("En plein air, selon la météo.", "Draußen, je nach Wetter.", "Outdoors, weather permitting.") },
] as const;

type T = { zone: string; label: string; min: number; max: number; shape: TableShape; x: number; y: number; w: number; h: number; rotation?: number };
/** Génère une rangée de tables identiques sur le plan (coordonnées sur 1000 × 700). */
const row = (zone: string, prefix: string, start: number, count: number, size: [number, number], shape: TableShape, y: number): T[] =>
  Array.from({ length: count }, (_, i) => ({
    zone, label: `${prefix}${start + i}`, min: size[0], max: size[1], shape,
    x: 60 + i * (880 / Math.max(count, 1)), y, w: size[1] >= 8 ? 150 : size[1] >= 4 ? 110 : 80, h: size[1] >= 8 ? 90 : 80,
  }));
const TABLES: T[] = [
  // Intérieur : 20 tables (12 de 2, 5 de 4, 3 de 8)
  ...row("interieur", "I", 1, 6, [1, 2], "ROUND", 60),
  ...row("interieur", "I", 7, 6, [1, 2], "ROUND", 200),
  ...row("interieur", "I", 13, 5, [2, 4], "SQUARE", 360),
  ...row("interieur", "I", 18, 3, [4, 8], "BOOTH", 540),
  // Terrasse : 10 tables (6 de 2, 3 de 4, 1 de 8)
  ...row("terrasse", "T", 1, 6, [1, 2], "ROUND", 100),
  ...row("terrasse", "T", 7, 3, [2, 4], "SQUARE", 320),
  ...row("terrasse", "T", 10, 1, [4, 8], "RECT", 520),
];

/* ---------- Carte : 25 chichas, 20 boissons (FR / DE / EN) ---------- */
type Item = { name: L; desc?: L; price: number | null; tags?: string[]; preorderable?: boolean; image?: string; subtitle?: L; ingredients?: L };
type Cat = { slug: string; section: MenuSection; name: L; description?: L; items: Item[] };

// Carte officielle du GOIA : à remplir uniquement avec les produits, prix et photos réels
// (aucun produit inventé). Format : { slug, section, name: l(fr, de, en), items: [{ name, desc?, price (centimes), image? }] }
const ALL_FLAVOURS = l("Disponible avec tous nos goûts.", "Mit allen unseren Sorten erhältlich.", "Available in all our flavours.");
const M = (f: string) => `/images/menu/${f}.jpg`;
const MENU: Cat[] = [
  { slug: "chichas", section: "SHISHA", name: l("Chichas", "Shishas", "Shishas"), items: [
    { name: l("Chicha Classique", "Chicha Classique", "Chicha Classique"), price: 1500, tags: ["classique"], image: M("chicha-classique"), subtitle: ALL_FLAVOURS, preorderable: true,
      desc: l("Chicha traditionnelle avec tous les parfums disponibles.", "Traditionelle Shisha mit allen verfügbaren Sorten.", "Traditional shisha with all available flavours.") },
    { name: l("Quasar", "Quasar", "Quasar"), price: 2000, tags: ["premium"], image: M("quasar"), subtitle: ALL_FLAVOURS, preorderable: true,
      desc: l("Système de chauffe premium Quasar avec tous les parfums disponibles.", "Premium-Heizsystem Quasar mit allen verfügbaren Sorten.", "Premium Quasar heat management system with all available flavours.") },
    { name: l("Quasar + Tête Quasar", "Quasar + Quasar-Kopf", "Quasar + Quasar bowl"), price: 2500, tags: ["premium"], image: M("quasar-tete-quasar"), subtitle: ALL_FLAVOURS, preorderable: true,
      desc: l("Tête Quasar officielle avec système de chauffe Quasar. Expérience premium, fumée dense et longue durée.", "Original Quasar-Kopf mit Quasar-Heizsystem. Premium-Erlebnis, dichter Rauch und lange Dauer.", "Official Quasar bowl with Quasar heat management. Premium experience, dense smoke and long-lasting.") },
  ] },
  { slug: "cocktails", section: "DRINK", name: l("Cocktails", "Cocktails", "Cocktails"), items: [
    // Prix non visible sur les captures : laissé vide (à compléter dans l'admin)
    { name: l("Rubis des Îles", "Rubis des Îles", "Rubis des Îles"), price: null, tags: ["bestseller"], image: M("rubis-des-iles"),
      desc: l("Un cocktail rubis aux accents des îles, bissap, rhum blanc et fraîcheur citronnée.", "Ein rubinroter Cocktail mit Inselflair: Bissap, weißer Rum und zitronige Frische.", "A ruby cocktail with island accents: bissap, white rum and citrus freshness."),
      ingredients: l("Rhum blanc, bissap, jus de citron vert, sirop de sucre de canne et eau pétillante.", "Weißer Rum, Bissap, Limettensaft, Rohrzuckersirup und Sprudelwasser.", "White rum, bissap, lime juice, cane sugar syrup and sparkling water.") },
    { name: l("Mojito Framboise", "Mojito Framboise", "Mojito Framboise"), price: 1000, image: M("mojito-framboise") },
    { name: l("Tiki Mangue", "Tiki Mangue", "Tiki Mangue"), price: 1000, image: M("tiki-mangue"),
      desc: l("Un cocktail tiki solaire au rhum, mangue, coco et ananas.", "Ein sonniger Tiki-Cocktail mit Rum, Mango, Kokos und Ananas.", "A sunny tiki cocktail with rum, mango, coconut and pineapple."),
      ingredients: l("Rhum, purée de coco, purée de mangue, jus d'ananas et citron vert.", "Rum, Kokospüree, Mangopüree, Ananassaft und Limette.", "Rum, coconut purée, mango purée, pineapple juice and lime.") },
    { name: l("Mojito Passion", "Mojito Passion", "Mojito Passion"), price: null, image: M("mojito-passion"),
      desc: l("Un mojito passion vibrant, frais et acidulé.", "Ein lebendiger Maracuja-Mojito, frisch und spritzig.", "A vibrant passion fruit mojito, fresh and tangy."),
      ingredients: l("Menthe fraîche, citron vert, sucre de canne, rhum Havana, eau pétillante et purée de fruit de la passion.", "Frische Minze, Limette, Rohrzucker, Havana-Rum, Sprudelwasser und Maracujapüree.", "Fresh mint, lime, cane sugar, Havana rum, sparkling water and passion fruit purée.") },
    { name: l("Mojito Classic", "Mojito Classic", "Mojito Classic"), price: 1000, image: M("mojito-classic"),
      desc: l("Un grand classique frais aux notes de menthe, citron vert et rhum Havana.", "Ein frischer Klassiker mit Minze, Limette und Havana-Rum.", "A fresh classic with notes of mint, lime and Havana rum.") },
    { name: l("Gin Berry", "Gin Berry", "Gin Berry"), price: null, image: M("gin-berry"),
      desc: l("Un gin fruité aux fraises fraîches, menthe, citron et finale pétillante.", "Ein fruchtiger Gin mit frischen Erdbeeren, Minze, Zitrone und spritzigem Abgang.", "A fruity gin with fresh strawberries, mint, lemon and a sparkling finish."),
      ingredients: l("Gin, fraises fraîches, menthe, citron et Sprite/Schweppes.", "Gin, frische Erdbeeren, Minze, Zitrone und Sprite/Schweppes.", "Gin, fresh strawberries, mint, lemon and Sprite/Schweppes.") },
    { name: l("Pornstar Martini", "Pornstar Martini", "Pornstar Martini"), price: 1000, image: M("pornstar-martini") },
  ] },
  // Desserts (photos fournies par le GOIA) ; prix à compléter dans l'admin
  { slug: "desserts", section: "FOOD", name: l("Desserts", "Desserts", "Desserts"), items: [
    { name: l("Cheesecake spéculoos", "Spekulatius-Cheesecake", "Speculoos cheesecake"), price: null, image: M("cheesecake-speculoos") },
    { name: l("Cheesecake pistache", "Pistazien-Cheesecake", "Pistachio cheesecake"), price: null, image: M("cheesecake-pistache") },
    { name: l("Cheesecake fruits rouges", "Beeren-Cheesecake", "Red berry cheesecake"), price: null, image: M("cheesecake-fruits-rouges") },
    { name: l("Pain perdu", "Pain perdu", "French toast"), price: null, image: M("pain-perdu") },
    { name: l("Fondant au chocolat", "Schokoladen-Fondant", "Chocolate fondant"), price: null, image: M("fondant-chocolat") },
  ] },
];


const EXTRAS: { section: MenuSection; name: L; price: number }[] = [];

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
      // Réservation en ligne : 8 personnes max (au-delà : Instagram), 45 personnes présentes max,
      // 12 arrivées max par créneau de 30 min pour éviter le rush.
      maxOnlinePartySize: 8, maxGuestsAtOnce: 45, maxGuestsPerSlot: 12,
      notifyEmail: process.env.SEED_NOTIFY_EMAIL || null,
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
        imageUrl: { SHISHA: "/images/menu/chicha-classique.jpg", DRINK: "/images/menu/rubis-des-iles.jpg", FOOD: "/images/menu/cheesecake-speculoos.jpg" }[c.section],
        items: { create: c.items.map((it, ii) => ({ name: it.name, description: it.desc, priceCents: it.price, tags: it.tags ?? [], preorderable: !!it.preorderable, order: ii,
          imageUrl: it.image ?? null, subtitle: it.subtitle, ingredients: it.ingredients })) },
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
      g("table-desserts-cocktails.jpg", l("Table dressée avec desserts et boissons", "Gedeckter Tisch mit Desserts und Getränken", "Table set with desserts and drinks"), 1),
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
  while (created < 20 && attempts++ < 500) {
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
    const party = pick([2, 2, 2, 3, 4, 4, 5, 6]);
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
        preorder: preorderable.length && rand() < 0.3 ? [{ menuItemId: pick(preorderable).id, quantity: 1 }] : undefined,
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
