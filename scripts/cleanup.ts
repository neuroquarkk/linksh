import { prisma } from '@db';

async function cleanup(): Promise<void> {
    const { count } = await prisma.link.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });

    console.log(`Deleted ${count} expired links`);
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
