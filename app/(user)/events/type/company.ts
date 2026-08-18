export type Event = {
  id: number;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  quota: number;
  price: number;
  location?: string | null;
  coverImage?: string | null;
  category: { name: string };
  company: {
    name: string;
    logo: string;
    location: string;
    slug: string;
    createdAt: string;
  };
};

export type Ticket = {
  id: string;
  code: string;
  attendeeData: {
    name: string;
    email: string;
    phone: string;
  };
  order: {
    id: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELED";
  };
};
