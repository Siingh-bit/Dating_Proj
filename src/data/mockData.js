// Generate photos using curated Unsplash female portrait images and pravatar fallback
const photo = (id) => `https://i.pravatar.cc/800?img=${id}`;

export const PROMPTS_CATALOG = [
  "A life goal of mine is",
  "My simple pleasures are",
  "The way to win me over is",
  "I'm looking for someone who",
  "A random fact I love is",
  "I geek out on",
  "My most irrational fear is",
  "The key to my heart is",
  "I'm convinced that",
  "Typical Sunday for me",
  "I recently discovered that",
  "My go-to karaoke song is",
  "Two truths and a lie",
  "Best travel story",
  "I'll fall for you if",
  "Together we could",
  "Believe it or not, I",
  "Something that's non-negotiable for me is",
  "The hallmark of a good relationship is",
  "My love language is",
];

export const CURRENT_USER = {
  id: "user-self",
  name: "Alex",
  age: 26,
  gender: "male",
  interestedIn: "female",
  location: "Mumbai, India",
  photos: [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
  ],
  prompts: [
    { question: "A life goal of mine is", answer: "To build something that genuinely helps people connect in a world full of noise." },
    { question: "My simple pleasures are", answer: "Sunday mornings with pour-over coffee and a book I'll never finish." },
    { question: "The way to win me over is", answer: "Be curious about the world and don't take yourself too seriously." },
  ],
  vitals: {
    height: "5'11\"",
    work: "Product Designer",
    education: "NID Ahmedabad",
    hometown: "Pune",
    religion: "Spiritual",
    politics: "Liberal",
    drinking: "Socially",
    smoking: "Never",
  },
  intention: "Life partner",
  tier: "elite",
  gender_bonus_active: false,
  conversation_slots: 10,
  weekly_ends_remaining: 2,
  weekly_ends_max: 2,
  daily_likes_remaining: 8,
  daily_likes_max: 8,
  joined: "2026-07-01",
  bio: '',
  pronouns: 'he/him',
  zodiac: 'Sagittarius',
  exercise: 'Sometimes',
  cannabis: 'Never',
  pets: 'Dog lover',
  kids: 'Not sure',
  diet: 'Omnivore',
  languages: ['English', 'Hindi'],
  interests: ['Travel', 'Music', 'Coffee', 'Technology', 'Photography'],
  company: '',
  school: 'NID Ahmedabad',
  jobTitle: 'Product Designer',
  verified: true,
};

