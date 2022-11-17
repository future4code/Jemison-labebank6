import * as tipo from "./type"

export const clientes: tipo.Cliente[] = [
    {
        id: 1,
        nome: "João",
        CPF: "000.000.000-00",
        nascimento: "10/10/1990",
        extrato: {
            saldo: 0,
            data: "10/10/90",
            descricao: "asdasdasd dadasd ad ad",
        }
    }
]