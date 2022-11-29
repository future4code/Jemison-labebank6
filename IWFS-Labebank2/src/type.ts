export type Cliente = {
    id: number,
    nome: string,
    CPF: string,
    nascimento: string,
    extrato: {
        saldo: number,
        data: string,
        descricao: string
    }
}