export const PROFILES = [
  {
    id: "p1",
    name: "Isha",
    age: 24,
    gender: "female",
    location: "Bandra, Mumbai",
    distance: "2 km away",
    photos: [
      "/profiles/isha/1.jpg",
      "/profiles/isha/2.jpg",
      "/profiles/isha/3.jpg",
      "/profiles/isha/4.jpg",
    ],
    prompts: [
      { question: "My simple pleasures are", answer: "Iced matcha latte at a sunlit Bandra café, exploring vintage vinyl record stores, and listening to the sea at Bandstand." },
      { question: "I'll fall for you if", answer: "You're genuinely curious about the world, make people around you feel heard, and enjoy spontaneous night drives." },
      { question: "The hallmark of a good relationship is", answer: "Effortless conversation where 3 hours feel like 10 minutes, and feeling completely comfortable being your authentic self." },
    ],
    vitals: {
      height: "5'4\"",
      work: "UX & Product Designer",
      education: "NID Ahmedabad",
      hometown: "Mumbai",
      religion: "Spiritual",
      drinking: "Socially",
      smoking: "Never",
    },
    intention: "Life partner",
    verified: true,
    voicePrompt: {
      question: "How to pronounce my name properly 🎙️",
      duration: 14,
      durationLabel: "0:14",
      caption: "Hey! It's pronounced EEE-shaa, soft on the 'sh'. Most people get it wrong on the first try! ✨",
    },
    spotify: {
      anthem: "Kasoor",
      artist: "Prateek Kuhad",
      albumArt: "🎵",
      topArtists: ["Prateek Kuhad", "Tame Impala", "Cigarettes After Sex"],
    },
    smartSparks: [
      "Ask her about the vintage vinyl store she found in Bandra 🎶",
      "Ask what her go-to iced matcha spot is in Mumbai 🍵",
      "Ask where she loves to go for spontaneous 1am drives 🚗",
    ],
  },
  {
    id: "p2",
    name: "Harshita",
    age: 25,
    gender: "female",
    location: "Indiranagar, Bangalore",
    distance: "4 km away",
    photos: [
      "/profiles/harshita/1.jpg",
      "/profiles/harshita/2.jpg",
      "/profiles/harshita/3.jpg",
      "/profiles/harshita/4.jpg",
    ],
    prompts: [
      { question: "Typical Sunday for me", answer: "Morning coffee & book at an Indiranagar cafe → long brisk walk in Cubbon Park → handmade pasta dinner with good wine." },
      { question: "Something that's non-negotiable for me is", answer: "Kindness to waiters, sharp wit, and having passions you get genuinely excited to talk about." },
      { question: "Together we could", answer: "Trade our favorite playlist recommendations and plan an unplanned weekend getaway to Coorg." },
    ],
    vitals: {
      height: "5'6\"",
      work: "Brand Strategist & Writer",
      education: "St. Xavier's Mumbai",
      hometown: "Bangalore",
      religion: "Hindu",
      drinking: "Socially",
      smoking: "Never",
    },
    intention: "Long-term relationship",
    verified: true,
    voicePrompt: {
      question: "My most controversial food opinion 🍝",
      duration: 12,
      durationLabel: "0:12",
      caption: "Authentic handmade cacio e pepe beats fancy truffle pizza any day of the week, hands down.",
    },
    spotify: {
      anthem: "Baarishein",
      artist: "Anuv Jain",
      albumArt: "🌧️",
      topArtists: ["Anuv Jain", "The Local Train", "Coldplay"],
    },
    smartSparks: [
      "Ask for her top handmade pasta recommendation in Indiranagar 🍝",
      "Ask about her favorite morning walk route in Cubbon Park 🌿",
      "Ask what book she's currently reading at the bookstore café 📖",
    ],
  },
  {
    id: "p3",
    name: "Ishika",
    age: 23,
    gender: "female",
    location: "Hauz Khas, Delhi",
    distance: "5 km away",
    photos: [
      "/profiles/ishika/1.jpg",
      "/profiles/ishika/2.jpg",
      "/profiles/ishika/3.jpg",
      "/profiles/ishika/4.jpg",
    ],
    prompts: [
      { question: "My simple pleasures are", answer: "Rooftop kulhad chai at sunset, pottery studio weekends getting clay everywhere, and golden hour light." },
      { question: "The way to win me over is", answer: "Recommend me an obscure indie song that becomes my whole personality for the next three weeks." },
      { question: "I'm looking for someone who", answer: "Matches my energy, doesn't take themselves too seriously, and is down to try new food spots without overthinking." },
    ],
    vitals: {
      height: "5'3\"",
      work: "Visual Artist & Studio Founder",
      education: "Delhi College of Art",
      hometown: "Delhi",
      religion: "Spiritual",
      drinking: "Socially",
      smoking: "Never",
    },
    intention: "Long-term relationship",
    verified: true,
    voicePrompt: {
      question: "The sound of my laugh after bad jokes 😂",
      duration: 15,
      durationLabel: "0:15",
      caption: "Fair warning: I have zero poker face and will laugh at literally the worst puns in existence.",
    },
    spotify: {
      anthem: "Chaand Baaliyan",
      artist: "Aditya A",
      albumArt: "🌙",
      topArtists: ["Aditya A", "When Chai Met Toast", "Leon Bridges"],
    },
    smartSparks: [
      "Ask what ceramic piece she's making next at the pottery studio 🏺",
      "Ask about the sunset rooftop spot in Hauz Khas she loves ☕",
      "Ask for her #1 indie song recommendation right now 🎧",
    ],
  },
];

