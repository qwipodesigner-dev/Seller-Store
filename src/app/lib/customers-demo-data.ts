// Shared store for the Customers 2 demo. The list page (customers-demo.tsx)
// and the detail page (customer-demo-detail.tsx) both read from here so a
// delivery-day change made on one is visible on the other without prop
// drilling. Module-level state + a tiny publish/subscribe pattern keeps the
// surface familiar to anyone who's worked with the other mock stores.

import { DeliveryDay, NEXT_DAY } from "./customers-data";

/** A single (company → delivery day) pairing for a customer. */
export interface CompanyLink {
  companyId: string;
  companyName: string;
  deliveryDay: DeliveryDay | null;
}

export interface DemoCustomer {
  customerId: string;
  customerName: string;
  businessName: string;
  mobile: string;
  area: string;
  pincode: string;
  classType: "Wholesaler" | "Kirana" | "Modern Trade" | "HoReCa";
  /** First-order auto-registration date (drives the Registered On column). */
  registeredDate: string;
  totalOrders: number;
  /** Companies the customer buys from. Length ≥ 1. */
  companies: CompanyLink[];
  status: "Active" | "Blocked";
}

// ---------- Seed ----------

const SEED: DemoCustomer[] = [
  {
    customerId: "c1",
    customerName: "Priya Singh",
    businessName: "Sunshine Kirana",
    mobile: "+91 98765 43222",
    area: "Indiranagar",
    pincode: "560038",
    classType: "Kirana",
    registeredDate: "2026-04-12",
    totalOrders: 14,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: "Wednesday" },
      { companyId: "co-marico", companyName: "Marico", deliveryDay: "Monday" },
    ],
    status: "Active",
  },
  {
    customerId: "c2",
    customerName: "Lakshmi Rao",
    businessName: "Annapurna Wholesale",
    mobile: "+91 98765 43224",
    area: "Secunderabad",
    pincode: "500003",
    classType: "Wholesaler",
    registeredDate: "2026-04-08",
    totalOrders: 47,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: "Friday" },
    ],
    status: "Active",
  },
  {
    customerId: "c3",
    customerName: "Ramesh Patel",
    businessName: "Patel Provision Store",
    mobile: "+91 98765 43225",
    area: "Andheri West",
    pincode: "400058",
    classType: "Kirana",
    registeredDate: "2026-04-22",
    totalOrders: 6,
    companies: [
      {
        companyId: "co-freedom",
        companyName: "Gemini Edibles & Fats India",
        deliveryDay: null,
      },
    ],
    status: "Active",
  },
  {
    customerId: "c4",
    customerName: "Suresh Kumar",
    businessName: "City Supermart",
    mobile: "+91 98765 43226",
    area: "Connaught Place",
    pincode: "110001",
    classType: "Modern Trade",
    registeredDate: "2026-03-30",
    totalOrders: 92,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: "Tuesday" },
      { companyId: "co-marico", companyName: "Marico", deliveryDay: "Thursday" },
      {
        companyId: "co-freedom",
        companyName: "Gemini Edibles & Fats India",
        deliveryDay: NEXT_DAY,
      },
    ],
    status: "Active",
  },
  {
    customerId: "c5",
    customerName: "Anand Sharma",
    businessName: "Anand General Store",
    mobile: "+91 98765 43227",
    area: "Banjara Hills",
    pincode: "500034",
    classType: "Kirana",
    registeredDate: "2026-04-25",
    totalOrders: 3,
    companies: [
      { companyId: "co-itc", companyName: "ITC Limited", deliveryDay: null },
    ],
    status: "Active",
  },
  {
    customerId: "c6",
    customerName: "Meera Iyer",
    businessName: "Iyer's HoReCa Hub",
    mobile: "+91 98765 43228",
    area: "Koramangala",
    pincode: "560034",
    classType: "HoReCa",
    registeredDate: "2026-04-15",
    totalOrders: 21,
    companies: [
      { companyId: "co-marico", companyName: "Marico", deliveryDay: "Saturday" },
    ],
    status: "Active",
  },
  {
    customerId: "c7",
    customerName: "Rajan Nair",
    businessName: "Coastal Trading Co.",
    mobile: "+91 98765 43229",
    area: "T. Nagar",
    pincode: "600017",
    classType: "Wholesaler",
    registeredDate: "2026-04-02",
    totalOrders: 38,
    companies: [
      {
        companyId: "co-freedom",
        companyName: "Gemini Edibles & Fats India",
        deliveryDay: "Wednesday",
      },
    ],
    status: "Blocked",
  },
];

// ---------- Module-level state with publish/subscribe ----------

let _customers: DemoCustomer[] = SEED.map((c) => ({
  ...c,
  companies: c.companies.map((co) => ({ ...co })),
}));
const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((fn) => fn());

export const getDemoCustomers = (): DemoCustomer[] => _customers;

export const getDemoCustomerById = (
  customerId: string,
): DemoCustomer | undefined => _customers.find((c) => c.customerId === customerId);

export const setDemoCustomers = (next: DemoCustomer[]) => {
  _customers = next;
  notify();
};

/** Set the delivery day for one (customer × company) pairing. */
export const setDemoCompanyDeliveryDay = (
  customerId: string,
  companyId: string,
  day: DeliveryDay | null,
) => {
  _customers = _customers.map((c) =>
    c.customerId === customerId
      ? {
          ...c,
          companies: c.companies.map((co) =>
            co.companyId === companyId ? { ...co, deliveryDay: day } : co,
          ),
        }
      : c,
  );
  notify();
};

/** Set the delivery day for every company of a customer in one go. */
export const setDemoAllCompanyDeliveryDays = (
  customerId: string,
  day: DeliveryDay,
) => {
  _customers = _customers.map((c) =>
    c.customerId === customerId
      ? {
          ...c,
          companies: c.companies.map((co) => ({ ...co, deliveryDay: day })),
        }
      : c,
  );
  notify();
};

export const setDemoStatus = (
  customerIds: string[],
  status: "Active" | "Blocked",
) => {
  const ids = new Set(customerIds);
  _customers = _customers.map((c) =>
    ids.has(c.customerId) ? { ...c, status } : c,
  );
  notify();
};

export const subscribeToDemoCustomers = (cb: () => void) => {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
};
