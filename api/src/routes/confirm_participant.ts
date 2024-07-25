import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientErrors } from "../errors/client_errors";
import { env } from "../env";

export async function confirmParticipants(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/participants/:participantId/confirm", {
        schema: {
            params: z.object({
                participantId: z.string().uuid()
            })
        }
    } ,async (req, rep) => {
        const { participantId } = req.params

        const participant = await prisma.participant.findUnique({
            where: {
                id: participantId
            }
        })

        if(!participant) throw new ClientErrors("Participant not found")
        
        if(participant.is_confirmed) return rep.redirect(`${env.FRONTEND_BASE_URL}/trips/${participant.tripId}`)
        
        await prisma.participant.update({
            where: {
                id: participantId
            },
            data: {
                is_confirmed: true
            }
        })
        
        return rep.redirect(`${env.FRONTEND_BASE_URL}/trips/${participant.tripId}`)
    })
}