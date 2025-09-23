import { Agent } from '../types';
import { mockProperties } from './mockData';

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Experienced real estate agent with over 10 years in luxury property sales and residential homes. Specialized in waterfront properties and urban developments.',
    email: 'john.doe@realestate.com',
    phone: '+1234567890',
    experience: 10,
    rating: 4.8,
    totalReviews: 156,
    totalProperties: 24,
    specializations: ['Luxury Homes', 'Waterfront Properties', 'Urban Development'],
    languages: ['English', 'Spanish', 'French'],
    verified: true,
    properties: mockProperties.slice(0, 5)
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Passionate about helping first-time homebuyers find their perfect match. Expert in commercial real estate and property investment strategies.',
    email: 'jane.smith@realestate.com',
    phone: '+1234567891',
    experience: 7,
    rating: 4.9,
    totalReviews: 98,
    totalProperties: 18,
    specializations: ['Commercial Properties', 'First-time Buyers', 'Investment Properties'],
    languages: ['English', 'Mandarin'],
    verified: true,
    properties: mockProperties.slice(5, 10)
  }
];
