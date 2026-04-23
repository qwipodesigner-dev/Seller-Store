/**
 * Shared customer data model for the seller's Customers module.
 *
 * Business rule: "Registered Date" is the date of the customer's FIRST ORDER
 * placed through the seller — NOT a separate signup date. This timestamp is
 * used for filters, export date ranges, and the Customer Detail view.
 */

export type ClassType =
  | "Kirana"
  | "Wholesaler"
  | "Bakery"
  | "Grocery"
  | "Supermarket"
  | "Restaurant"
  | "Hotel"
  | "Other";

export const CLASS_TYPES: ClassType[] = [
  "Kirana",
  "Wholesaler",
  "Bakery",
  "Grocery",
  "Supermarket",
  "Restaurant",
  "Hotel",
  "Other",
];

export interface Customer {
  id: string;
  /** Owner / primary contact person */
  customerName: string;
  businessName: string;
  classType: ClassType;
  mobile: string;
  /** Area / locality name (e.g., "MG Road") */
  area: string;
  pincode: string;
  city: string;
  state: string;
  /** Full postal address including shop no., street, area */
  fullAddress: string;
  latitude: number;
  longitude: number;
  /** Date of the customer's first order placed through this seller. Format: YYYY-MM-DD */
  registeredDate: string;
  totalOrders: number;
  totalRevenue: number;
  email?: string;
  gstNumber?: string;
}

