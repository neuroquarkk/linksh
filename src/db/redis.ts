import { config } from '@config';
import { prisma } from '@db';
import { createClient } from 'redis';

export const redis = createClient({
    url: config.REDIS_URL,
});

redis.on('error', (err) => console.error('Redis client error:', err));

const ID_KEY = 'link:global_id';

export async function initRedis() {
    await redis.connect();
    console.log('Redis connected');

    const { _max } = await prisma.link.aggregate({
        _max: { id: true },
    });

    const dbMax = _max.id || 0;

    const redisVal = await redis.get(ID_KEY);
    const redisCurrent = redisVal ? parseInt(redisVal, 10) : 0;

    if (dbMax > redisCurrent) {
        await redis.set(ID_KEY, dbMax);
        console.log(`Redis counter synced to DB max: ${dbMax}`);
    }
}
