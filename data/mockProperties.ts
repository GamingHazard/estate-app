export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'house' | 'apartment' | 'condo' | 'land';
  status: 'active' | 'pending' | 'rejected';
  mainImage: string;
  images: string[];
  agent: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    description: 'Beautiful modern apartment with city views. Recently renovated with high-end finishes.',
    price: 450000,
    location: 'Downtown, City Center',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    type: 'apartment',
    status: 'active',
    mainImage: 'https://example.com/property1-main.jpg',
    images: [
      'https://example.com/property1-1.jpg',
      'https://example.com/property1-2.jpg',
      'https://example.com/property1-3.jpg'
    ],
    agent: {
      id: 'a1',
      name: 'John Doe',
      email: 'john@realestate.com',
      avatar: 'https://example.com/agent1.jpg'
    },
    createdAt: '2025-09-20T10:00:00Z',
    updatedAt: '2025-09-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Luxury Villa with Pool',
    description: 'Spacious villa with private pool and garden. Perfect for families.',
    price: 850000,
    location: 'Suburban Area, Green Valley',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    type: 'house',
    status: 'pending',
    mainImage: 'https://example.com/property2-main.jpg',
    images: [
      'https://example.com/property2-1.jpg',
      'https://example.com/property2-2.jpg',
      'https://example.com/property2-3.jpg'
    ],
    agent: {
      id: 'a2',
      name: 'Jane Smith',
      email: 'jane@realestate.com',
      avatar: 'https://example.com/agent2.jpg'
    },
    createdAt: '2025-09-19T15:30:00Z',
    updatedAt: '2025-09-19T15:30:00Z'
  },
  {
    id: '3',
    title: 'Beachfront Condo',
    description: 'Stunning beachfront condo with panoramic ocean views.',
    price: 650000,
    location: 'Coastal Area, Beach Road',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    type: 'condo',
    status: 'active',
    mainImage: 'https://example.com/property3-main.jpg',
    images: [
      'https://example.com/property3-1.jpg',
      'https://example.com/property3-2.jpg',
      'https://example.com/property3-3.jpg'
    ],
    agent: {
      id: 'a3',
      name: 'Mike Johnson',
      email: 'mike@realestate.com',
      avatar: 'https://example.com/agent3.jpg'
    },
    createdAt: '2025-09-18T09:15:00Z',
    updatedAt: '2025-09-18T09:15:00Z'
  }
];

export const propertyStats = {
  total: 150,
  active: 120,
  pending: 20,
  rejected: 10,
  reported: 5
};