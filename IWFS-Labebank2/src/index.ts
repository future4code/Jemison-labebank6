import express, { Request, Response } from "express"
import cors from 'cors'
import { clientes } from './data';
import * as tipo from './type'


const app = express()

app.use(express.json())

app.use(cors())

// TODOS OS USUARIOS ======================================

app.get('/usuarios',(req: Request, res: Response)=>{
    res.status(200).send(clientes)
})

//CRIANDO CLIENTE ==========================================

app.post('/create', (req: Request, res: Response) => {

    let errorCode = 400;

    try {
        //Pegando as propriedades pelo BODY
        const {nome, CPF, nascimento} = req.body

        if(!nome || !CPF || !nascimento){
            errorCode = 422
            throw new Error("Passe os parâmetros corretamente");
        }

        // Validando conta já existente.
        clientes.map((cpf)=>{
            if(CPF === cpf.CPF){
                errorCode = 422
                throw new Error("CPF já cadastrado.");
            }
        })

        // Função para dar a idade do usuario.
        function calculaIdade(nascimento:any){ 
            let dataAtual = new Date();
            let anoAtual = dataAtual.getFullYear();
            let anoNascParts = nascimento.split('/');
            let diaNasc =anoNascParts[0];
            let mesNasc =anoNascParts[1];
            let anoNasc =anoNascParts[2];
            let idade = anoAtual - anoNasc;
            let mesAtual = dataAtual.getMonth() + 1; 

            if(mesAtual < mesNasc){
              idade--; 
            }else {
              if(mesAtual == mesNasc){ 
                if(new Date().getDate() < diaNasc ){
                idade--; 
                }
              }
            } 
            return idade; 
        }

        // Validando se é maior de idade.
        if (calculaIdade(nascimento) < 18) {
            errorCode
            throw new Error("Apenas clientes apartir de 18 anos podem abrir nova conta")
        }

        // Data atual da compra que ficara registrado no extrato.
        function dataAtualFormatada(){
            var data = new Date(),
                dia  = data.getDate().toString(),
                diaF = (dia.length == 1) ? '0'+dia : dia,
                mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
                mesF = (mes.length == 1) ? '0'+mes : mes,
                anoF = data.getFullYear();
            return diaF+"/"+mesF+"/"+anoF;
        }

        // Criando novo usuario.
        const newUser: tipo.Cliente ={
           id: Math.random(),
           nome: nome,
           CPF: CPF,
           nascimento: nascimento,
           extrato:{
               saldo: 0,
               data: dataAtualFormatada() ,
               descricao: "Descreva o gasto.",
           }
       }
    
        //Adicionando a nova conta na lista existente.
        clientes.push(newUser)

        res.status(200).send(clientes)

    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})

// PEGANDO SALDO =====================================================
app.get('/saldo',(req:Request, res:Response)=>{
    
    let errorCode = 400;

    try {
        // Pegando as propriedades
        const {nome, CPF} = req.body

        if(!nome){
            errorCode = 422
            throw new Error("Nome não fornecido");
        }else if(!CPF){
            errorCode = 422
            throw new Error("CPF não fornecido");
        }

        // Filtra o array de usuarios.
        let filtro = clientes.find((busca)=>{
            return(
                busca.CPF === CPF && busca.nome.toUpperCase() === nome.toUpperCase()
            )
        })
        
        res.status(200).send(filtro?.extrato)

    }catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})

// ADICIONAR SALDO ================================================ 

app.patch('/adicionando',(req:Request, res:Response)=>{
    
    let errorCode = 400;

    try {
        // Pegando as propriedades
        const {nome, CPF, saldo} = req.body

        if(!nome){
            errorCode = 422
            throw new Error("Nome não fornecido");
        }else if(!CPF){
            errorCode = 422
            throw new Error("CPF não fornecido");
        }else if(!saldo){
            errorCode = 422
            throw new Error("Saldo não fornecido");
        }

        // Adicionando novo saldo.
        clientes.find((busca)=>{
            if (busca.CPF === CPF && busca.nome.toUpperCase() === nome.toUpperCase()){
               return busca.extrato.saldo = saldo
            }else{
                errorCode = 422
            throw new Error("CPF ou NOME errado!");
            }
        })

        res.status(200).send("Novo saldo adicionado com sucesso!")

    }catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})

// PAGAR CONTA



app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});