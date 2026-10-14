import "server-only";
import { cache } from "react";
import { logged, prisma } from "./prisma";
import { tr } from "./localized";

/** « Quasar + Tête Quasar » → « quasar-tete-quasar » (adresse lisible de chaque produit). */
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const euro = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

/** Carte complète (catégories actives non vides, produits disponibles), lue une fois par requête. */
export const getMenu = cache(async () => {
  const cats = await logged("getMenu", prisma.menuCategory.findMany({
    where: { active: true },
    orderBy: [{ section: "asc" }, { order: "asc" }],
    include: { items: { where: { available: true }, orderBy: { order: "asc" } } },
  }));
  return cats
    .filter((c) => c.items.length)
    .map((c) => ({ ...c, items: c.items.map((it) => ({ ...it, slug: slugify(tr(it.name, "fr")) })) }));
});

export type MenuCategoryData = Awaited<ReturnType<typeof getMenu>>[number];
export type MenuItemData = MenuCategoryData["items"][number];

/** Adresse de la page qui regroupe une famille quand elle compte plusieurs catégories (ex. Boissons). */
export const SECTION_HUB = { SHISHA: "chichas", DRINK: "boissons", FOOD: "douceurs" } as const;

/**
 * Familles de la carte (Chichas, Boissons, Desserts) : une famille d'une seule catégorie mène
 * directement à cette catégorie ; une famille de plusieurs mène à sa page de choix (/carte/boissons).
 */
export function menuSections(cats: MenuCategoryData[]) {
  const groups: { section: MenuCategoryData["section"]; cats: MenuCategoryData[] }[] = [];
  for (const c of cats) {
    const g = groups.find((x) => x.section === c.section);
    if (g) g.cats.push(c);
    else groups.push({ section: c.section, cats: [c] });
  }
  return groups.map((g) => ({ ...g, hub: g.cats.length > 1, slug: g.cats.length > 1 ? SECTION_HUB[g.section] : g.cats[0].slug }));
}
export type MenuSectionGroup = ReturnType<typeof menuSections>[number];
