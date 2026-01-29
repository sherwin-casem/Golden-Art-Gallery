// Mock data for the NFT Gallery Marketplace

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  artist: string;
  artistId: string;
  price: number;
  collectionId: string;
  collectionName: string;
  isListed: boolean;
  owner: string;
  ownerId: string;
  createdAt: string;
  attributes?: { trait_type: string; value: string }[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  artistId: string;
  artistName: string;
  nftCount: number;
  floorPrice: number;
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  walletAddress: string;
  nftsMinted: number;
  totalVolume: number;
  joinedDate: string;
}

export interface Auction {
  id: string;
  nftId: string;
  nft: NFT;
  startPrice: number;
  currentBid: number;
  highestBidder: string;
  highestBidderAddress: string;
  endTime: string;
  isActive: boolean;
  bids: Bid[];
}

export interface Bid {
  id: string;
  bidder: string;
  bidderAddress: string;
  amount: number;
  timestamp: string;
}

// Mock Artists
export const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Elena Beaumont',
    bio: 'Contemporary digital artist exploring the intersection of classical aesthetics and blockchain technology.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    walletAddress: '0x1234...5678',
    nftsMinted: 24,
    totalVolume: 145.5,
    joinedDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Marcus Chen',
    bio: 'Award-winning 3D artist specializing in surreal landscapes and architectural visualization.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    walletAddress: '0x2345...6789',
    nftsMinted: 18,
    totalVolume: 98.3,
    joinedDate: '2023-02-20',
  },
  {
    id: '3',
    name: 'Sophia Laurent',
    bio: 'Fine art photographer capturing timeless moments in the digital age.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    walletAddress: '0x3456...7890',
    nftsMinted: 32,
    totalVolume: 203.7,
    joinedDate: '2022-11-10',
  },
  {
    id: '4',
    name: 'Alexander Noir',
    bio: 'Abstract expressionist bringing traditional techniques to the blockchain canvas.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    walletAddress: '0x4567...8901',
    nftsMinted: 15,
    totalVolume: 87.2,
    joinedDate: '2023-03-05',
  },
];

// Mock Collections
export const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'Eternal Echoes',
    description: 'A curated collection exploring the dialogue between past and future through digital portraiture.',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    artistId: '1',
    artistName: 'Elena Beaumont',
    nftCount: 12,
    floorPrice: 2.5,
    createdAt: '2023-06-01',
  },
  {
    id: '2',
    name: 'Architech Dreams',
    description: 'Impossible structures and surreal architectural visions that challenge reality.',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
    artistId: '2',
    artistName: 'Marcus Chen',
    nftCount: 8,
    floorPrice: 3.8,
    createdAt: '2023-07-15',
  },
  {
    id: '3',
    name: 'Lumière',
    description: 'Capturing the play of light and shadow in fleeting moments of beauty.',
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    artistId: '3',
    artistName: 'Sophia Laurent',
    nftCount: 15,
    floorPrice: 4.2,
    createdAt: '2023-05-20',
  },
  {
    id: '4',
    name: 'Chromatic Void',
    description: 'Abstract compositions exploring color theory in the digital realm.',
    coverImage: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
    artistId: '4',
    artistName: 'Alexander Noir',
    nftCount: 10,
    floorPrice: 1.9,
    createdAt: '2023-08-10',
  },
  {
    id: '5',
    name: 'Neo Renaissance',
    description: 'Classical art reimagined through the lens of modern technology.',
    coverImage: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800',
    artistId: '1',
    artistName: 'Elena Beaumont',
    nftCount: 6,
    floorPrice: 5.5,
    createdAt: '2023-09-01',
  },
];

