import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { tr } from "./localized";

/** « Quasar + Tête Quasar » → « quasar-tete-quasar » (adresse lisible de chaque produit). */
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const euro = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

/** Carte complète (catégories actives non vides, produits disponibles), lue une fois par requête. */
export const getMenu = cache(async () => {
  const cats = await prisma.menuCategory.findMany({
    where: { active: true },
    orderBy: [{ section: "asc" }, { order: "asc" }],
    include: { items: { where: { available: true }, orderBy: { order: "asc" } } },
  });
  return cats
    .filter((c) => c.items.length)
    .map((c) => ({ ...c, items: c.items.map((it) => ({ ...it, slug: slugify(tr(it.name, "fr")) })) }));
});

export type MenuCategoryData = Awaited<ReturnType<typeof getMenu>>[number];
export type MenuItemData = MenuCategoryData["items"][number];
