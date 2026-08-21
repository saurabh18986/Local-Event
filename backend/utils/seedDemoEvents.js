const Event = require('../models/Event');
const User = require('../models/User');

const seedDemoEvents = async () => {
  try {
    const count = await Event.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Database already has ${count} events. Skipping auto-seed.`);
      return;
    }

    // Ensure a host user exists
    let host = await User.findOne({ email: 'demohost@localeventhub.com' });
    if (!host) {
      host = await User.create({
        name: 'Aarav Sharma (Demo Host)',
        email: 'demohost@localeventhub.com',
        password: 'Password123!',
        bio: 'Event organizer & community builder for music, tech, and art events.',
        location: 'Mumbai, India',
        reputationScore: 4.9,
        totalReviews: 12,
      });
    }

    const now = new Date();
    const addDays = (days, hours = 18) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      d.setHours(hours, 0, 0, 0);
      return d;
    };

    const demoEvents = [
      {
        title: '🎸 Sunset Indie Acoustic Night',
        description: 'Join us for an intimate evening of acoustic music, original indie songs, and cozy vibes at the seafront amphitheatre. Bring your friends, enjoy warm tea and coffee, and listen to rising indie artists performing live under the stars.',
        creator: host._id,
        date: addDays(2, 19),
        endDate: addDays(2, 22),
        location: {
          address: 'Marine Drive Open Amphitheatre, Mumbai, Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.823, 18.943] },
        },
        tags: ['music', 'meetup'],
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        capacity: 50,
        price: 299,
        isFree: false,
        averageRating: 4.8,
        totalReviews: 8,
      },
      {
        title: '🚀 React & AI Builders Community Meetup',
        description: 'Calling all frontend developers, AI enthusiasts, and tech founders! We are hosting a 3-hour meetup featuring talks on building modern React web apps, AI agent integration, networking, and free pizza.',
        creator: host._id,
        date: addDays(4, 18),
        endDate: addDays(4, 21),
        location: {
          address: 'TechHub Innovation Center, HSR Layout, Bengaluru, Karnataka',
          coordinates: { type: 'Point', coordinates: [77.638, 12.912] },
        },
        tags: ['technology', 'networking', 'workshop'],
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
        capacity: 100,
        price: 0,
        isFree: true,
        averageRating: 4.9,
        totalReviews: 15,
      },
      {
        title: '🎨 Handmade Clay & Fluid Art Workshop',
        description: 'Unleash your creativity! Learn the basics of pottery wheel spinning and fluid acrylic painting. All art materials (clay, paints, canvas) are provided. Take home your own custom handcrafted souvenir!',
        creator: host._id,
        date: addDays(6, 11),
        endDate: addDays(6, 14),
        location: {
          address: 'Connaught Place Art Studio, Inner Circle, New Delhi',
          coordinates: { type: 'Point', coordinates: [77.219, 28.632] },
        },
        tags: ['art', 'workshop'],
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
        capacity: 25,
        price: 499,
        isFree: false,
        averageRating: 5.0,
        totalReviews: 6,
      },
      {
        title: '🧘 Morning Sunrise Yoga & Meditation in the Park',
        description: 'Start your weekend with clarity and peace. Guided by certified yoga instructors, this 90-minute session focuses on gentle Hatha yoga postures, pranayama breathing, and outdoor mindfulness.',
        creator: host._id,
        date: addDays(3, 7),
        endDate: addDays(3, 9),
        location: {
          address: 'Cubbon Park Bandstand Lawn, Bengaluru, Karnataka',
          coordinates: { type: 'Point', coordinates: [77.592, 12.976] },
        },
        tags: ['sports', 'meetup'],
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
        capacity: 60,
        price: 0,
        isFree: true,
        averageRating: 4.7,
        totalReviews: 11,
      },
      {
        title: '🍜 Old City Street Food & Cultural Trail',
        description: 'Explore secret culinary gems, century-old sweet shops, and iconic street food stalls on an expert-guided walking tour. Ticket includes tastings of 8 classic local dishes!',
        creator: host._id,
        date: addDays(8, 17),
        endDate: addDays(8, 20),
        location: {
          address: 'Chandni Chowk Heritage Precinct, Old Delhi',
          coordinates: { type: 'Point', coordinates: [77.23, 28.65] },
        },
        tags: ['food', 'meetup'],
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        capacity: 20,
        price: 399,
        isFree: false,
        averageRating: 4.9,
        totalReviews: 19,
      },
      {
        title: '💻 24-Hour AI & Full-Stack Hackathon',
        description: 'Build innovative web apps using AI tools, compete for cash prizes up to ₹1,00,000, meet industry mentors, and get hired by fast-growing startups! Meals, snacks, and Wi-Fi provided.',
        creator: host._id,
        date: addDays(12, 10),
        endDate: addDays(13, 10),
        location: {
          address: 'Cyber City Innovation Hub, DLF Phase 2, Gurgaon, Haryana',
          coordinates: { type: 'Point', coordinates: [77.088, 28.495] },
        },
        tags: ['technology', 'workshop', 'networking'],
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
        capacity: 150,
        price: 0,
        isFree: true,
        averageRating: 4.8,
        totalReviews: 24,
      },
    ];

    const insertedEvents = await Event.insertMany(demoEvents);
    // Link created events to host user
    const eventIds = insertedEvents.map((e) => e._id);
    await User.findByIdAndUpdate(host._id, { createdEvents: eventIds });

    console.log(`🎉 Successfully seeded ${insertedEvents.length} demo events!`);
  } catch (err) {
    console.error('❌ Failed to seed demo events:', err.message);
  }
};

module.exports = seedDemoEvents;
