import express, { Request, Response } from "express"
import cors from 'cors'
import { clientes } from './data';
import * as tipo from './type'
import { Console } from "console";


const app = express()

app.use(express.json())

app.use(cors())

let errorCode = 400;

// TODOS OS USUARIOS ======================================

app.get('/usuarios',(req: Request, res: Response)=>{
    res.status(200).send(clientes)
})

//CRIANDO CLIENTE ==========================================

app.post('/create', (req: Request, res: Response) => {


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

        // Validando CPF
        const validando = clientes.find((validar)=>{
            if(validar.CPF === CPF) {
              return   `Deu bom ${CPF}`
            }
            return
        })

        if(validando  === undefined){
            errorCode
            throw new Error(`CPF ${CPF} não cadastrado.`);
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

        // Validando CPF
        const validando = clientes.find((validar)=>{
            if(validar.CPF === CPF) {
              return   `Deu bom ${CPF}`
            }
            return
        })

        if(validando  === undefined){
            errorCode
            throw new Error(`CPF ${CPF} não foi cadastrado.`);
        }

        // Adicionando novo saldo.
        let adicionando = clientes.find((busca)=>{
            if (busca.CPF === CPF && busca.nome.toUpperCase() === nome.toUpperCase()){
               return busca.extrato.saldo = saldo
            }
        })

        if(adicionando === undefined){
            errorCode = 422
            throw new Error("Nome não compativel com CPF informado.");
        }

        res.status(200).send("Novo saldo adicionado com sucesso!")

    }catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})

// PAGAR CONTA ===========================================

app.put('/pagamento',(req:Request, res:Response) =>{
    
    try{

        let {valor, data, descricao, CPF} = req.body

        if(!valor){
            errorCode
            throw new Error("Valor não informado.");
        }else if(!descricao){
            errorCode
            throw new Error("Descrição não informada.");
        }else if(!CPF){
            errorCode
            throw new Error("CPF não informado.");
        }

        // Colocando data atual em caso de não passar uma data para agendamento.
        if (data == ""){
            function dataAtual(){
            let dataAtual = new Date();
            let anoAtual = dataAtual.getFullYear();
            let mesAtual = dataAtual.getMonth()+1;
            let diaAtual = dataAtual.getUTCDate();
            return data = `${diaAtual}/${mesAtual}/${anoAtual}`
            }
            data = dataAtual()
        }

        // Validando data atual.
        function verificaData(digitado:any){ 
            let dataAtual = new Date();
            let anoAtual = dataAtual.getFullYear();
            let mesAtual = dataAtual.getMonth()+1;
            let diaAtual = dataAtual.getUTCDate();
            let anoDigitadoPartes = digitado.split('/');
            let diaDigitado = Number(anoDigitadoPartes[0]);
            let mesDigitado = Number(anoDigitadoPartes[1]);
            let anoDigitado = Number(anoDigitadoPartes[2]);

            if(anoAtual > anoDigitado ){
                return ("Digite uma data valida")
            }else if (mesDigitado < mesAtual){
                return ("Digite uma data valida")
            }else if (diaDigitado < diaAtual){
                return ("Digite uma data valida")
            }

            return
        }


        if(verificaData(data) === "Digite uma data valida" ){
            errorCode
            throw new Error("Digite uma data valida.");
        }

        // Pagando a conta.
        let validando = clientes.find((validar)=>{
            if(validar.CPF === CPF) {
                return  (validar.extrato.saldo = validar.extrato.saldo - valor,
                         validar.extrato.data = data,
                         validar.extrato.descricao = descricao)
            }
            return
        })

        // Validando se o CPF existe no banco de dados.
        if(validando  === undefined){
            errorCode
            throw new Error("CPF não cadastrado.");
        }

        // Validando se o saldo é 0 ou negativo.
        if(Math.sign(validando.extrato.saldo) === -1 || 0){
            errorCode
            throw new Error("Saldo insuficiente.");
        }

        res.status(200).send(validando)
    
    }catch(error: any) {
        res.status(errorCode).send(error.message)
    }
})

// TRANSFERENCIA
app.put('/transferencia',(req:Request, res:Response) =>{

    try{

        let {valor, CPF, nome, CPFDestino, nomeDestino} = req.body

        if(!valor){
            errorCode
            throw new Error("Valor não informado.");
        }else if(!nome || !nomeDestino){
            errorCode
            throw new Error("Nome não informado.");
        }else if(!CPF || !CPFDestino){
            errorCode
            throw new Error("CPF não informado.");
        }

        // Conta titular.
         clientes.find((titular) =>{
            if(titular.CPF === CPF){
                return titular.extrato.saldo = titular.extrato.saldo - valor
            }
        })

        // Conta destinatario.
         clientes.find((destino) =>{
            if(destino.CPF === CPFDestino){
                return destino.extrato.saldo = destino.extrato.saldo + valor
            }
        })

        function dataAtual(){
            let dataAtual = new Date();
            let anoAtual = dataAtual.getFullYear();
            let mesAtual = dataAtual.getMonth()+1;
            let diaAtual = dataAtual.getUTCDate();
            return `${diaAtual}/${mesAtual}/${anoAtual}`
            }

        res.status(200).send(`Transferencia realizada dia ${dataAtual()}`)

    }catch(error: any) {
        res.status(errorCode).send(error.message)
    }
})

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});