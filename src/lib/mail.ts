import nodemailer from 'nodemailer'

export async function getMail() {
    const account = await nodemailer.createTestAccount()
    const tranport = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass,
        }
    })
    return tranport
}