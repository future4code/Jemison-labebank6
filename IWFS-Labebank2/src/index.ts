import express, { Request, Response } from "express"
import cors from 'cors'
import * as tipo from './type'

const app = express()

app.use(express.json())

app.use(cors())

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});

//CRIANDO USUARIO

app.post('/create', (req: Request, res: Response) => {

    let errorCode = 400;

    try {
        const nomeUsuario = req.query.name
        const cpfUsuario = req.query.cpf
        const nascimentoUsuario = Number(req.query.nascimento)

        if (!nascimentoUsuario) {
            throw new Error("Digite a da ta de nascimento")
        } else if (nascimentoUsuario < 18) {
            throw new Error("Apenas clientes apartir de 18 anos podem abrir nova conta")
        }

    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})