export const MATCHES = [
  {
    id: "m1",
    matchedWith: PROFILES[0], // Isha
    matchedAt: "2026-08-06T14:30:00Z",
    phase: "talking",
    isActiveConversation: true,
    lastMessage: {
      text: "Haha iced matcha & vintage vinyl records are my weakness! 🍵",
      sender: "p1",
      timestamp: "2026-08-08T09:15:00Z",
      read: true,
    },
  },
  {
    id: "m2",
    matchedWith: PROFILES[1], // Harshita
    matchedAt: "2026-08-05T10:00:00Z",
    phase: "talking",
    isActiveConversation: true,
    lastMessage: {
      text: "Handmade cacio e pepe in Indiranagar sounds incredible! 🍝",
      sender: "p2",
      timestamp: "2026-08-08T11:20:00Z",
      read: true,
    },
  },
  {
    id: "m3",
    matchedWith: PROFILES[2], // Ishika
    matchedAt: "2026-08-07T18:00:00Z",
    phase: "talking",
    isActiveConversation: true,
    lastMessage: {
      text: "That sunset rooftop pottery session in Hauz Khas sounds lovely ✨",
      sender: "user-self",
      timestamp: "2026-08-08T12:05:00Z",
      read: true,
    },
  },
];

export const CONVERSATIONS = {
  m1: {
    matchId: "m1",
    messages: [
      { id: "msg1", sender: "user-self", text: "Hey Isha! Iced matcha and sea breeze at Bandstand is top tier.", timestamp: "2026-08-06T14:35:00Z" },
      { id: "msg2", sender: "p1", text: "Haha right? There's this tiny cafe near Bandra where I always get my matcha. Have you been?", timestamp: "2026-08-06T14:40:00Z" },
      { id: "msg3", sender: "user-self", text: "Is it Subko or Blue Tokai? Both are legendary.", timestamp: "2026-08-06T14:42:00Z" },
      { id: "msg4", sender: "p1", text: "Subko! You know your Bandra spots 😏", timestamp: "2026-08-06T14:45:00Z" },
      { id: "msg5", sender: "user-self", text: "Always! What kind of UX design do you work on?", timestamp: "2026-08-07T10:00:00Z" },
      { id: "msg6", sender: "p1", text: "Haha iced matcha & vintage vinyl records are my weakness! 🍵", timestamp: "2026-08-08T09:15:00Z" },
    ],
  },
  m2: {
    matchId: "m2",
    messages: [
      { id: "msg201", sender: "user-self", text: "Hey Harshita! Cubbon Park morning walks are unbeatable.", timestamp: "2026-08-08T10:00:00Z" },
      { id: "msg202", sender: "p2", text: "Handmade cacio e pepe in Indiranagar sounds incredible! 🍝", timestamp: "2026-08-08T11:20:00Z" },
    ],
  },
  m3: {
    matchId: "m3",
    messages: [
      { id: "msg301", sender: "user-self", text: "Hey Ishika! Loved your pottery prompt 🏺", timestamp: "2026-08-08T12:05:00Z" },
      { id: "msg302", sender: "p3", text: "That sunset rooftop pottery session in Hauz Khas sounds lovely ✨", timestamp: "2026-08-08T12:30:00Z" },
    ],
  },
};

export const INCOMING_LIKES = [
  {
    id: "like1",
    from: PROFILES[0], // Isha
    likedItem: { type: "prompt", question: "A life goal of mine is", comment: "This is rare to see on here. Refreshing." },
    timestamp: "2026-08-08T07:00:00Z",
  },
  {
    id: "like2",
    from: PROFILES[1], // Harshita
    likedItem: { type: "photo", photoIndex: 0, comment: "Love this shot!" },
    timestamp: "2026-08-07T22:00:00Z",
  },
  {
    id: "like3",
    from: PROFILES[2], // Ishika
    likedItem: { type: "prompt", question: "The way to win me over is", comment: "Couldn't agree more 💛" },
    timestamp: "2026-08-07T15:00:00Z",
  },
];

