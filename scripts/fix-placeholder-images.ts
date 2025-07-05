import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function fixPlaceholderImages() {
  
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Find all product images with placehold.co URLs
    const placeholderImages = await prisma.productImage.findMany({
      where: {
        imageUrl: {
          contains: 'placehold.co'
        }
      },
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });


    if (placeholderImages.length === 0) {
      return;
    }

    // Show which products are affected
    placeholderImages.forEach(img => {
    });


    // Update each image to use picsum.photos instead
    let updateCount = 0;
    for (const img of placeholderImages) {
      // Extract dimensions from placehold.co URL if possible
      const dimensionMatch = img.imageUrl.match(/placehold\.co\/(\d+)x?(\d+)?/);
      let width = 400;
      let height = 400;
      
      if (dimensionMatch) {
        width = parseInt(dimensionMatch[1]);
        height = dimensionMatch[2] ? parseInt(dimensionMatch[2]) : width;
      }

      // Use picsum.photos as replacement (works well with Next.js Image)
      const newImageUrl = `https://picsum.photos/${width}/${height}?random=${img.id}`;

      await prisma.productImage.update({
        where: { id: img.id },
        data: { imageUrl: newImageUrl }
      });

      updateCount++;
    }


    // Verify the fix
    const remainingPlaceholders = await prisma.productImage.count({
      where: {
        imageUrl: {
          contains: 'placehold.co'
        }
      }
    });

    if (remainingPlaceholders === 0) {
    } else {
    }

  } catch (error) {
    console.error('❌ Error fixing placeholder images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPlaceholderImages();