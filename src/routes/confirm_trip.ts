import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { getMail } from "../lib/mail";
import { dayjs } from "../lib/dayjs"
import nodemailer from 'nodemailer'
import { ClientErrors } from "../errors/client_errors";
import { env } from "../env";

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    } ,async (req, rep) => {
        const {tripId} = req.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        })
        if(!trip) throw new ClientErrors("Trip not found")
        if(trip.is_confirmed) return rep.redirect(`${env.FRONTEND_BASE_URL}/trips/${tripId}`)
        
        await prisma.trip.update({
            where: {id: tripId},
            data: {
                is_confirmed: true
            }
        })

        const formattedDataStart = dayjs(trip.start_at).format('LL')
        const formatteDataEnd = dayjs(trip.ends_at).format('LL')

        const mail = await getMail()

        await Promise.all(
            trip.participants.map(async (ptc) => {
                const message = await mail.sendMail({
                    from: {
                        name: 'Equipe plann.er',
                        address: 'oi@gmail.com',
                    },
                    to: ptc.email,
                    subject: `Confirme sua presença na viagem para ${trip.destination} `,
                    html: `
                        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                            <p>Você convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedDataStart} a ${formatteDataEnd}</strong></p>
                            <br>
                            <p>Para confirma sua presença na viagem, clique no link abaixo:</p>
                            <br>
                            <p>
                                <a href="${env.API_BASE_URL}/participants/${ptc.id}/confirm">Corfimar viagem</a>
                            </p>
                        </div>
                    `
                    })
                    console.log(nodemailer.getTestMessageUrl(message));
                
            })
        )
        return rep.redirect(`http://localhost:3000/trips/${tripId}`)
    })
}