export const PREMIUM_TIERS = [
  {
    id: "lite",
    name: "Lite",
    tagline: "More room to connect",
    monthlyPrice: 499,
    quarterlyPrice: 1199,
    halfYearlyPrice: 1999,
    currency: "₹",
    features: [
      { label: "Talk to 3 people at once", value: 3 },
      { label: "End conversations 3x/week", value: 3 },
      { label: "See all your likes", value: true },
      { label: "Unlimited daily likes", value: true },
      { label: "Advanced filters", value: true },
    ],
    color: "#7C4DFF",
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "For the intentional dater",
    monthlyPrice: 999,
    quarterlyPrice: 2499,
    halfYearlyPrice: 3999,
    currency: "₹",
    popular: true,
    features: [
      { label: "Talk to 5 people at once", value: 5 },
      { label: "End conversations 5x/week", value: 5 },
      { label: "See all your likes", value: true },
      { label: "Unlimited daily likes", value: true },
      { label: "Advanced filters", value: true },
      { label: "Priority in discover feed", value: true },
    ],
    color: "#E8604C",
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "The full experience",
    monthlyPrice: 1999,
    quarterlyPrice: 4999,
    halfYearlyPrice: 7999,
    currency: "₹",
    features: [
      { label: "Talk to 10 people at once", value: 10 },
      { label: "End conversations 7x/week", value: 7 },
      { label: "See all your likes", value: true },
      { label: "Unlimited daily likes", value: true },
      { label: "Advanced filters", value: true },
      { label: "Priority in discover feed", value: true },
      { label: "Profile boost weekly", value: true },
      { label: "See read receipts", value: true },
    ],
    color: "#C4A265",
  },
];

export const PHASE_CONFIG = {
  liking: { label: "Liking", emoji: "💫", color: "var(--phase-liking)", description: "Just matched, exploring" },
  talking: { label: "Talking", emoji: "💬", color: "var(--phase-talking)", description: "Getting to know each other" },
  dating: { label: "Dating", emoji: "🌹", color: "var(--phase-dating)", description: "Going on dates" },
  serious: { label: "Getting Serious", emoji: "💍", color: "var(--phase-serious)", description: "Building a future" },
};

export const STORIES = [
  {
    id: "story_self",
    userId: "user-self",
    userName: "Your Vibe",
    avatar: "/profiles/ananya/1.jpg",
    isSelf: true,
    hasStory: false,
    storyCount: 0,
    stories: [],
  },
  {
    id: "story_isha",
    userId: "p1",
    userName: "Isha",
    avatar: "/profiles/isha/1.jpg",
    location: "Bandra, Mumbai",
    storyCount: 2,
    stories: [
      {
        id: "s_isha_1",
        photo: "/profiles/isha/1.jpg",
        timestamp: "2h ago",
        caption: "Bandra morning brew & finding vintage vinyl records ☕🎶",
        vibe: "Cozy Morning",
      },
      {
        id: "s_isha_2",
        photo: "/profiles/isha/3.jpg",
        timestamp: "5h ago",
        caption: "Street craft market walk in the sunshine 🌻✨",
        vibe: "Golden Hour",
      },
    ],
  },
  {
    id: "story_harshita",
    userId: "p2",
    userName: "Harshita",
    avatar: "/profiles/harshita/1.jpg",
    location: "Indiranagar, Bangalore",
    storyCount: 2,
    stories: [
      {
        id: "s_harshita_1",
        photo: "/profiles/harshita/3.jpg",
        timestamp: "3h ago",
        caption: "Morning 6km run in Cubbon Park before the heat kicks in 🌿🏃‍♀️",
        vibe: "Fresh & Energized",
      },
      {
        id: "s_harshita_2",
        photo: "/profiles/harshita/4.jpg",
        timestamp: "7h ago",
        caption: "Handmade pasta & wine night with the girls 🍷🍝",
        vibe: "Dinner Vibe",
      },
    ],
  },
  {
    id: "story_ishika",
    userId: "p3",
    userName: "Ishika",
    avatar: "/profiles/ishika/1.jpg",
    location: "Hauz Khas, Delhi",
    storyCount: 2,
    stories: [
      {
        id: "s_ishika_1",
        photo: "/profiles/ishika/3.jpg",
        timestamp: "1h ago",
        caption: "Total mess at the pottery studio today but made my first vase! 🏺🤎",
        vibe: "Art Studio",
      },
      {
        id: "s_ishika_2",
        photo: "/profiles/ishika/1.jpg",
        timestamp: "4h ago",
        caption: "Rooftop sunset chai in Hauz Khas overlooking the lake 🌅☕",
        vibe: "Sunset Glow",
      },
    ],
  },
];

export const DUO_PROFILES = [];


