import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientErrors } from "../errors/client_errors";



export async function getTripdetail(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId", {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            })  
        }
    } ,async (req) => {
        const {tripId} = req.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            select: {
                id: true,
                destination: true,
                start_at: true,
                ends_at: true,
                is_confirmed: true
            }
        })

        if(!trip) throw new ClientErrors("Trip not found")
        
        return {trip}
    })
}