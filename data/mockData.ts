export const mockProperties = [
  {
    id: '1',
    type: 'House',
    title: 'Spacious Family Home',
    description: 'A beautiful and spacious family home in a quiet suburban neighborhood. Features a large backyard, modern kitchen, and a two-car garage.',
    price: 450000,
    location: 'Suburbia, USA',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500, // in sqft
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Garden', 'Garage', 'Swimming Pool', 'Fireplace'],
    status: 'For Sale',
    gallery: [
      { name: 'Living Room', url: 'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { name: 'Kitchen', url: 'https://images.pexels.com/photos/6782472/pexels-photo-6782472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { name: 'Garage', url: 'https://images.pexels.com/photos/221185/pexels-photo-221185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
  },
  {
    id: '2',
    type: 'Apartment',
    title: 'Modern Downtown Apartment',
    description: 'A sleek and modern apartment in the heart of the city. Close to public transport, restaurants, and shopping centers.',
    price: 2500, // per month
    location: 'Downtown, USA',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200, // in sqft
    image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Gym', 'Rooftop Terrace', 'Concierge', 'Parking'],
    status: 'For Rent',
  },
  {
    id: '3',
    type: 'Co-working Space',
    title: 'Creative Co-working Hub',
    description: 'A vibrant and creative co-working space perfect for freelancers, startups, and small teams. High-speed internet and coffee included.',
    price: 300, // per person per month
    location: 'Tech Hub, USA',
    area: 5000, // in sqft
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['High-speed WiFi', 'Meeting Rooms', 'Kitchenette', '24/7 Access'],
    status: 'For Rent',
  },
  {
    id: '4',
    type: 'Land',
    title: 'Large Plot of Land',
    description: 'A large plot of undeveloped land with great potential for residential or commercial development. Scenic views and easy access to the main road.',
    price: 150000,
    location: 'Countryside, USA',
    area: 435600, // 10 acres in sqft
    image: 'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Water Access', 'Electricity Nearby'],
    status: 'For Sale',
  },
  {
    id: '5',
    type: 'House',
    title: 'Luxury Beachfront Villa',
    description: 'An exquisite beachfront villa with stunning ocean views. Private beach access, infinity pool, and luxurious interiors.',
    price: 2500000,
    location: 'Coastal Paradise, USA',
    bedrooms: 5,
    bathrooms: 6,
    area: 6000, // in sqft
    image: 'https://images.pexels.com/photos/3288102/pexels-photo-3288102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Private Beach', 'Infinity Pool', 'Home Theater', 'Jacuzzi'],
    status: 'For Sale',
    gallery: [
      { name: 'Pool', url: 'https://images.pexels.com/photos/1697076/pexels-photo-1697076.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { name: 'Bedroom', url: 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { name: 'Home Theater', url: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
  },
  {
    id: '6',
    type: 'Office Space',
    title: 'Modern Office for Rent',
    description: 'A modern, fully-furnished office space in a prime business district. Ideal for a growing company.',
    price: 5000, // per month
    location: 'Business District, USA',
    area: 3000, // in sqft
    image: 'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Reception', 'Conference Rooms', 'Pantry', 'Security'],
    status: 'For Rent',
  },
  {
    id: '7',
    type: 'Apartment',
    title: 'Cozy Studio Apartment',
    description: 'A cozy and affordable studio apartment in a student-friendly area. Fully furnished and includes all utilities.',
    price: 1200, // per month
    location: 'University Town, USA',
    bedrooms: 1,
    bathrooms: 1,
    area: 500, // in sqft
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Furnished', 'All Utilities Included', 'Laundry in Building'],
    status: 'For Rent',
  },
  {
    id: '8',
    type: 'House',
    title: 'Charming Countryside Cottage',
    description: 'A charming cottage in the peaceful countryside.',
    price: 250000,
    location: 'Rural Retreat, USA',
    bedrooms: 2,
    bathrooms: 1,
    area: 1500, // in sqft
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Large Garden', 'Fireplace', 'Pet Friendly'],
    status: 'For Sale',
    gallery: [
      { name: 'Garden', url: 'https://images.pexels.com/photos/4530798/pexels-photo-4530798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { name: 'Fireplace', url: 'https://images.pexels.com/photos/683929/pexels-photo-683929.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { name: 'Living Room', url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
  },
  {
    id: '9',
    type: 'Commercial',
    title: 'Retail Space in High-Traffic Area',
    description: 'A prime retail space located on a busy street with high foot traffic. Great for a new shop or a restaurant.',
    price: 7000, // per month
    location: 'Shopping District, USA',
    area: 2000, // in sqft
    image: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Storefront', 'Stock Room', 'Customer Parking'],
    status: 'For Rent',
  },
  {
    id: '10',
    type: 'Land',
    title: 'Wooded Acreage for Cabin',
    description: 'Beautiful wooded acreage perfect for building a private cabin or a vacation home. Rich in wildlife and natural beauty.',
    price: 80000,
    location: 'Mountain Valley, USA',
    area: 217800, // 5 acres in sqft
    image: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    amenities: ['Creek Access', 'Hiking Trails Nearby'],
    status: 'For Sale',
  },
];