// Mock NFTs
export const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'Portrait in Gold',
    description: 'A timeless portrait rendered in warm golden tones, capturing the essence of classical beauty.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    artist: 'Elena Beaumont',
    artistId: '1',
    price: 3.5,
    collectionId: '1',
    collectionName: 'Eternal Echoes',
    isListed: true,
    owner: 'Collector A',
    ownerId: 'collector1',
    createdAt: '2023-06-05',
  },
  {
    id: '2',
    name: 'The Infinite Staircase',
    description: 'An impossible architecture that defies gravity and perception.',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600',
    artist: 'Marcus Chen',
    artistId: '2',
    price: 4.2,
    collectionId: '2',
    collectionName: 'Architech Dreams',
    isListed: true,
    owner: 'Marcus Chen',
    ownerId: '2',
    createdAt: '2023-07-18',
  },
  {
    id: '3',
    name: 'Golden Hour',
    description: 'The perfect moment when light transforms the ordinary into the extraordinary.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
    artist: 'Sophia Laurent',
    artistId: '3',
    price: 5.0,
    collectionId: '3',
    collectionName: 'Lumière',
    isListed: true,
    owner: 'Collector B',
    ownerId: 'collector2',
    createdAt: '2023-05-25',
  },
  {
    id: '4',
    name: 'Chromatic Cascade',
    description: 'An explosion of color and form in digital space.',
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600',
    artist: 'Alexander Noir',
    artistId: '4',
    price: 2.8,
    collectionId: '4',
    collectionName: 'Chromatic Void',
    isListed: true,
    owner: 'Alexander Noir',
    ownerId: '4',
    createdAt: '2023-08-12',
  },
  {
    id: '5',
    name: 'Venus Reimagined',
    description: 'A digital reinterpretation of classical mythology for the modern age.',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=600',
    artist: 'Elena Beaumont',
    artistId: '1',
    price: 6.5,
    collectionId: '5',
    collectionName: 'Neo Renaissance',
    isListed: true,
    owner: 'Elena Beaumont',
    ownerId: '1',
    createdAt: '2023-09-03',
  },
  {
    id: '6',
    name: 'Midnight Reflection',
    description: 'The quiet beauty of night captured in a single frame.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    artist: 'Sophia Laurent',
    artistId: '3',
    price: 4.5,
    collectionId: '3',
    collectionName: 'Lumière',
    isListed: true,
    owner: 'Sophia Laurent',
    ownerId: '3',
    createdAt: '2023-05-28',
  },
  {
    id: '7',
    name: 'Abstract Harmony',
    description: 'Where chaos meets order in perfect balance.',
    image: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600',
    artist: 'Alexander Noir',
    artistId: '4',
    price: 3.2,
    collectionId: '4',
    collectionName: 'Chromatic Void',
    isListed: false,
    owner: 'Alexander Noir',
    ownerId: '4',
    createdAt: '2023-08-15',
  },
  {
    id: '8',
    name: 'Celestial Gateway',
    description: 'A portal to otherworldly dimensions rendered in stunning detail.',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600',
    artist: 'Marcus Chen',
    artistId: '2',
    price: 7.8,
    collectionId: '2',
    collectionName: 'Architech Dreams',
    isListed: true,
    owner: 'Collector C',
    ownerId: 'collector3',
    createdAt: '2023-07-22',
  },
];

// Mock Auctions
export const mockAuctions: Auction[] = [
  {
    id: '1',
    nftId: '3',
    nft: mockNFTs[2],
    startPrice: 4.0,
    currentBid: 5.8,
    highestBidder: 'Collector D',
    highestBidderAddress: '0x9876...5432',
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    isActive: true,
    bids: [
      {
        id: 'b1',
        bidder: 'Collector D',
        bidderAddress: '0x9876...5432',
        amount: 5.8,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'b2',
        bidder: 'Collector E',
        bidderAddress: '0x8765...4321',
        amount: 5.2,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: '2',
    nftId: '8',
    nft: mockNFTs[7],
    startPrice: 6.0,
    currentBid: 8.5,
    highestBidder: 'Collector F',
    highestBidderAddress: '0x7654...3210',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    isActive: true,
    bids: [
      {
        id: 'b3',
        bidder: 'Collector F',
        bidderAddress: '0x7654...3210',
        amount: 8.5,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'b4',
        bidder: 'Collector G',
        bidderAddress: '0x6543...2109',
        amount: 7.8,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];
