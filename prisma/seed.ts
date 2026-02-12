import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Variation Templates
  const size = await prisma.variationTemplate.upsert({
    where: { name: "Size" },
    update: {},
    create: { name: "Size", displayOrder: 1 },
  });

  const color = await prisma.variationTemplate.upsert({
    where: { name: "Color" },
    update: {},
    create: { name: "Color", displayOrder: 2 },
  });

  const material = await prisma.variationTemplate.upsert({
    where: { name: "Material" },
    update: {},
    create: { name: "Material", displayOrder: 3 },
  });

  console.log("✅ Variation templates created");

  // Size values
  const sizes = ["XS", "Small", "Medium", "Large", "XL", "XXL"];
  for (let i = 0; i < sizes.length; i++) {
    await prisma.variationTemplateValue.upsert({
      where: { templateId_value: { templateId: size.id, value: sizes[i] } },
      update: {},
      create: { templateId: size.id, value: sizes[i], displayOrder: i + 1 },
    });
  }

  // Color values
  const colors = ["Black", "White", "Red", "Blue", "Green", "Gray"];
  for (let i = 0; i < colors.length; i++) {
    await prisma.variationTemplateValue.upsert({
      where: { templateId_value: { templateId: color.id, value: colors[i] } },
      update: {},
      create: { templateId: color.id, value: colors[i], displayOrder: i + 1 },
    });
  }

  // Material values
  const materials = ["Cotton", "Polyester", "Wool", "Leather", "Denim"];
  for (let i = 0; i < materials.length; i++) {
    await prisma.variationTemplateValue.upsert({
      where: {
        templateId_value: { templateId: material.id, value: materials[i] },
      },
      update: {},
      create: {
        templateId: material.id,
        value: materials[i],
        displayOrder: i + 1,
      },
    });
  }

  console.log("✅ Variation values created");

  // Shipping Rate
  await prisma.shippingRate.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Standard Shipping",
      rate: 5.0,
      freeShippingThreshold: 50.0,
      isActive: true,
    },
  });

  console.log("✅ Shipping rates created");
  console.log("🎉 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
