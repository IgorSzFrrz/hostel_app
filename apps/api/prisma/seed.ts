import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roomTypes = [
  {
    slug: "single",
    name: {
      pt: "Quarto individual",
      en: "Single room",
      es: "Habitacion individual",
    },
    description: {
      pt: "Um quarto compacto e tranquilo para uma pessoa, com cama confortavel e area de apoio.",
      en: "A compact, quiet room for one guest, with a comfortable bed and practical workspace.",
      es: "Una habitacion compacta y tranquila para una persona, con cama comoda y area de apoyo.",
    },
    capacity: 1,
    basePriceBRL: "180.00",
    photos: ["/rooms/single-01.webp", "/rooms/single-02.webp"],
    rooms: ["101", "102"],
  },
  {
    slug: "double",
    name: {
      pt: "Quarto duplo",
      en: "Double room",
      es: "Habitacion doble",
    },
    description: {
      pt: "Espaco para duas pessoas, ideal para casais ou amigos viajando juntos.",
      en: "Space for two guests, ideal for couples or friends traveling together.",
      es: "Espacio para dos personas, ideal para parejas o amigos viajando juntos.",
    },
    capacity: 2,
    basePriceBRL: "260.00",
    photos: ["/rooms/double-01.webp", "/rooms/double-02.webp"],
    rooms: ["201", "202", "203"],
  },
  {
    slug: "group",
    name: {
      pt: "Quarto para grupo",
      en: "Group room",
      es: "Habitacion para grupo",
    },
    description: {
      pt: "Quarto compartilhado privativo para grupos de tres a quatro pessoas.",
      en: "Private shared room for groups of three to four guests.",
      es: "Habitacion compartida privada para grupos de tres a cuatro personas.",
    },
    capacity: 4,
    basePriceBRL: "420.00",
    photos: ["/rooms/group-01.webp", "/rooms/group-02.webp"],
    rooms: ["301", "302"],
  },
];

async function main() {
  for (const roomType of roomTypes) {
    const savedRoomType = await prisma.roomType.upsert({
      where: { slug: roomType.slug },
      update: {
        name: roomType.name,
        description: roomType.description,
        capacity: roomType.capacity,
        basePriceBRL: roomType.basePriceBRL,
        photos: roomType.photos,
      },
      create: {
        slug: roomType.slug,
        name: roomType.name,
        description: roomType.description,
        capacity: roomType.capacity,
        basePriceBRL: roomType.basePriceBRL,
        photos: roomType.photos,
      },
    });

    for (const number of roomType.rooms) {
      await prisma.room.upsert({
        where: { number },
        update: {
          active: true,
          roomTypeId: savedRoomType.id,
        },
        create: {
          number,
          roomTypeId: savedRoomType.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
