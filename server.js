const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');

const originalData = [
  {
    "setor": "Despesas Gerais",
    "nif": "501234567",
    "nome": "Cervejaria Central",
    "numero": "FR 2024-237248/33",
    "data": "09/12/2024",
    "total": "17,03€",
    "situacao": "Registado",
	"numeroCertificado": "Z001",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "",
	"valorreceita": ""
  },
  {
    "setor": "",
    "nif": "501234567",
    "nome": "Cervejaria Central",
    "numero": "FR 2024-237248/34",
    "data": "08/12/2024",
    "total": "45,50€",
    "situacao": "Pendente Classificação",
	"numeroCertificado": "Z002",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "",
	"valorreceita": ""
  },
  {
    "setor": "",
    "nif": "501234567",
    "nome": "Cervejaria Central",
    "numero": "FR 2024-237248/35",
    "data": "08/12/2024",
    "total": "21,93€",
    "situacao": "Pendente Classificação",
	"numeroCertificado": "Z003",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "",
	"valorreceita": ""
  },
  {
    "setor": "",
    "nif": "501402988",
    "nome": "Farmácia Santos",
    "numero": "FR 2024-234342/36",
    "data": "08/12/2024",
    "total": "3,93€",
    "situacao": "Pendente Classificação",
	"numeroCertificado": "Z004",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "",
	"valorreceita": ""
  },
  {
    "setor": "Saúde",
    "nif": "501280396",
    "nome": "Cliníca São Miguel",
    "numero": "FR 2024-234342/37",
    "data": "08/12/2024",
    "total": "9,99€",
    "situacao": "Pendente Receita",
	"numeroCertificado": "Z005",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "",
	"valorreceita": ""
  },
  {
    "setor": "Educação",
    "nif": "501123123",
    "nome": "Universidade de Évora",
    "numero": "FR 2024-976976/38",
    "data": "01/12/2024",
    "total": "100,00€",
    "situacao": "Registado",
	"numeroCertificado": "Z006",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "",
	"valorreceita": ""
  },
  {
    "setor": "Saúde",
    "nif": "501001002",
    "nome": "Farmácia do Povo",
    "numero": "FR 2024-567891/39",
    "data": "05/12/2024",
    "total": "15,00€",
    "situacao": "Registado",
	"numeroCertificado": "Z007",
    "regiaoImposto": "PT-CONTINENTE",
    "taxa": "23%",
	"receita": "Sim",
	"valorreceita": "5,99"
  }
];

app.use(cors());
app.use(express.json());

// Carrega as faturas do arquivo
let faturas = [];
try {
    const data = fs.readFileSync('faturas.json', 'utf8');
    faturas = JSON.parse(data);
    console.log('Faturas carregadas com sucesso.');
} catch (err) {
    console.error('Erro ao carregar faturas:', err);
}

// Rota para buscar todas as faturas
app.get('/faturas', (req, res) => {
    res.json(faturas);
});

app.put('/faturas/:numero', (req, res) => {
    try {
        const numeroFatura = decodeURIComponent(req.params.numero); // Decodifica a URL
        const novaFatura = req.body;

        // Encontra a fatura correspondente pelo número
        const index = faturas.findIndex((fatura) => fatura.numero === numeroFatura);

        if (index === -1) {
            return res.status(404).send({ error: 'Fatura não encontrada.' });
        }

        // Atualiza a fatura
        faturas[index] = novaFatura;

        // Salva no arquivo JSON
        fs.writeFileSync('faturas.json', JSON.stringify(faturas, null, 2), 'utf-8');
        console.log(`Fatura ${numeroFatura} atualizada com sucesso.`);

        res.status(200).json(novaFatura);
    } catch (error) {
        console.error('Erro ao atualizar fatura:', error);
        res.status(500).send({ error: 'Erro ao atualizar fatura.' });
    }
});

app.post('/reset', (req, res) => {
    try {
        // Escreve os dados originais no arquivo
        fs.writeFileSync('faturas.json', JSON.stringify(originalData, null, 2), 'utf-8');

        // Recarrega os dados para a variável "faturas"
        const updatedData = JSON.parse(fs.readFileSync('faturas.json', 'utf-8'));
        faturas.length = 0; // Limpa o array existente
        faturas.push(...updatedData);

        console.log('Dados resetados com sucesso.');
        res.status(200).json({ message: 'Dados resetados com sucesso.' });
    } catch (error) {
        console.error('Erro ao resetar os dados:', error);
        res.status(500).json({ error: 'Erro ao resetar os dados.' });
    }
});


app.get('/faturas', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(faturas);
});

app.put('/faturas/atualizar-campos/:numero', (req, res) => {
    try {
        const numeroFatura = decodeURIComponent(req.params.numero); // Decodifica o número da fatura da URL
        const { receita, valorreceita, situacao } = req.body; // Campos a serem atualizados

        // Encontra o índice da fatura correspondente pelo número
        const index = faturas.findIndex((fatura) => fatura.numero === numeroFatura);

        if (index === -1) {
            return res.status(404).send({ error: 'Fatura não encontrada.' });
        }

        // Atualiza apenas os campos necessários
        if (receita !== undefined) faturas[index].receita = receita;
        if (valorreceita !== undefined) faturas[index].valorreceita = valorreceita;
        if (situacao !== undefined) faturas[index].situacao = situacao;

        // Salva as alterações no arquivo JSON
        fs.writeFileSync('faturas.json', JSON.stringify(faturas, null, 2), 'utf-8');
        console.log(`Fatura ${numeroFatura} atualizada com sucesso.`);

        res.status(200).json(faturas[index]);
    } catch (error) {
        console.error('Erro ao atualizar campos da fatura:', error);
        res.status(500).send({ error: 'Erro ao atualizar campos da fatura.' });
    }
});

// Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
