import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientErrors } from "../errors/client_errors";

export async function createLinks(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/link", {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                title: z.string().min(4),
                url: z.string().url()
            })
        }
    } ,async (req) => {
        const {tripId} = req.params
        const data = req.body

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }   
        })

        if(!trip) throw new ClientErrors("Trip not found")


        const link =  await prisma.link.create({
            data: {
                title: data.title,
                url: data.url,
                tripId: tripId
            }
        })  

        return {linkId: link.id}
    })
}