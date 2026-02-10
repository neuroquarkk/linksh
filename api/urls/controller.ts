import type { TypedController } from '@types';
import type { RedirectParam, ShortenBody } from './schema';
import { prisma } from '@db';
import { Base62 } from 'src/utils/base62';
import { HttpStatusCode } from '@constants';
import { ApiError, ApiResponse } from '@utils';

export class UrlController {
    public static shorten: TypedController<ShortenBody> = async (req, res) => {
        const { longUrl } = req.body;

        const link = await prisma.link.create({
            data: {
                longUrl,
                short: '',
            },
        });

        const shortCode = Base62.encode(link.id);

        const updatedLink = await prisma.link.update({
            where: { id: link.id },
            data: { short: shortCode },
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

        prisma.link
            .update({
                where: { id: link.id },
                data: { clicks: { increment: 1 } },
            })
            .catch((err) => console.error('Failed to track click', err));

        return res.redirect(link.longUrl);
    };
}
