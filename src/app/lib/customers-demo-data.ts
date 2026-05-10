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
  email?: string;
  /** Free-form address line, used by the detail page's Address card. */
  fullAddress?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  /** Lat/long power the embedded map on the detail page. */
  latitude: number;
  longitude: number;
  /** Optional GSTIN — only filled for Wholesaler / Modern Trade in seed. */
  gstNumber?: string;
  classType: "Wholesaler" | "Kirana" | "Modern Trade" | "HoReCa";
  /** First-order auto-registration date (drives the Registered On column). */
  registeredDate: string;
  totalOrders: number;
  /** Total revenue in INR — surfaced on the detail page Business card. */
  totalRevenue?: number;
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
    email: "priya.singh@sunshinekirana.in",
    fullAddress: "Shop 12, 100ft Road, Indiranagar 1st Stage",
    area: "Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
    latitude: 12.9719,
    longitude: 77.6412,
    classType: "Kirana",
    registeredDate: "2026-04-12",
    totalOrders: 14,
    totalRevenue: 145600,
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
    email: "lakshmi@annapurnawholesale.com",
    fullAddress: "Plot 47, Patny Centre, Secunderabad",
    area: "Secunderabad",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500003",
    latitude: 17.4399,
    longitude: 78.4983,
    gstNumber: "36ABCDE1234F1Z5",
    classType: "Wholesaler",
    registeredDate: "2026-04-08",
    totalOrders: 47,
    totalRevenue: 612400,
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
    email: "ramesh.patel@gmail.com",
    fullAddress: "Shop 4, Andheri West, near Lokhandwala Market",
    area: "Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400058",
    latitude: 19.1340,
    longitude: 72.8270,
    classType: "Kirana",
    registeredDate: "2026-04-22",
    totalOrders: 6,
    totalRevenue: 38600,
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
    email: "suresh@citysupermart.in",
    fullAddress: "F-12 Connaught Place, Outer Circle",
    area: "Connaught Place",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    latitude: 28.6328,
    longitude: 77.2197,
    gstNumber: "07ABCDE5678G1Z9",
    classType: "Modern Trade",
    registeredDate: "2026-03-30",
    totalOrders: 92,
    totalRevenue: 1480000,
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
    fullAddress: "Plot 5, Road No.12, Banjara Hills",
    area: "Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    latitude: 17.4156,
    longitude: 78.4347,
    classType: "Kirana",
    registeredDate: "2026-04-25",
    totalOrders: 3,
    totalRevenue: 12450,
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
    email: "meera@iyershoreca.com",
    fullAddress: "5th Block, Koramangala, near Forum Mall",
    area: "Koramangala",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560034",
    latitude: 12.9352,
    longitude: 77.6245,
    classType: "HoReCa",
    registeredDate: "2026-04-15",
    totalOrders: 21,
    totalRevenue: 256000,
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
    email: "rajan@coastaltrading.in",
    fullAddress: "Old No. 9, T. Nagar, Pondy Bazaar",
    area: "T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    latitude: 13.0418,
    longitude: 80.2341,
    gstNumber: "33ABCDE9876H1Z3",
    classType: "Wholesaler",
    registeredDate: "2026-04-02",
    totalOrders: 38,
    totalRevenue: 487000,
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