// Real-looking mock data spanning multiple class types, cities, and registration
// dates so the filters and date-range export have something meaningful to show.
export const customers: Customer[] = [
  {
    id: "CUST-001",
    customerName: "Ramesh Kumar",
    businessName: "Ramesh Kirana Store",
    classType: "Kirana",
    mobile: "+91 98765 43210",
    area: "MG Road",
    pincode: "560001",
    city: "Bangalore",
    state: "Karnataka",
    fullAddress: "Shop No. 45, MG Road, Near City Mall, Bangalore - 560001",
    latitude: 12.9716,
    longitude: 77.5946,
    registeredDate: "2026-01-18",
    totalOrders: 42,
    totalRevenue: 185000,
    email: "ramesh.kumar@example.com",
    gstNumber: "29ABCDE1234F1Z5",
  },
  {
    id: "CUST-002",
    customerName: "Suresh Sharma",
    businessName: "Sharma Grocery",
    classType: "Grocery",
    mobile: "+91 98765 43211",
    area: "Andheri West",
    pincode: "400058",
    city: "Mumbai",
    state: "Maharashtra",
    fullAddress: "12, JP Road, Andheri West, Mumbai - 400058",
    latitude: 19.1136,
    longitude: 72.8697,
    registeredDate: "2026-02-05",
    totalOrders: 31,
    totalRevenue: 142000,
    gstNumber: "27FGHIJ5678K1L9",
  },
  {
    id: "CUST-003",
    customerName: "Mahesh Gupta",
    businessName: "City Supermart",
    classType: "Supermarket",
    mobile: "+91 98765 43212",
    area: "Connaught Place",
    pincode: "110001",
    city: "Delhi",
    state: "Delhi",
    fullAddress: "Block C, Connaught Place, New Delhi - 110001",
    latitude: 28.6330,
    longitude: 77.2193,
    registeredDate: "2025-11-12",
    totalOrders: 98,
    totalRevenue: 520000,
    email: "mahesh@citysupermart.in",
    gstNumber: "07MNOPQ1234R1S6",
  },
  {
    id: "CUST-004",
    customerName: "Priya Nair",
    businessName: "Sweet Delights Bakery",
    classType: "Bakery",
    mobile: "+91 98765 43213",
    area: "Whitefield",
    pincode: "560066",
    city: "Bangalore",
    state: "Karnataka",
    fullAddress: "27, Whitefield Main Road, Bangalore - 560066",
    latitude: 12.9698,
    longitude: 77.7499,
    registeredDate: "2026-03-01",
    totalOrders: 12,
    totalRevenue: 38400,
  },
  {
    id: "CUST-005",
    customerName: "Arjun Reddy",
    businessName: "Quick Mart",
    classType: "Kirana",
    mobile: "+91 98765 43214",
    area: "Koramangala",
    pincode: "560034",
    city: "Bangalore",
    state: "Karnataka",
    fullAddress: "4th Block, Koramangala, Bangalore - 560034",
    latitude: 12.9352,
    longitude: 77.6245,
    registeredDate: "2026-02-22",
    totalOrders: 24,
    totalRevenue: 96500,
  },
  {
    id: "CUST-006",
    customerName: "Ajay Verma",
    businessName: "Verma Wholesale Traders",
    classType: "Wholesaler",
    mobile: "+91 98765 43215",
    area: "APMC Market",
    pincode: "400705",
    city: "Navi Mumbai",
    state: "Maharashtra",
    fullAddress: "Gala 23, APMC Market Sector-19, Navi Mumbai - 400705",
    latitude: 19.0330,
    longitude: 73.0297,
    registeredDate: "2025-10-04",
    totalOrders: 145,
    totalRevenue: 892000,
    gstNumber: "27VWXYZ5678A1B2",
  },
  {
    id: "CUST-007",
    customerName: "Kavya Iyer",
    businessName: "Metro Foods",
    classType: "Grocery",
    mobile: "+91 98765 43216",
    area: "Bandra",
    pincode: "400050",
    city: "Mumbai",
    state: "Maharashtra",
    fullAddress: "Linking Road, Bandra West, Mumbai - 400050",
    latitude: 19.0596,
    longitude: 72.8295,
    registeredDate: "2026-03-15",
    totalOrders: 9,
    totalRevenue: 27800,
  },
  {
    id: "CUST-008",
    customerName: "Ravi Deshmukh",
    businessName: "Green Valley Traders",
    classType: "Wholesaler",
    mobile: "+91 98765 43217",
    area: "Kothrud",
    pincode: "411038",
    city: "Pune",
    state: "Maharashtra",
    fullAddress: "Plot 88, Kothrud Industrial Area, Pune - 411038",
    latitude: 18.5074,
    longitude: 73.8077,
    registeredDate: "2025-12-10",
    totalOrders: 67,
    totalRevenue: 412000,
    gstNumber: "27CDEFG5678H1I9",
  },
  {
    id: "CUST-009",
    customerName: "Meenakshi Iyer",
    businessName: "Southern Superstore",
    classType: "Supermarket",
    mobile: "+91 98765 43218",
    area: "T Nagar",
    pincode: "600017",
    city: "Chennai",
    state: "Tamil Nadu",
    fullAddress: "Ranganathan Street, T Nagar, Chennai - 600017",
    latitude: 13.0418,
    longitude: 80.2341,
    registeredDate: "2026-01-28",
    totalOrders: 56,
    totalRevenue: 245000,
  },
  {
    id: "CUST-010",
    customerName: "Anil Patel",
    businessName: "Taj Restaurant",
    classType: "Restaurant",
    mobile: "+91 98765 43219",
    area: "Navrangpura",
    pincode: "380009",
    city: "Ahmedabad",
    state: "Gujarat",
    fullAddress: "CG Road, Navrangpura, Ahmedabad - 380009",
    latitude: 23.0395,
    longitude: 72.5660,
    registeredDate: "2026-02-14",
    totalOrders: 28,
    totalRevenue: 118500,
    gstNumber: "24JKLMN1234O1P9",
  },
  {
    id: "CUST-011",
    customerName: "Sneha Joshi",
    businessName: "Daily Bread Bakery",
    classType: "Bakery",
    mobile: "+91 98765 43220",
    area: "Viman Nagar",
    pincode: "411014",
    city: "Pune",
    state: "Maharashtra",
    fullAddress: "Lane 5, Viman Nagar, Pune - 411014",
    latitude: 18.5679,
    longitude: 73.9143,
    registeredDate: "2026-03-20",
    totalOrders: 6,
    totalRevenue: 15200,
  },
  {
    id: "CUST-012",
    customerName: "Vikram Shetty",
    businessName: "Coastal Grand Hotel",
    classType: "Hotel",
    mobile: "+91 98765 43221",
    area: "Besant Nagar",
    pincode: "600090",
    city: "Chennai",
    state: "Tamil Nadu",
    fullAddress: "2nd Avenue, Besant Nagar, Chennai - 600090",
    latitude: 12.9996,
    longitude: 80.2670,
    registeredDate: "2025-09-28",
    totalOrders: 112,
    totalRevenue: 678000,
    gstNumber: "33QRSTU5678V1W2",
  },
  {
    id: "CUST-013",
    customerName: "Priya Singh",
    businessName: "Sunshine Kirana",
    classType: "Kirana",
    mobile: "+91 98765 43222",
    area: "Indiranagar",
    pincode: "560038",
    city: "Bangalore",
    state: "Karnataka",
    fullAddress: "100 Feet Road, Indiranagar, Bangalore - 560038",
    latitude: 12.9784,
    longitude: 77.6408,
    registeredDate: "2026-04-02",
    totalOrders: 3,
    totalRevenue: 7900,
  },
  {
    id: "CUST-014",
    customerName: "Rajeev Menon",
    businessName: "Spice Garden Restaurant",
    classType: "Restaurant",
    mobile: "+91 98765 43223",
    area: "Marine Drive",
    pincode: "682011",
    city: "Kochi",
    state: "Kerala",
    fullAddress: "Marine Drive, Ernakulam, Kochi - 682011",
    latitude: 9.9758,
    longitude: 76.2820,
    registeredDate: "2025-11-22",
    totalOrders: 73,
    totalRevenue: 387500,
    email: "rajeev@spicegarden.in",
  },
  {
    id: "CUST-015",
    customerName: "Lakshmi Rao",
    businessName: "Annapurna Wholesale",
    classType: "Wholesaler",
    mobile: "+91 98765 43224",
    area: "Secunderabad",
    pincode: "500003",
    city: "Hyderabad",
    state: "Telangana",
    fullAddress: "Market Road, Secunderabad, Hyderabad - 500003",
    latitude: 17.4399,
    longitude: 78.4983,
    registeredDate: "2026-04-15",
    totalOrders: 5,
    totalRevenue: 28900,
  },
];

export function findCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
