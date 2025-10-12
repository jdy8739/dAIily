import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const samplePosts = [
  {
    title: "First Week at Tech Startup",
    content:
      "Today I learned about our microservices architecture. It's overwhelming but exciting! Met the team and they're all very welcoming. Can't wait to contribute.",
  },
  {
    title: "Completed First Code Review",
    content:
      "Got my first PR merged today! The code review process taught me so much about writing clean, maintainable code. Senior dev gave great feedback on naming conventions.",
  },
  {
    title: "Learning TypeScript",
    content:
      "Diving deep into TypeScript generics. It's challenging but I'm starting to see why type safety matters in large codebases. Made fewer runtime errors today!",
  },
  {
    title: "Presented at Team Meeting",
    content:
      "Presented my solution for the authentication bug. Was nervous but the team was supportive. Got positive feedback on my debugging approach.",
  },
  {
    title: "Pair Programming Session",
    content:
      "Paired with Sarah on the new feature. Learning so much by watching how experienced developers think through problems. Great collaborative experience.",
  },
  {
    title: "Database Optimization Win",
    content:
      "Optimized a slow query today - reduced load time from 3s to 200ms! Understanding indexes better now. Performance matters!",
  },
  {
    title: "Attended Tech Conference",
    content:
      "Amazing talks on serverless architecture and edge computing. Networking with other developers was inspiring. Lots of new ideas to bring back to the team.",
  },
  {
    title: "Debugging Production Issue",
    content:
      "Stayed late to fix a critical bug in production. Stressful but learned the importance of proper logging and monitoring. We caught it early thanks to alerts.",
  },
  {
    title: "Mastered Docker Containers",
    content:
      "Finally understand Docker! Set up our dev environment with docker-compose. No more 'works on my machine' problems.",
  },
  {
    title: "Started Mentoring Intern",
    content:
      "Started mentoring a new intern today. Teaching others really solidifies your own knowledge. It's rewarding to help someone grow.",
  },
  {
    title: "Implemented CI/CD Pipeline",
    content:
      "Set up GitHub Actions for automated testing and deployment. Feels great to automate repetitive tasks and improve our workflow.",
  },
  {
    title: "Learning System Design",
    content:
      "Deep dive into system design patterns. Understanding trade-offs between consistency and availability. Designing scalable systems is an art!",
  },
  {
    title: "Open Source Contribution",
    content:
      "Made my first open source contribution! Fixed a small bug in a library we use. The maintainer was super helpful. Excited to contribute more.",
  },
  {
    title: "Refactored Legacy Code",
    content:
      "Spent the day refactoring old code. It's not glamorous but necessary. Improved test coverage from 40% to 85%. Clean code feels good!",
  },
  {
    title: "Launched New Feature",
    content:
      "Our team launched the new dashboard feature today! Seeing real users benefit from code I wrote is incredibly fulfilling. All the hard work paid off.",
  },
  {
    title: "Learning GraphQL",
    content:
      "Switching from REST to GraphQL. The learning curve is steep but the flexibility is amazing. No more over-fetching data!",
  },
  {
    title: "Performance Monitoring Setup",
    content:
      "Implemented APM monitoring with DataDog. Now we can track performance metrics in real-time. Proactive monitoring prevents issues!",
  },
  {
    title: "Architecture Decision Record",
    content:
      "Wrote my first ADR for choosing between SQL and NoSQL. Documenting decisions helps future developers understand the why behind choices.",
  },
  {
    title: "Code Challenge Success",
    content:
      "Solved a hard LeetCode problem today! Improving my algorithm skills is paying off. Data structures are starting to click.",
  },
  {
    title: "Cross-Team Collaboration",
    content:
      "Worked with the design team on new UI components. Understanding design thinking helps me build better user experiences. Great collaboration!",
  },
  {
    title: "Security Audit Learning",
    content:
      "Participated in security audit today. Learned about SQL injection, XSS, and CSRF protection. Security must be built in, not bolted on!",
  },
  {
    title: "Microservice Migration",
    content:
      "Started breaking down the monolith into microservices. Complex but necessary for scalability. Understanding bounded contexts better now.",
  },
  {
    title: "API Design Workshop",
    content:
      "Attended API design workshop. RESTful principles, versioning strategies, and documentation best practices. Good APIs are a craft!",
  },
  {
    title: "Team Retrospective Insights",
    content:
      "Our sprint retro highlighted communication gaps. Implementing daily standups and better documentation. Continuous improvement is key!",
  },
  {
    title: "Cloud Migration Planning",
    content:
      "Planning our AWS migration strategy. Learning about EC2, S3, Lambda, and RDS. Cloud architecture is the future!",
  },
  {
    title: "Accessibility Improvements",
    content:
      "Improved our app's accessibility - added ARIA labels, keyboard navigation, and screen reader support. Inclusive design matters!",
  },
  {
    title: "Testing Strategy Overhaul",
    content:
      "Implemented unit tests, integration tests, and E2E tests. The testing pyramid makes sense now. Confidence in deployments increased!",
  },
  {
    title: "Tech Debt Management",
    content:
      "Spent time addressing tech debt. It's not sexy but essential for long-term project health. Balance feature work with maintenance!",
  },
  {
    title: "Performance Profiling",
    content:
      "Used Chrome DevTools to profile our app. Found and fixed memory leaks. Performance optimization is detective work!",
  },
  {
    title: "Leadership Training",
    content:
      "Attended leadership workshop. Learning about emotional intelligence, conflict resolution, and effective communication. Growing beyond just coding!",
  },
];

