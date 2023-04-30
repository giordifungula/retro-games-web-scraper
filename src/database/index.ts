import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { slugify } from "../helper";

interface RetroGames {
    id?: number;
    title: string;
    handle?: string;
    platform: string;
    plot?: string | null;
    genres?: string[];
    publishers?: string[];
    releaseDate?: string;
    imageUrl: string;
    url: string;
    iframeSrc?: string | null;
    relatedGames?: any;
}

export const saveGameData = async (game: any) => {
    try {
        await prisma.$connect();
        await prisma.game.create({
            data: {
                title: game.title,
                plot: game.plot,
                handle: slugify(game.title),
                platform: game.platform,
                genres: game.genres,
                publishers: game.publishers,
                releaseDate: game.releaseDate,
                imageUrl: game.imageUrl,
                iframeSrc: game.iframeSrc,
                relatedGames: game.relatedGames,
                reference: game.reference
            },
        });
    } catch (error) {
        console.error("Error saving game data:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}