import { createReadStream } from 'fs';
import csv from 'csv-parser';
import decoded from 'jwt-decode';
import { createObjectCsvWriter } from 'csv-writer';

import api from './services/api';

const csvPath = "{ROTA_DO_CSV_A_SER_LIDO}";
const csvPathOut = "{ROTA_DO_CSV_A_SER_CRIADO}";

function Person(cpf, id){
  this.cpf = cpf;
  this.id = id;
}

// Realiza a leitura de um csv
// Captura o cpf de cada uma das linhas do arquivo
// Insere cada um dos registros dentro de um Array
// Retorna esse arrat dentro do resolve da Promise
function readDataFromCsv(path) {
  var users = new Array;

  return new Promise((resolve, reject) => {
    createReadStream(path)
      .pipe(csv())
      .on('data', (data) => {
        users.push(data.cpf);
      })
      .on('end', () => {
        resolve(users);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// Recebe como parametro o cpf
// Realiza a requisição
// Faz o decode da resposta e retorna o parametro ID
const getIdByCPF = async(cpf) => {
    const data = {
        username: cpf,
        password: "123456"
    };
    const headers = {
        "Content-Type": "application/json",
        "device-id": "devicefgpt"
    }

    const response = await api.post('auth/login', data, {
            headers: headers
    });

    return decoded(response.data.token).id;
}

// Realiza a criação de um CSV com base em um array de objetos
const createCsvWithIds = async(path, data) => {

  const csvWriter = createObjectCsvWriter({
    path: path,
    header: [
      {id: 'cpf', title: 'cpf'},
      {id: 'id', title: 'id'},
    ]
  });

  csvWriter
  .writeRecords(data)
  .then(()=> console.log('The CSV file was written successfully'));
}

const runAll = async () => {
    var ids = [];
    var getDataFromCsv = await readDataFromCsv(csvPath);

    for (let index = 0; index < getDataFromCsv.length; index++) {
        ids.push(new Person(getDataFromCsv[index], await getIdByCPF(getDataFromCsv[index])));       
    }
    
    await createCsvWithIds(csvPathOut, ids);
}

runAll();
