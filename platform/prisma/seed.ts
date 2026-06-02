import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@reviewhub.dev";
const DEMO_PASSWORD = "demo1234";

const SAMPLE_FEEDBACKS: {
  source: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  publishedAt: Date;
}[] = [
  {
    source: "google",
    authorName: "Maria S.",
    rating: 5,
    title: "Wunderbarer Aufenthalt",
    body: "Das Hotel hat unsere Erwartungen weit übertroffen. Das Frühstück war hervorragend und das Personal unglaublich freundlich. Wir kommen definitiv wieder!",
    publishedAt: new Date("2026-05-28"),
  },
  {
    source: "google",
    authorName: "Thomas K.",
    rating: 2,
    title: "Leider enttäuschend",
    body: "Das Zimmer war sauber, aber der Service ließ sehr zu wünschen übrig. Wir mussten 30 Minuten auf das Frühstück warten, und die Rezeption war kaum erreichbar. Für den Preis erwarte ich mehr.",
    publishedAt: new Date("2026-05-20"),
  },
  {
    source: "tripadvisor",
    authorName: "Sophie M.",
    rating: 4,
    title: "Sehr schön gelegen",
    body: "Die Lage ist traumhaft, mitten in der Natur. Das Essen im Restaurant ist authentisch und lecker. Einziger Kritikpunkt: Das WLAN ist etwas langsam.",
    publishedAt: new Date("2026-05-15"),
  },
  {
    source: "booking",
    authorName: "Hans B.",
    rating: 5,
    title: "Perfekter Familienurlaub",
    body: "Mit drei Kindern haben wir uns hier rundum wohlgefühlt. Die Mitarbeiter sind sehr kinderfreundlich und haben uns immer weitergeholfen. Das Hallenbad war ein Highlight.",
    publishedAt: new Date("2026-05-10"),
  },
  {
    source: "google",
    authorName: "Claudia R.",
    rating: 3,
    title: "Gemischte Eindrücke",
    body: "Das Zimmer war schön, aber die Lärmbelästigung durch die Straße war störend. Der Pool war leider nicht beheizt, obwohl es auf der Webseite anders stand. Personal war nett.",
    publishedAt: new Date("2026-05-05"),
  },
  {
    source: "tripadvisor",
    authorName: "James W.",
    rating: 5,
    title: "Hidden gem in the mountains",
    body: "What a fantastic find! The rooms are cozy and clean, the food is exceptional, and the views are breathtaking. The staff went above and beyond to make our anniversary special.",
    publishedAt: new Date("2026-04-28"),
  },
  {
    source: "booking",
    authorName: "Anna L.",
    rating: 1,
    title: "Sehr schlechte Erfahrung",
    body: "Bei Ankunft war unser gebuchtes Zimmer vergeben. Wir wurden in ein kleineres Zimmer umquartiert ohne Preisnachlass. Die Dusche funktionierte nicht richtig. Absolut nicht empfehlenswert.",
    publishedAt: new Date("2026-04-20"),
  },
  {
    source: "csv",
    authorName: "Peter F.",
    rating: 4,
    title: "Gutes Preis-Leistungs-Verhältnis",
    body: "Für den Preis absolut in Ordnung. Frühstück war reichhaltig, Bett bequem. Die Sauna war leider nur bis 20 Uhr geöffnet, das fanden wir schade.",
    publishedAt: new Date("2026-04-15"),
  },
  {
    source: "google",
    authorName: "Franziska H.",
    rating: 5,
    title: "Immer wieder gerne",
    body: "Bereits zum dritten Mal hier und jedes Mal begeistert. Chef ist persönlich präsent und kümmert sich um jeden Gast. Die Küche ist phänomenal – regionale Produkte, perfekt zubereitet.",
    publishedAt: new Date("2026-04-08"),
  },
  {
    source: "tripadvisor",
    authorName: "Lukas N.",
    rating: 3,
    title: "Nette Unterkunft mit Verbesserungspotenzial",
    body: "Generell ein angenehmer Aufenthalt, aber die Klimaanlage im Zimmer war sehr laut. Das Check-in hat länger gedauert als erwartet. Das Abendessen war dafür ausgezeichnet.",
    publishedAt: new Date("2026-03-30"),
  },
];

async function main() {
  console.log("🌱 Seeding development data...");

  // Create or update demo user
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Demo Nutzer",
      passwordHash,
      company: {
        create: {
          name: "Landgasthof Alpensonne",
          description:
            "Familiengeführter Landgasthof in den bayerischen Alpen seit 1952. Bekannt für herzliche Gastfreundschaft, regionale Küche und gemütliche Zimmer.",
          language: "de",
        },
      },
    },
    include: { company: true },
  });

  const company = user.company ?? (await prisma.company.findUnique({ where: { userId: user.id } }));
  if (!company) throw new Error("Company not found after upsert");

  // Clear existing feedback for clean re-seed
  await prisma.feedback.deleteMany({ where: { companyId: company.id } });

  // Insert sample feedbacks
  await prisma.feedback.createMany({
    data: SAMPLE_FEEDBACKS.map((f, i) => ({
      companyId: company.id,
      source: f.source,
      externalId: `seed-${i}`,
      authorName: f.authorName,
      rating: f.rating,
      title: f.title,
      body: f.body,
      publishedAt: f.publishedAt,
    })),
  });

  console.log(`✅ Demo-Nutzer: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`✅ ${SAMPLE_FEEDBACKS.length} Beispiel-Bewertungen angelegt`);
  console.log(`✅ Firma: ${company.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
