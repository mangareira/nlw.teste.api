import { FastifyInstance } from "fastify"
import { ClientErrors } from "./errors/client_errors"
import { ZodError } from "zod";

type fastifyErrorhandle = FastifyInstance['errorHandler']

export const errorHandler: fastifyErrorhandle = (err,req,rep) => {
    console.log(err);

    if(err instanceof ZodError) {
        return rep.status(400).send({
            message: "Invalid input",
            errors: err.flatten().fieldErrors
        })
    }
    
    if(err instanceof ClientErrors) {
        return rep.status(400).send({message: err.message})
    }
    
    return rep.status(500).send({message: "Internal server error"})
}