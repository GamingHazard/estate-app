import type { UserRole } from "../features/auth/authTypes";

export type PublicListerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  role: Exclude<UserRole, "user">;
  avatar?: { url?: string };
  bio: string;
  phoneNumber?: string;
  email?: string;
  averageRating?: number;
  totalReviews?: number;
  ratingCount?: number;
};

export const mockListerProfiles: PublicListerProfile[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    role: "landlord",
    avatar: { url: "https://randomuser.me/api/portraits/men/1.jpg" },
    bio: "I list residential homes and apartments available for rent and sale.",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    role: "propertyManager",
    avatar: { url: "https://randomuser.me/api/portraits/women/1.jpg" },
    bio: "I manage a range of residential and commercial properties.",
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Mendez",
    role: "landlord",
    avatar: { url: "https://randomuser.me/api/portraits/men/2.jpg" },
    bio: "I share available homes and investment properties in my area.",
  },
  {
    id: "4",
    firstName: "Diana",
    lastName: "Lee",
    role: "propertyManager",
    avatar: { url: "https://randomuser.me/api/portraits/women/2.jpg" },
    bio: "I help people find well-maintained apartments and city homes.",
  },
  {
    id: "5",
    firstName: "Ethan",
    lastName: "Patel",
    role: "landlord",
    avatar: { url: "https://randomuser.me/api/portraits/men/3.jpg" },
    bio: "I list flexible commercial spaces for local businesses.",
  },
  {
    id: "6",
    firstName: "Fatima",
    lastName: "Noor",
    role: "landlord",
    avatar: { url: "https://randomuser.me/api/portraits/women/3.jpg" },
    bio: "I share homes and properties currently available in my portfolio.",
  },
  {
    id: "7",
    firstName: "George",
    lastName: "Kim",
    role: "propertyManager",
    avatar: { url: "https://randomuser.me/api/portraits/men/4.jpg" },
    bio: "I manage homes and properties for people looking to rent or buy.",
  },
  {
    id: "8",
    firstName: "Hannah",
    lastName: "Wright",
    role: "landlord",
    avatar: { url: "https://randomuser.me/api/portraits/women/4.jpg" },
    bio: "I list family homes and long-term rental properties.",
  },
];
