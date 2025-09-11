# Documentação da API - Slim Shape Digital

## Autenticação

Algumas rotas exigem autenticação JWT. Para acessar, envie o header:

```
Authorization: Bearer {token}
```

Obtenha o token via login de administrador.

---

## Endpoints

### 1. Pré-cadastro de paciente

- **POST** `/api/pre-cadastro`
- **Descrição:** Envia todos os dados do formulário de pré-cadastro, incluindo arquivos de exames e diagnósticos.
- **Content-Type:** `multipart/form-data`
- **Campos esperados:**
  - Todos os campos do formulário (nome, dataNascimento, genero, cpf, telefone, email, endereco, cidade, estado, cep, plano, combinacao, etc)
  - Arquivos: `examesArquivos` (múltiplos), `diagnosticosArquivos` (múltiplos)
- **Exemplo de body (form-data):**
  - nome: "João da Silva"
  - dataNascimento: "01/01/1990"
  - genero: "masculino"
  - ...
  - examesArquivos: [arquivo1.pdf, arquivo2.jpg]
  - diagnosticosArquivos: [arquivo3.pdf]
- **Resposta:**

```json
{
  "success": true,
  "paciente": {
    /* dados salvos */
  }
}
```

---

### 2. Login do administrador

- **POST** `/api/admin/login`
- **Body:**

```json
{
  "email": "slimshapedigital@gmail.com",
  "password": "SUA_SENHA"
}
```

- **Resposta:**

```json
{
  "token": "JWT_TOKEN"
}
```

---

### 3. Listar pacientes

- **GET** `/api/pacientes`
- **Headers:**
  - `Authorization: Bearer JWT_TOKEN`
- **Query params:**
  - `page` (opcional, padrão 1)
  - `limit` (opcional, padrão 20)
  - `search` (opcional, busca por nome, email ou cidade)
- **Resposta:**

```json
{
  "data": [ { /* paciente */ }, ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

### 4. Listar vendas de injeções

- **GET** `/api/injecoes`
- **Headers:**
  - `Authorization: Bearer JWT_TOKEN`
- **Resposta:**

```json
{
  "data": [
    {
      "pacienteId": 1,
      "nome": "João da Silva",
      "quantidade": 5,
      "frequencia": "mensal",
      "valor": 299.9,
      "status": "pago"
    },
    ...
  ]
}
```

---

### 5. Listar planos ativos

- **GET** `/api/planos`
- **Headers:**
  - `Authorization: Bearer JWT_TOKEN`
- **Resposta:**

```json
{
  "data": [
    {
      "pacienteId": 1,
      "nome": "João da Silva",
      "progresso": "em andamento",
      "valor": 499.9,
      "status": "ativo"
    },
    ...
  ]
}
```

---

### 6. Dados para análises/gráficos

- **GET** `/api/analises`
- **Headers:**
  - `Authorization: Bearer JWT_TOKEN`
- **Resposta:**

```json
{
  "totalPacientes": 100,
  "porEstado": [ { "estado": "SP", "_count": { "estado": 30 } }, ... ],
  "porSexo": [ { "genero": "feminino", "_count": { "genero": 60 } }, ... ],
  "vendasMensais": [ { "mes": 1, "vendas": 10 }, ... ]
}
```

---

## Observações

- Todos os campos do pré-cadastro devem ser enviados conforme o frontend.
- Os arquivos enviados retornam URLs públicas do Cloudinary.
- As rotas administrativas exigem autenticação JWT.
- Em caso de erro, a resposta será `{ "error": "mensagem do erro" }`.

---

Dúvidas ou integração: consulte o backend ou envie exemplos do frontend para alinhar os campos.
