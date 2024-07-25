import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientErrors } from "../errors/client_errors";



export async function getActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/activities", {
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
            include: {
                activities: {
                    orderBy: {
                        occursAt: 'asc'
                    }
                }
            } 
        })

        if(!trip) throw new ClientErrors("Trip not found")
        
        const difInDayBetTripStartAndEnd = dayjs(trip.ends_at).diff(trip.start_at, 'days')
        
        const activities = Array.from({ length: difInDayBetTripStartAndEnd + 1 }).map((_,index) => {
            const date = dayjs(trip.start_at).add(index, 'days')
            return {
                date: date.toDate(),
                activities: trip.activities.filter(act => {
                    return dayjs(act.occursAt).isSame(date, 'day')
                })
            }
        })

        return {activities}
    })
}