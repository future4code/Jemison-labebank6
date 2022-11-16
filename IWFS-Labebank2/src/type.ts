export type Cliente = {
    id: string,
    nome: string,
    CPF: string,
    nascimento: string,
    extrato: {
        saldo: number,
        data: string,
        descricao: string
    }
}