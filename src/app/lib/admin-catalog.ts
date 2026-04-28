/**
 * Super-admin catalog data: Companies (with brands), and ONDC Categories.
 *
 * This module is the single source of truth used by:
 *  - Admin → Companies & Brands (CRUD with image uploads)
 *  - Admin → Categories (image uploads against the ONDC taxonomy)
 *  - Admin → Add Seller (lets the admin pick which companies/brands the
 *    seller works with)
 */

export interface Brand {
  id: string;
  name: string;
  /** blob: or http(s): URL — null when no image is uploaded yet */
  imageUrl: string | null;
}

export interface Company {
  id: string;
  name: string;
  imageUrl: string | null;
  brands: Brand[];
  /**
   * Per-company copy of the 37 ONDC categories. Each company gets its own
   * dedicated category images so the storefront can show brand-specific
   * tiles (e.g. ITC's "Atta, Flours and Sooji" tile differs from Adani's).
   * Auto-seeded with all 37 ONDC category names (imageUrl=null) on create.
   */
  categories: AdminCategory[];
  /**
   * Whether this company is active (available to be assigned to sellers and
   * shown in seller-side pickers). Defaults to `true`. Inactive companies
   * remain in the catalog (can't be deleted because multiple sellers may
   * already reference them) but are hidden from new assignments.
   */
  isActive?: boolean;
}

export interface AdminCategory {
  /** Category name from the ONDC eB2B taxonomy. Acts as the unique key. */
  name: string;
  imageUrl: string | null;
}

// 37-entry ONDC eB2B category taxonomy (must match CATEGORY_OPTIONS in sku-detail.tsx)
export const ONDC_CATEGORY_NAMES: string[] = [
  "Fruits and Vegetables",
  "Masala & Seasoning",
  "Oil & Ghee",
  "Eggs, Meat & Fish",
  "Bakery, Cakes & Dairy",
  "Pet Care",
  "Detergents and Dishwash",
  "Dairy and Cheese",
  "Snacks, Dry Fruits, Nuts",
  "Pasta, Soup and Noodles",
  "Cereals and Breakfast",
  "Sauces, Spreads and Dips",
  "Chocolates and Biscuits",
  "Cooking and Baking Needs",
  "Tinned and Processed Food",
  "Atta, Flours and Sooji",
  "Rice and Rice Products",
  "Dals and Pulses",
  "Salt, Sugar and Jaggery",
  "Energy and Soft Drinks",
  "Water",
  "Tea and Coffee",
  "Fruit Juices and Fruit Drinks",
  "Snacks and Namkeen",
  "Ready to Cook and Eat",
  "Pickles and Chutney",
  "Indian Sweets",
  "Frozen Vegetables",
  "Frozen Snacks",
  "Gift Voucher",
  "Gourmet & World Foods",
  "Foodgrains",
  "Beverages",
  "Beauty & Hygiene",
  "Kitchen Accessories",
  "Baby Care",
  "Snacks & Branded Foods",
];

/** Build a fresh, image-less copy of the 37 ONDC categories — used as the
 *  starting set when a new company is created. */
export function makeCompanyCategorySeed(): AdminCategory[] {
  return ONDC_CATEGORY_NAMES.map((name) => ({ name, imageUrl: null }));
}

// Seed companies — match the brands appearing on the seller-side SKU list.
export const seedCompanies: Company[] = [
  {
    id: "co-adani",
    name: "Adani Wilmar Ltd",
    imageUrl: null,
    isActive: true,
    brands: [
      { id: "br-fortune", name: "Fortune", imageUrl: null },
      { id: "br-kohinoor", name: "Kohinoor", imageUrl: null },
    ],
    categories: makeCompanyCategorySeed(),
  },
  {
    id: "co-freedom",
    name: "Gemini Edibles & Fats India",
    imageUrl: null,
    isActive: true,
    brands: [
      { id: "br-freedom", name: "Freedom", imageUrl: null },
      { id: "br-firstklass", name: "First Klass", imageUrl: null },
    ],
    categories: makeCompanyCategorySeed(),
  },
  {
    id: "co-srikrupa",
    name: "Sri Krupa Industries",
    imageUrl: null,
    isActive: true,
    brands: [{ id: "br-srikrupa", name: "Sri Krupa", imageUrl: null }],
    categories: makeCompanyCategorySeed(),
  },
  {
    id: "co-itc",
    name: "ITC",
    imageUrl: null,
    isActive: true,
    brands: [
      { id: "br-aashirvaad", name: "Aashirvaad", imageUrl: null },
      { id: "br-sunfeast", name: "Sunfeast", imageUrl: null },
      { id: "br-bingo", name: "Bingo", imageUrl: null },
      { id: "br-yippee", name: "Yippee", imageUrl: null },
      { id: "br-classmate", name: "Classmate", imageUrl: null },
    ],
    categories: makeCompanyCategorySeed(),
  },
];

/** Tiny in-memory store. In a real app this would live behind an API. */
let companies: Company[] = seedCompanies;
let categories: AdminCategory[] = ONDC_CATEGORY_NAMES.map((name) => ({
  name,
  imageUrl: null,
}));

const companyListeners = new Set<() => void>();
const categoryListeners = new Set<() => void>();

export function getCompanies(): Company[] {
  return companies;
}

export function setCompanies(next: Company[]) {
  companies = next;
  companyListeners.forEach((fn) => fn());
}

export function subscribeToCompanies(fn: () => void): () => void {
  companyListeners.add(fn);
  return () => {
    companyListeners.delete(fn);
  };
}

export function getCategories(): AdminCategory[] {
  return categories;
}

export function setCategories(next: AdminCategory[]) {
  categories = next;
  categoryListeners.forEach((fn) => fn());
}

export function subscribeToCategories(fn: () => void): () => void {
  categoryListeners.add(fn);
  return () => {
    categoryListeners.delete(fn);
  };
}

/**
 * Toggle (or set) a company's active status. Companies are never deleted
 * because they may be referenced by sellers — flipping `isActive` to `false`
 * is the way to retire one.
 */
export function setCompanyActive(companyId: string, isActive: boolean) {
  setCompanies(
    companies.map((c) => (c.id === companyId ? { ...c, isActive } : c)),
  );
}

/** Build a stable id when we add a new company/brand at runtime. */
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/** Free up object URLs we created for previews. */
export function revokeImage(url: string | null) {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}
