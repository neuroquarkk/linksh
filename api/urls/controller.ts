import type { TypedController } from '@types';
import type { BatchShortenBody, RedirectParam, ShortenBody } from './schema';
import { prisma } from '@db';
import { Base62 } from 'src/utils/base62';
import { HttpStatusCode } from '@constants';
import { ApiError, ApiResponse } from '@utils';
import { config } from '@config';
import QRCode from 'qrcode';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { redis } from 'src/db/redis';

export class UrlController {
    private static readonly ID_REDIS = 'link:global_id';

    public static shorten: TypedController<ShortenBody> = async (req, res) => {
        const { longUrl, expiresAt } = req.body;

        const newId = await redis.incr(this.ID_REDIS);
        const shortCode = Base62.encode(newId);

        const updatedLink = await prisma.link.create({
            data: {
                id: newId,
                longUrl,
                short: shortCode,
                expiresAt,
            },
        });

        return res
            .status(HttpStatusCode.CREATED)
            .json(
                new ApiResponse(
                    HttpStatusCode.CREATED,
                    updatedLink,
                    'Link shortened'
                )
            );
    };

    public static redirect: TypedController<any, RedirectParam> = async (
        req,
        res
    ) => {
        const { short } = req.params;

        const link = await prisma.link.findUnique({
            where: { short },
        });

        if (!link)
            throw new ApiError(HttpStatusCode.NOT_FOUND, 'Link not found');

        if (link.expiresAt && new Date() > link.expiresAt)
            throw new ApiError(HttpStatusCode.GONE, 'Link has expired');

        const ip = req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        const referrer = req.headers['referer'] || 'Direct';

        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();
        const geo = geoip.lookup(ip);

        prisma.analytic
            .create({
                data: {
                    linkId: link.id,
                    ip,
                    city: geo?.city || 'Unknown',
                    country: geo?.country || 'Unknown',
                    os: uaResult.os.name || 'Unknown',
                    browser: uaResult.browser.name || 'Unknown',
                    device: uaResult.device.type || 'Unknown',
                    referrer,
                },
            })
            .catch((err) => console.error('Analytics Error:', err));

        prisma.link
            .update({
                where: { id: link.id },
                data: { clicks: { increment: 1 } },
            })
            .catch((err) => console.error('Failed to track click', err));

        return res.redirect(link.longUrl);
    };

    public static getQr: TypedController<any, RedirectParam> = async (
        req,
        res
    ) => {
        const { short } = req.params;

        const link = await prisma.link.findUnique({
            where: { short },
        });

        if (!link)
            throw new ApiError(HttpStatusCode.NOT_FOUND, 'Link not found');

        const fullShortUrl = `${config.BASE_URL}/${short}`;

        const qrBuff = await QRCode.toBuffer(fullShortUrl, {
            type: 'png',
            margin: 1,
            scale: 10,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        res.setHeader('Content-Type', 'image/png');
        return res.send(qrBuff);
    };

    public static getAnalytics: TypedController<any, RedirectParam> = async (
        req,
        res
    ) => {
        const { short } = req.params;

        const link = await prisma.link.findUnique({
            where: { short },
            include: {
                _count: {
                    select: { analytics: true },
                },
            },
        });

        if (!link)
            throw new ApiError(HttpStatusCode.NOT_FOUND, 'Link not found');

        // top browsers
        const browsers = await prisma.analytic.groupBy({
            by: ['browser'],
            where: { linkId: link.id },
            _count: { browser: true },
            orderBy: { _count: { browser: 'desc' } },
            take: 5,
        });

        // top countires
        const countries = await prisma.analytic.groupBy({
            by: ['country'],
            where: { linkId: link.id },
            _count: { country: true },
            orderBy: { _count: { country: 'desc' } },
            take: 5,
        });

        return res.status(HttpStatusCode.OK).json(
            new ApiResponse(
                HttpStatusCode.OK,
                {
                    totalClicks: link.clicks,
                    topBrowsers: browsers.map((b) => ({
                        name: b.browser,
                        count: b._count.browser,
                    })),
                    topCountries: countries.map((c) => ({
                        name: c.country,
                        count: c._count.country,
                    })),
                },
                'Analytics retrieved'
            )
        );
    };

    public static batchShorten: TypedController<BatchShortenBody> = async (
        req,
        res
    ) => {
        const { urls } = req.body;
        const count = urls.length;

        const endId = await redis.incrBy(this.ID_REDIS, count);
        const startId = endId - count + 1;

        const linksData = urls.map((url, idx) => {
            const id = startId + idx;
            return {
                id,
                longUrl: url.longUrl,
                short: Base62.encode(id),
                expiresAt: url.expiresAt,
            };
        });

        await prisma.link.createMany({
            data: linksData,
            skipDuplicates: true,
        });

        return res
            .status(HttpStatusCode.CREATED)
            .json(
                new ApiResponse(
                    HttpStatusCode.CREATED,
                    linksData,
                    'Batch links created successfully'
                )
            );
    };
}