const sampleDrafts = [
  {
    title: "Learning Kubernetes (Draft)",
    content:
      "Starting to learn K8s for container orchestration. It's complex but powerful... (need to add more details)",
  },
  {
    title: "Migration Strategy Notes",
    content: "Initial thoughts on database migration... (incomplete)",
  },
  {
    title: "Code Review Best Practices",
    content: "Draft notes from team discussion... (need to organize better)",
  },
  {
    title: "New Project Ideas",
    content: "Brainstorming session notes... (to be expanded)",
  },
  {
    title: "Performance Optimization TODO",
    content: "List of optimizations to implement... (work in progress)",
  },
  {
    title: "Team Feedback Draft",
    content: "Preparing feedback for 1:1 meeting... (needs refinement)",
  },
  {
    title: "Architecture Proposal",
    content: "Early draft of system architecture... (incomplete)",
  },
  {
    title: "Learning Go Language",
    content: "Notes from Go tutorial... (day 1 progress)",
  },
  {
    title: "Documentation Outline",
    content: "Structure for new API docs... (skeleton only)",
  },
  {
    title: "Deployment Checklist",
    content: "Items to verify before production... (draft list)",
  },
  {
    title: "Testing Strategy",
    content: "Thoughts on improving test coverage... (preliminary)",
  },
  {
    title: "Refactoring Plan",
    content: "Components that need refactoring... (initial analysis)",
  },
  {
    title: "Security Improvements",
    content: "Security vulnerabilities to address... (draft)",
  },
  {
    title: "Career Goals Review",
    content: "Reflecting on Q4 objectives... (in progress)",
  },
  {
    title: "Conference Talk Proposal",
    content: "Ideas for tech talk submission... (outline)",
  },
];

const seed = async () => {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.reply.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  console.log("👤 Creating test user...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const testUser = await prisma.user.create({
    data: {
      email: "test@daiily.com",
      name: "Alex Johnson",
      password: hashedPassword,
      verified: true,
      currentRole: "Full Stack Developer",
      industry: "Technology",
      experienceLevel: "MID_LEVEL",
      yearsOfExperience: 3,
      currentSkills: [
        "TypeScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "Docker",
      ],
      targetSkills: ["Kubernetes", "Go", "System Design", "AWS"],
      bio: "Passionate developer focused on building scalable applications and continuous learning.",
      currentGoals: [
        "Master system design patterns",
        "Contribute to open source",
        "Learn Kubernetes",
      ],
    },
  });

  console.log(`✅ Created user: ${testUser.email}`);

  // Create published posts
  console.log("📝 Creating published posts...");
  const createdPosts = [];

  for (let i = 0; i < samplePosts.length; i++) {
    const post = await prisma.post.create({
      data: {
        title: samplePosts[i].title,
        content: samplePosts[i].content,
        status: "PUBLISHED",
        authorId: testUser.id,
        createdAt: new Date(Date.now() - (samplePosts.length - i) * 86400000), // Spread posts over days
      },
    });
    createdPosts.push(post);
  }

  console.log(`✅ Created ${createdPosts.length} published posts`);

  // Create draft posts
  console.log("📄 Creating draft posts...");
  const createdDrafts = [];

  for (let i = 0; i < sampleDrafts.length; i++) {
    const draft = await prisma.post.create({
      data: {
        title: sampleDrafts[i].title,
        content: sampleDrafts[i].content,
        status: "DRAFT",
        authorId: testUser.id,
        createdAt: new Date(Date.now() - (sampleDrafts.length - i) * 43200000), // Spread drafts over half-days
      },
    });
    createdDrafts.push(draft);
  }

  console.log(`✅ Created ${createdDrafts.length} draft posts`);

  // Add some likes to posts
  console.log("❤️  Adding likes to posts...");
  let likesCount = 0;

  for (let i = 0; i < Math.min(15, createdPosts.length); i++) {
    await prisma.like.create({
      data: {
        userId: testUser.id,
        postId: createdPosts[i].id,
      },
    });
    likesCount++;
  }

  console.log(`✅ Created ${likesCount} likes`);

  // Add some replies to posts
  console.log("💬 Adding replies to posts...");
  const replies = [
    "Great post! Thanks for sharing your experience.",
    "I learned something similar last week. Keep it up!",
    "This is really helpful, thank you!",
    "Interesting approach, I'll try this.",
    "Thanks for the detailed explanation!",
  ];

  let repliesCount = 0;

  for (let i = 0; i < Math.min(10, createdPosts.length); i++) {
    await prisma.reply.create({
      data: {
        content: replies[i % replies.length],
        authorId: testUser.id,
        postId: createdPosts[i].id,
      },
    });
    repliesCount++;
  }

  console.log(`✅ Created ${repliesCount} replies`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: 1`);
  console.log(`   - Published Posts: ${createdPosts.length}`);
  console.log(`   - Draft Posts: ${createdDrafts.length}`);
  console.log(`   - Likes: ${likesCount}`);
  console.log(`   - Replies: ${repliesCount}`);
  console.log(`\n👤 Test User Credentials:`);
  console.log(`   Email: test@daiily.com`);
  console.log(`   Password: password123`);
};

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
