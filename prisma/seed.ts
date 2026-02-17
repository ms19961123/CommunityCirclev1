import { PrismaClient, Role, EventCategory, IndoorOutdoor, EventStatus, RSVPStatus, ReportTargetType, ReportReason, ReportStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysFromNow(days: number, hours = 10, minutes = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding CommunityCircle database...");

  // -----------------------------------------------------------------------
  // 1. Clear all tables in reverse dependency order
  // -----------------------------------------------------------------------
  console.log("Clearing existing data...");
  await prisma.feedback.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.event.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log("All tables cleared.");

  // -----------------------------------------------------------------------
  // 2. Hash the shared password
  // -----------------------------------------------------------------------
  const passwordHash = await bcrypt.hash("password123!", 10);
  const now = new Date();

  const allInterests = ["walks", "playground", "library", "crafts", "sports", "nature", "music", "cooking"];
  const allAgeRanges = ["0-2", "3-5", "6-8", "9-12"];

  // -----------------------------------------------------------------------
  // 3. Create Users + Profiles
  // -----------------------------------------------------------------------
  console.log("Creating users...");

  // -- Admin --
  const admin = await prisma.user.create({
    data: {
      email: "admin@communitycircle.local",
      passwordHash,
      name: "Admin User",
      role: Role.ADMIN,
      profile: {
        create: {
          city: "Philadelphia",
          lat: 39.9526,
          lng: -75.1652,
          radiusMiles: 10,
          interests: ["walks", "playground", "library", "crafts", "sports", "nature", "music", "cooking"],
          kidsAgeRanges: ["0-2", "3-5", "6-8", "9-12"],
          emailVerifiedAt: now,
          trustScore: 10, // email only
        },
      },
    },
  });

  // -- Hosts --
  const hostData = [
    {
      email: "host1@communitycircle.local",
      name: "Sarah Mitchell",
      lat: 39.9490,
      lng: -75.1710,
      radiusMiles: 5,
      interests: ["walks", "playground", "nature", "music"],
      kidsAgeRanges: ["0-2", "3-5"],
      phoneVerified: true,
    },
    {
      email: "host2@communitycircle.local",
      name: "James Rodriguez",
      lat: 39.9560,
      lng: -75.1590,
      radiusMiles: 8,
      interests: ["sports", "playground", "cooking", "nature"],
      kidsAgeRanges: ["3-5", "6-8"],
      phoneVerified: true,
    },
    {
      email: "host3@communitycircle.local",
      name: "Emily Chen",
      lat: 39.9545,
      lng: -75.1680,
      radiusMiles: 3,
      interests: ["library", "crafts", "music", "walks"],
      kidsAgeRanges: ["0-2", "3-5", "6-8"],
      phoneVerified: true,
    },
    {
      email: "host4@communitycircle.local",
      name: "Marcus Johnson",
      lat: 39.9470,
      lng: -75.1625,
      radiusMiles: 6,
      interests: ["sports", "nature", "playground", "cooking"],
      kidsAgeRanges: ["6-8", "9-12"],
      phoneVerified: false,
    },
    {
      email: "host5@communitycircle.local",
      name: "Priya Patel",
      lat: 39.9580,
      lng: -75.1700,
      radiusMiles: 4,
      interests: ["crafts", "library", "music", "walks"],
      kidsAgeRanges: ["0-2", "3-5"],
      phoneVerified: false,
    },
  ];

  const hosts: Awaited<ReturnType<typeof prisma.user.create>>[] = [];

  for (const h of hostData) {
    const trustScore = 10 + (h.phoneVerified ? 20 : 0); // email(10) + phone(20)
    const user = await prisma.user.create({
      data: {
        email: h.email,
        passwordHash,
        name: h.name,
        role: Role.HOST,
        profile: {
          create: {
            city: "Philadelphia",
            lat: h.lat,
            lng: h.lng,
            radiusMiles: h.radiusMiles,
            interests: h.interests,
            kidsAgeRanges: h.kidsAgeRanges,
            emailVerifiedAt: now,
            phoneVerifiedAt: h.phoneVerified ? now : null,
            trustScore,
          },
        },
      },
    });
    hosts.push(user);
  }

  // -- Regular users (for RSVPs) --
  const regularUserData = [
    {
      email: "user1@communitycircle.local",
      name: "Olivia Barnes",
      lat: 39.9510,
      lng: -75.1640,
      radiusMiles: 5,
      interests: ["walks", "playground", "music"],
      kidsAgeRanges: ["0-2", "3-5"],
    },
    {
      email: "user2@communitycircle.local",
      name: "David Kim",
      lat: 39.9535,
      lng: -75.1695,
      radiusMiles: 7,
      interests: ["sports", "nature", "cooking"],
      kidsAgeRanges: ["6-8", "9-12"],
    },
    {
      email: "user3@communitycircle.local",
      name: "Amara Okafor",
      lat: 39.9550,
      lng: -75.1615,
      radiusMiles: 4,
      interests: ["crafts", "library", "playground"],
      kidsAgeRanges: ["3-5", "6-8"],
    },
  ];

  const regularUsers: Awaited<ReturnType<typeof prisma.user.create>>[] = [];

  for (const u of regularUserData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: Role.USER,
        profile: {
          create: {
            city: "Philadelphia",
            lat: u.lat,
            lng: u.lng,
            radiusMiles: u.radiusMiles,
            interests: u.interests,
            kidsAgeRanges: u.kidsAgeRanges,
            emailVerifiedAt: now,
            trustScore: 10,
          },
        },
      },
    });
    regularUsers.push(user);
  }

  const allUsers = [admin, ...hosts, ...regularUsers];
  console.log(`Created ${allUsers.length} users (1 admin, 5 hosts, 3 regular).`);

  // -----------------------------------------------------------------------
  // 4. Create Events
  // -----------------------------------------------------------------------
  console.log("Creating events...");

  const eventDefs = [
    // --- Past events (for feedback demo) ---
    {
      hostIdx: 0, // Sarah Mitchell
      title: "Morning Stroller Walk at Rittenhouse",
      description: "A relaxed morning walk around Rittenhouse Square for parents with strollers. We will loop the park twice at a gentle pace, stopping at the fountain for a snack break. Great way to meet other new parents in the neighborhood.",
      category: EventCategory.WALK,
      startAt: daysFromNow(-5, 9, 30),
      durationMins: 60,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 0,
      ageMax: 3,
      maxAttendees: 12,
      noDevices: false,
      locationLabelPublic: "Rittenhouse Square",
      locationNotesPrivate: "Meet at the goat statue on the south side of the square, near 18th and Walnut entrance.",
      lat: 39.9496,
      lng: -75.1718,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 1, // James Rodriguez
      title: "Saturday Soccer Kickabout at Clark Park",
      description: "Informal soccer for kids ages 5-10. Bring your own water bottle and shin guards if you have them. We will split into small teams and focus on fun over competition. Parents welcome to join!",
      category: EventCategory.SPORTS,
      startAt: daysFromNow(-3, 10, 0),
      durationMins: 90,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 5,
      ageMax: 10,
      maxAttendees: 16,
      noDevices: true,
      locationLabelPublic: "Clark Park - Bowl Area",
      locationNotesPrivate: "Meet at the lower bowl field near the Chester Ave side. Look for the orange cones.",
      lat: 39.9487,
      lng: -75.2094,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 2, // Emily Chen
      title: "Toddler Story Time at Free Library",
      description: "Join us for a cozy story time session at the Free Library of Philadelphia. We will read three picture books, followed by a simple craft activity related to the stories. Ideal for toddlers and preschoolers.",
      category: EventCategory.LIBRARY,
      startAt: daysFromNow(-7, 10, 30),
      durationMins: 45,
      indoorOutdoor: IndoorOutdoor.INDOOR,
      ageMin: 1,
      ageMax: 4,
      maxAttendees: 10,
      noDevices: true,
      locationLabelPublic: "Free Library of Philadelphia - Main Branch",
      locationNotesPrivate: "Childrens section on the 1st floor. Head to the reading nook in the back left corner.",
      lat: 39.9607,
      lng: -75.1709,
      status: EventStatus.ACTIVE,
    },
    // --- Future events ---
    {
      hostIdx: 0, // Sarah Mitchell
      title: "Sunset Stroll along Schuylkill River Trail",
      description: "An evening walk along the scenic Schuylkill River Trail. Perfect for winding down after a long day. Kid-friendly pace with plenty of stops to watch the rowers. Bring a light jacket for the breeze off the water.",
      category: EventCategory.WALK,
      startAt: daysFromNow(1, 17, 0),
      durationMins: 75,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 0,
      ageMax: 8,
      maxAttendees: 10,
      noDevices: false,
      locationLabelPublic: "Schuylkill River Trail - South St Bridge",
      locationNotesPrivate: "Meet at the trail entrance under the South Street Bridge on the west bank. Near the mural.",
      lat: 39.9443,
      lng: -75.1836,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 1, // James Rodriguez
      title: "Playground Meetup at Smith Memorial",
      description: "Open play at the Smith Memorial Playground, one of Philly's best-kept secrets for kids. The giant wooden slide is a must-try. Parents can chat while kids explore the enclosed play area safely.",
      category: EventCategory.PLAYGROUND,
      startAt: daysFromNow(2, 10, 0),
      durationMins: 120,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 2,
      ageMax: 10,
      maxAttendees: 20,
      noDevices: true,
      locationLabelPublic: "Smith Memorial Playground, Fairmount Park",
      locationNotesPrivate: "Enter through the main gate on N 33rd St. We will be near the big slide area. Look for the CommunityCircle sign.",
      lat: 39.9810,
      lng: -75.1899,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 2, // Emily Chen
      title: "Craft Swap & Play Date",
      description: "Bring craft supplies you no longer need and swap with other families! We will also set up tables for freeform crafting. Glue, scissors, and paper provided. A great way to recycle and get creative.",
      category: EventCategory.CRAFTS,
      startAt: daysFromNow(3, 14, 0),
      durationMins: 90,
      indoorOutdoor: IndoorOutdoor.INDOOR,
      ageMin: 3,
      ageMax: 9,
      maxAttendees: 15,
      noDevices: false,
      locationLabelPublic: "Spruce Hill Community Center",
      locationNotesPrivate: "Large community room on the 2nd floor. Take the elevator or stairs to the right of the lobby entrance.",
      lat: 39.9512,
      lng: -75.2118,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 3, // Marcus Johnson
      title: "Flag Football at FDR Park",
      description: "Non-contact flag football for kids who love to run. All skill levels welcome. We supply flags and a soft football. Emphasizing teamwork and good sportsmanship. Bring water and sunscreen!",
      category: EventCategory.SPORTS,
      startAt: daysFromNow(4, 9, 0),
      durationMins: 90,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 6,
      ageMax: 12,
      maxAttendees: 18,
      noDevices: true,
      locationLabelPublic: "FDR Park - Open Fields",
      locationNotesPrivate: "Park at the Pattison Ave lot and walk east toward the open field near the boathouse. We will have orange cones marking the field.",
      lat: 39.9050,
      lng: -75.1780,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 4, // Priya Patel
      title: "Baby Rhyme & Rhythm Circle",
      description: "A gentle music session for babies and toddlers. We will sing nursery rhymes, play with shakers and tambourines, and practice simple hand-clap songs. No musical experience needed from parents!",
      category: EventCategory.OTHER,
      startAt: daysFromNow(5, 11, 0),
      durationMins: 40,
      indoorOutdoor: IndoorOutdoor.INDOOR,
      ageMin: 0,
      ageMax: 2,
      maxAttendees: 8,
      noDevices: true,
      locationLabelPublic: "South Philadelphia Library Branch",
      locationNotesPrivate: "Basement activity room, accessible through the side entrance on Broad Street. Ring the bell if the door is locked.",
      lat: 39.9290,
      lng: -75.1651,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 0, // Sarah Mitchell
      title: "Weekend Nature Walk at Wissahickon",
      description: "Explore the beautiful Wissahickon Valley Park trails! We will take the Forbidden Drive path, which is flat and stroller-friendly. Expect to see birds, turtles, and maybe even a deer. Bring binoculars if you have them.",
      category: EventCategory.WALK,
      startAt: daysFromNow(7, 9, 0),
      durationMins: 90,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 0,
      ageMax: 10,
      maxAttendees: 14,
      noDevices: false,
      locationLabelPublic: "Wissahickon Valley Park - Valley Green Inn",
      locationNotesPrivate: "Meet at the parking lot by Valley Green Inn. We gather near the wooden bridge. Parking fills up fast, arrive 10 min early.",
      lat: 40.0531,
      lng: -75.2135,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 3, // Marcus Johnson
      title: "Basketball Drills for Beginners",
      description: "Beginner-friendly basketball at the outdoor courts. We will practice dribbling, passing, and shooting in a low-pressure environment. Kids will be grouped by age for drills. Bring your own basketball if you have one.",
      category: EventCategory.SPORTS,
      startAt: daysFromNow(8, 16, 0),
      durationMins: 60,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 7,
      ageMax: 12,
      maxAttendees: 12,
      noDevices: true,
      locationLabelPublic: "Starr Garden Recreation Center Courts",
      locationNotesPrivate: "Outdoor courts on Lombard St side. Enter through the gate near the water fountain.",
      lat: 39.9426,
      lng: -75.1580,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 4, // Priya Patel
      title: "Paint & Snack: Watercolor for Little Ones",
      description: "A laid-back watercolor painting session paired with healthy snacks. We provide washable paints, brushes, and thick paper. Kids create their own mini masterpieces to take home. Smocks recommended but not required!",
      category: EventCategory.CRAFTS,
      startAt: daysFromNow(9, 10, 0),
      durationMins: 60,
      indoorOutdoor: IndoorOutdoor.INDOOR,
      ageMin: 3,
      ageMax: 7,
      maxAttendees: 10,
      noDevices: false,
      locationLabelPublic: "Cedar Park Cafe - Back Room",
      locationNotesPrivate: "Enter through the main cafe entrance and head to the back room past the counter. We will have a reserved sign on the tables.",
      lat: 39.9501,
      lng: -75.2157,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 2, // Emily Chen
      title: "Read-Aloud & Puppet Show",
      description: "A special interactive story session where kids help act out the story using hand puppets! This month we are reading a tale about friendship and sharing. Each child gets to take home a small craft puppet.",
      category: EventCategory.LIBRARY,
      startAt: daysFromNow(10, 10, 0),
      durationMins: 50,
      indoorOutdoor: IndoorOutdoor.INDOOR,
      ageMin: 2,
      ageMax: 6,
      maxAttendees: 12,
      noDevices: true,
      locationLabelPublic: "Chestnut Hill Library",
      locationNotesPrivate: "Community room on the main floor, through the double doors on the right after you enter. Ask at the front desk if lost.",
      lat: 40.0715,
      lng: -75.2077,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 1, // James Rodriguez
      title: "Spruce Street Harbor Playground Hangout",
      description: "Casual hangout at the waterfront playground near Spruce Street Harbor Park. Kids can play on the swings and climbing structures while parents relax with a coffee from the nearby vendors. Stay as long as you like!",
      category: EventCategory.PLAYGROUND,
      startAt: daysFromNow(12, 15, 30),
      durationMins: 120,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 2,
      ageMax: 8,
      maxAttendees: 15,
      noDevices: false,
      locationLabelPublic: "Spruce Street Harbor Park",
      locationNotesPrivate: "Head to the playground area at the south end of the park near the colorful hammocks. We will be at the picnic tables closest to the water.",
      lat: 39.9451,
      lng: -75.1414,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 3, // Marcus Johnson
      title: "Bike Ride on the Schuylkill Banks",
      description: "A family-friendly group bike ride along the Schuylkill Banks Boardwalk. Helmets required for all riders. We ride at a slow pace with frequent stops. Training wheels and balance bikes totally fine!",
      category: EventCategory.SPORTS,
      startAt: daysFromNow(14, 8, 30),
      durationMins: 75,
      indoorOutdoor: IndoorOutdoor.OUTDOOR,
      ageMin: 4,
      ageMax: 12,
      maxAttendees: 10,
      noDevices: true,
      locationLabelPublic: "Schuylkill Banks Boardwalk",
      locationNotesPrivate: "Meet at the Walnut Street entrance to the boardwalk. We gather by the information kiosk. Bike racks available if you arrive early.",
      lat: 39.9510,
      lng: -75.1830,
      status: EventStatus.ACTIVE,
    },
    {
      hostIdx: 4, // Priya Patel  -- CANCELLED event
      title: "Cooking Together: Kid-Friendly Dumplings",
      description: "A hands-on cooking class where families make simple vegetable dumplings together. All ingredients and tools provided. Allergy-friendly recipe (no nuts, dairy-free option available). Take your creations home to cook!",
      category: EventCategory.OTHER,
      startAt: daysFromNow(6, 11, 0),
      durationMins: 75,
      indoorOutdoor: IndoorOutdoor.INDOOR,
      ageMin: 4,
      ageMax: 10,
      maxAttendees: 8,
      noDevices: true,
      locationLabelPublic: "Greensgrow Community Kitchen",
      locationNotesPrivate: "Kitchen space at the back of the Greensgrow Farms building on E Cumberland St. Enter through the greenhouse and go straight.",
      lat: 39.9794,
      lng: -75.1335,
      status: EventStatus.CANCELLED,
    },
  ];

  const events: Awaited<ReturnType<typeof prisma.event.create>>[] = [];

  for (const def of eventDefs) {
    const event = await prisma.event.create({
      data: {
        hostUserId: hosts[def.hostIdx].id,
        title: def.title,
        description: def.description,
        category: def.category,
        startAt: def.startAt,
        durationMins: def.durationMins,
        indoorOutdoor: def.indoorOutdoor,
        ageMin: def.ageMin,
        ageMax: def.ageMax,
        maxAttendees: def.maxAttendees,
        noDevices: def.noDevices,
        locationLabelPublic: def.locationLabelPublic,
        locationNotesPrivate: def.locationNotesPrivate,
        lat: def.lat,
        lng: def.lng,
        status: def.status,
      },
    });
    events.push(event);
  }

  console.log(`Created ${events.length} events.`);

  // -----------------------------------------------------------------------
  // 5. Create RSVPs (30 total)
  // -----------------------------------------------------------------------
  console.log("Creating RSVPs...");

  // Build a pool of non-host users for RSVPs (regular users can RSVP to any event)
  // Hosts can also RSVP to other hosts' events
  const rsvpDefs: { eventIdx: number; userId: string; status: RSVPStatus }[] = [
    // Past event 0: Morning Stroller Walk at Rittenhouse (host0 - Sarah)
    { eventIdx: 0, userId: hosts[1].id, status: RSVPStatus.GOING },
    { eventIdx: 0, userId: hosts[2].id, status: RSVPStatus.GOING },
    { eventIdx: 0, userId: regularUsers[0].id, status: RSVPStatus.GOING },
    { eventIdx: 0, userId: regularUsers[2].id, status: RSVPStatus.GOING },

    // Past event 1: Saturday Soccer at Clark Park (host1 - James)
    { eventIdx: 1, userId: hosts[3].id, status: RSVPStatus.GOING },
    { eventIdx: 1, userId: regularUsers[1].id, status: RSVPStatus.GOING },
    { eventIdx: 1, userId: regularUsers[2].id, status: RSVPStatus.GOING },

    // Past event 2: Toddler Story Time (host2 - Emily)
    { eventIdx: 2, userId: hosts[4].id, status: RSVPStatus.GOING },
    { eventIdx: 2, userId: regularUsers[0].id, status: RSVPStatus.GOING },
    { eventIdx: 2, userId: regularUsers[2].id, status: RSVPStatus.GOING },

    // Future event 3: Sunset Stroll (host0 - Sarah)
    { eventIdx: 3, userId: hosts[2].id, status: RSVPStatus.GOING },
    { eventIdx: 3, userId: regularUsers[0].id, status: RSVPStatus.GOING },

    // Future event 4: Playground Meetup at Smith (host1 - James)
    { eventIdx: 4, userId: hosts[0].id, status: RSVPStatus.GOING },
    { eventIdx: 4, userId: hosts[3].id, status: RSVPStatus.GOING },
    { eventIdx: 4, userId: regularUsers[0].id, status: RSVPStatus.GOING },
    { eventIdx: 4, userId: regularUsers[1].id, status: RSVPStatus.GOING },
    { eventIdx: 4, userId: regularUsers[2].id, status: RSVPStatus.GOING },

    // Future event 5: Craft Swap (host2 - Emily)
    { eventIdx: 5, userId: hosts[4].id, status: RSVPStatus.GOING },
    { eventIdx: 5, userId: regularUsers[2].id, status: RSVPStatus.GOING },

    // Future event 6: Flag Football (host3 - Marcus)
    { eventIdx: 6, userId: hosts[1].id, status: RSVPStatus.GOING },
    { eventIdx: 6, userId: regularUsers[1].id, status: RSVPStatus.GOING },

    // Future event 7: Baby Rhyme Circle (host4 - Priya)
    { eventIdx: 7, userId: hosts[0].id, status: RSVPStatus.GOING },
    { eventIdx: 7, userId: regularUsers[0].id, status: RSVPStatus.GOING },

    // Future event 8: Nature Walk Wissahickon (host0 - Sarah)
    { eventIdx: 8, userId: hosts[2].id, status: RSVPStatus.GOING },
    { eventIdx: 8, userId: hosts[4].id, status: RSVPStatus.GOING },
    { eventIdx: 8, userId: regularUsers[1].id, status: RSVPStatus.GOING },

    // Future event 9: Basketball Drills (host3 - Marcus)
    { eventIdx: 9, userId: regularUsers[1].id, status: RSVPStatus.GOING },

    // Future event 12: Spruce Street Harbor (host1 - James)
    { eventIdx: 12, userId: hosts[0].id, status: RSVPStatus.GOING },
    { eventIdx: 12, userId: regularUsers[0].id, status: RSVPStatus.CANCELLED },

    // Future event 13: Bike Ride (host3 - Marcus)
    { eventIdx: 13, userId: regularUsers[1].id, status: RSVPStatus.GOING },
  ];

  for (const r of rsvpDefs) {
    await prisma.rSVP.create({
      data: {
        eventId: events[r.eventIdx].id,
        userId: r.userId,
        status: r.status,
      },
    });
  }

  console.log(`Created ${rsvpDefs.length} RSVPs.`);

  // -----------------------------------------------------------------------
  // 6. Create MessageThreads (4) and Messages (10)
  // -----------------------------------------------------------------------
  console.log("Creating message threads and messages...");

  // Thread for event 0: Morning Stroller Walk (past)
  const thread0 = await prisma.messageThread.create({
    data: { eventId: events[0].id },
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread0.id,
        senderUserId: hosts[0].id, // Sarah (host)
        body: "Hey everyone! Looking forward to our walk tomorrow morning. The weather looks great - sunny and mid-60s.",
        createdAt: daysFromNow(-6, 18, 0),
      },
      {
        threadId: thread0.id,
        senderUserId: regularUsers[0].id, // Olivia
        body: "Awesome, we will be there! Should I bring anything for the snack break?",
        createdAt: daysFromNow(-6, 18, 30),
      },
      {
        threadId: thread0.id,
        senderUserId: hosts[0].id,
        body: "Just whatever your little one likes to munch on. I will bring some extra fruit pouches in case anyone forgets.",
        createdAt: daysFromNow(-6, 19, 0),
      },
    ],
  });

  // Thread for event 4: Playground Meetup at Smith (future)
  const thread4 = await prisma.messageThread.create({
    data: { eventId: events[4].id },
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread4.id,
        senderUserId: hosts[1].id, // James (host)
        body: "Reminder: the giant wooden slide can get a bit slippery after rain. I will bring some towels just in case!",
        createdAt: daysFromNow(-1, 12, 0),
      },
      {
        threadId: thread4.id,
        senderUserId: hosts[3].id, // Marcus
        body: "Great idea. My kids are so excited for this. First time at Smith Memorial for us!",
        createdAt: daysFromNow(-1, 14, 0),
      },
    ],
  });

  // Thread for event 5: Craft Swap (future)
  const thread5 = await prisma.messageThread.create({
    data: { eventId: events[5].id },
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread5.id,
        senderUserId: hosts[2].id, // Emily (host)
        body: "I have a ton of pipe cleaners, googly eyes, and felt sheets to bring. What is everyone else contributing?",
        createdAt: daysFromNow(-1, 10, 0),
      },
      {
        threadId: thread5.id,
        senderUserId: regularUsers[2].id, // Amara
        body: "We have stacks of construction paper and some stamp sets. Can not wait!",
        createdAt: daysFromNow(-1, 11, 15),
      },
    ],
  });

  // Thread for event 8: Nature Walk at Wissahickon (future)
  const thread8 = await prisma.messageThread.create({
    data: { eventId: events[8].id },
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread8.id,
        senderUserId: hosts[0].id, // Sarah (host)
        body: "FYI parking at Valley Green fills up fast on weekends. I recommend arriving by 8:45 to grab a spot.",
        createdAt: daysFromNow(0, 9, 0),
      },
      {
        threadId: thread8.id,
        senderUserId: hosts[4].id, // Priya
        body: "Thanks for the heads up. We might bike over from Manayunk instead. See you there!",
        createdAt: daysFromNow(0, 10, 30),
      },
    ],
  });

  console.log("Created 4 message threads with 10 messages.");

  // -----------------------------------------------------------------------
  // 7. Create Reports (5)
  // -----------------------------------------------------------------------
  console.log("Creating reports...");

  // Report 1: OPEN - user reports another user for harassment
  await prisma.report.create({
    data: {
      reporterUserId: regularUsers[0].id, // Olivia
      targetType: ReportTargetType.USER,
      targetId: regularUsers[1].id, // David (target)
      reason: ReportReason.HARASSMENT,
      notes: "This user made several uncomfortable comments during the soccer event about my parenting style. Made me feel unwelcome.",
      status: ReportStatus.OPEN,
    },
  });

  // Report 2: RESOLVED - spam event reported
  await prisma.report.create({
    data: {
      reporterUserId: hosts[2].id, // Emily
      targetType: ReportTargetType.EVENT,
      targetId: events[14].id, // Cancelled cooking event
      reason: ReportReason.SPAM,
      notes: "Event description was edited to include promotional links for a commercial cooking class. Not appropriate for our community.",
      status: ReportStatus.RESOLVED,
      resolvedAt: daysFromNow(-1, 14, 0),
      resolvedByUserId: admin.id,
    },
  });

  // Report 3: OPEN - unsafe behavior at event
  await prisma.report.create({
    data: {
      reporterUserId: regularUsers[2].id, // Amara
      targetType: ReportTargetType.EVENT,
      targetId: events[1].id, // Soccer event
      reason: ReportReason.UNSAFE,
      notes: "Some older kids were playing too rough during the soccer game and a younger child got knocked over. The host did not intervene quickly enough.",
      status: ReportStatus.OPEN,
    },
  });

  // Report 4: RESOLVED - political content
  await prisma.report.create({
    data: {
      reporterUserId: hosts[0].id, // Sarah
      targetType: ReportTargetType.USER,
      targetId: hosts[3].id, // Marcus (target)
      reason: ReportReason.POLITICS,
      notes: "User was distributing political flyers at a playground meetup. This is supposed to be a non-partisan community space.",
      status: ReportStatus.RESOLVED,
      resolvedAt: daysFromNow(-2, 10, 0),
      resolvedByUserId: admin.id,
    },
  });

  // Report 5: OPEN - other concern
  await prisma.report.create({
    data: {
      reporterUserId: hosts[4].id, // Priya
      targetType: ReportTargetType.USER,
      targetId: regularUsers[1].id, // David (target)
      reason: ReportReason.OTHER,
      notes: "This user has been creating duplicate accounts and RSVPing to events with different profiles. Seems like they are trying to game the attendance system.",
      status: ReportStatus.OPEN,
    },
  });

  console.log("Created 5 reports.");

  // -----------------------------------------------------------------------
  // 8. Create Feedback (10 entries for past events)
  // -----------------------------------------------------------------------
  console.log("Creating feedback...");

  const feedbackTags = ["safe", "welcoming", "kid-loved", "well-organized", "fun"];

  const feedbackDefs = [
    // Event 0: Morning Stroller Walk at Rittenhouse (past, host0 - Sarah)
    { eventIdx: 0, userId: hosts[1].id, rating: 5, tags: ["safe", "welcoming", "fun"] },
    { eventIdx: 0, userId: hosts[2].id, rating: 5, tags: ["well-organized", "welcoming", "kid-loved"] },
    { eventIdx: 0, userId: regularUsers[0].id, rating: 4, tags: ["safe", "fun"] },
    { eventIdx: 0, userId: regularUsers[2].id, rating: 4, tags: ["welcoming", "kid-loved"] },

    // Event 1: Saturday Soccer at Clark Park (past, host1 - James)
    { eventIdx: 1, userId: hosts[3].id, rating: 3, tags: ["fun"] },
    { eventIdx: 1, userId: regularUsers[1].id, rating: 4, tags: ["fun", "kid-loved"] },
    { eventIdx: 1, userId: regularUsers[2].id, rating: 3, tags: ["fun"] },

    // Event 2: Toddler Story Time at Free Library (past, host2 - Emily)
    { eventIdx: 2, userId: hosts[4].id, rating: 5, tags: ["safe", "welcoming", "well-organized", "kid-loved"] },
    { eventIdx: 2, userId: regularUsers[0].id, rating: 5, tags: ["welcoming", "kid-loved", "well-organized"] },
    { eventIdx: 2, userId: regularUsers[2].id, rating: 4, tags: ["safe", "welcoming", "fun"] },
  ];

  for (const fb of feedbackDefs) {
    await prisma.feedback.create({
      data: {
        eventId: events[fb.eventIdx].id,
        userId: fb.userId,
        rating: fb.rating,
        tags: fb.tags,
      },
    });
  }

  console.log(`Created ${feedbackDefs.length} feedback entries.`);

  // -----------------------------------------------------------------------
  // Done
  // -----------------------------------------------------------------------
  console.log("\nSeed complete!");
  console.log("  Users:    9 (1 admin, 5 hosts, 3 regular)");
  console.log("  Events:  15 (3 past, 11 future, 1 cancelled)");
  console.log("  RSVPs:   30");
  console.log("  Threads:  4 (10 messages)");
  console.log("  Reports:  5");
  console.log("  Feedback: 10");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
