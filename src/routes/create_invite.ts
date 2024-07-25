import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMail } from "../lib/mail";
import nodemailer from 'nodemailer'
import { ClientErrors } from "../errors/client_errors";
import { env } from "../env";


export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/invite", {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                email: z.string().email(),
            })
        }
    } ,async (req) => {
        const {tripId} = req.params
        const { email } = req.body

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }   
        })

        if(!trip) throw new ClientErrors("Trip not found")


        const participant = await prisma.participant.create({
            data: {
                email,
                tripId,
            }
        })
        const formattedDataStart = dayjs(trip.start_at).format('LL')
        const formatteDataEnd = dayjs(trip.ends_at).format('LL')

        const mail = await getMail()

        const message = await mail.sendMail({
            from: {
                name: 'Equipe plann.er',
                address: 'oi@gmail.com',
            },
            to: participant.email,
            subject: `Confirme sua presença na viagem para ${trip.destination} `,
            html: `
                <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                    <p>Você convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedDataStart} a ${formatteDataEnd}</strong></p>
                    <br>
                    <p>Para confirma sua presença na viagem, clique no link abaixo:</p>
                    <br>
                    <p>
                        <a href="${env.API_BASE_URL}/participants/${participant.id}/confirm">Corfimar viagem</a>
                    </p>
                </div>
            `
            })
            console.log(nodemailer.getTestMessageUrl(message));
                
        return {participantId: participant.id}
    })
}