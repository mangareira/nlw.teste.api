import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientErrors } from "../errors/client_errors";



export async function getPartcipant(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/participants/:participantId", {
        schema: {
            params: z.object({
                participantId: z.string().uuid(),
            })
        }
    } ,async (req) => {
        const {participantId} = req.params

        const participant = await prisma.participant.findUnique({
            where: {
                id: participantId
            },
            select: {
                id: true,
                email: true,
                name: true,
                is_confirmed: true
            }
        })

        if(!participant) throw new ClientErrors("Participant not found")
        
        return {participant}
    })
}