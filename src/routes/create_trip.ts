import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs"
import { getMail } from "../lib/mail";
import nodemailer from 'nodemailer'
import { ClientErrors } from "../errors/client_errors";
import { env } from "../env";



export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips", {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                start_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email())
            })
        }
    } ,async (req) => {
        const data = req.body
        if(dayjs(data.start_at).isBefore(new Date())) {
            throw new ClientErrors('Invalid start date trip')
        }
        if(dayjs(data.ends_at).isBefore(data.start_at)) {
            throw new ClientErrors('Invalid ends date trip')
        }
        const trips = await prisma.trip.create({
            data: {
                destination: data.destination,
                ends_at: data.ends_at,
                start_at: data.start_at,
                participants: {
                    createMany:{
                        data: [{
                            name: data.owner_name,
                            email: data.owner_email,
                            is_owner: true,
                            is_confirmed: true
                        },
                        ...data.emails_to_invite.map(email => {
                            return {email}
                        })]
                    }
                }
            }
        })        

        const formattedDataStart = dayjs(data.start_at).format('LL')
        const formatteDataEnd = dayjs(data.ends_at).format('LL')

        const mail = await getMail()
        const message = await mail.sendMail({
            from: {
                name: 'Equipe plann.er',
                address: 'oi@gmail.com',
            },
            to: {
                name: data.owner_name,
                address: data.owner_email,
            },
            subject: 'Teste de email',
            html: `
                <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                    <p>Você solicitou a criação de uma viagem para <strong>${data.destination}</strong> nas datas de <strong>${formattedDataStart} a ${formatteDataEnd}</strong></p>
                    <br>
                    <p>Para confirma sua viagem, clique no link abaixo:</p>
                    <br>
                    <p>
                        <a href="${env.API_BASE_URL}/trips/${trips.id}/confirm">Corfimar viagem</a>
                    </p>
                </div>
            `
            })
            console.log(nodemailer.getTestMessageUrl(message));
            
        return trips
    })
}