import fastify from "fastify";
import { createTrip } from "./routes/create_trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm_trip";
import cors from '@fastify/cors'
import { confirmParticipants } from "./routes/confirm_participant";
import { createActivity } from "./routes/create_activity";
import { getActivity } from "./routes/get_activity";
import { createLinks } from "./routes/create_links";
import { getLinks } from "./routes/get_links";
import { getPartcipants } from "./routes/get_participants";
import { createInvite } from "./routes/create_invite";
import { updateTrip } from "./routes/update_trip";
import { getTripdetail } from "./routes/get_trips_details";
import { getPartcipant } from "./routes/get_partcipant";
import { errorHandler } from "./error_handler";
import { env } from "./env";

const app = fastify()

app.register(cors, {
    origin: '*'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipants)
app.register(createActivity)
app.register(getActivity)
app.register(createLinks)
app.register(getLinks)
app.register(getPartcipants)
app.register(createInvite)
app.register(updateTrip)
app.register(getTripdetail)
app.register(getPartcipant)

app.listen({port: env.PORT, host: '0.0.0.0'}).then(() => {
    console.log("server is running");
})