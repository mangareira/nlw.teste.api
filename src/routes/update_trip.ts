import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientErrors } from "../errors/client_errors";



export async function updateTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put("/trips/:tripId", {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                destination: z.string().min(4),
                start_at: z.coerce.date(),
                ends_at: z.coerce.date(),
            })
        }
    } ,async (req) => {
        const data = req.body
        const {tripId} = req.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }   
        })

        if(!trip) throw new ClientErrors("Trip not found")
        if(dayjs(data.start_at).isBefore(new Date())) {
            throw new ClientErrors('Invalid start date trip')
        }
        if(dayjs(data.ends_at).isBefore(data.start_at)) {
            throw new ClientErrors('Invalid ends date trip')
        }      

        await prisma.trip.update({
            where: {id: tripId},
            data: {
                destination: data.destination,
                start_at: data.start_at,
                ends_at: data.ends_at
            }
        })

                   
        return {tripId: trip.id }
    })
}