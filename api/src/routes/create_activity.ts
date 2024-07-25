import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientErrors } from "../errors/client_errors";



export async function createActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/activities", {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                title: z.string().min(4),
                occursAt: z.coerce.date(),  
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

        if(dayjs(data.occursAt).isBefore(trip.start_at)) throw new ClientErrors("Invalide activity date")
        if(dayjs(data.occursAt).isAfter(trip.ends_at)) throw new ClientErrors("Invalide activity date")

        const activity =  await prisma.activity.create({
            data: {
                title: data.title,
                occursAt: data.occursAt,
                tripId: tripId
            }
        })  

        return {activityId: activity.id}
    })
}