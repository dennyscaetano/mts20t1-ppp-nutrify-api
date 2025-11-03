# Nutrify API

API REST para gerenciamento de alimentação, dieta e controle de calorias.

## Recursos
- Cadastro e autenticação de usuários (JWT)
- Gerenciamento de alimentos
- Registro de refeições
- Controle diário de consumo calórico e progresso
- Permissões de administrador para gerenciar refeições e progresso de todos os usuários
- Documentação Swagger
- Testes unitários
- Workflow GitHub Actions

## Como rodar
1. Instale as dependências: `npm install`
2. Configure o arquivo `.env` baseado no `.env.example` (apenas `JWT_SECRET` e `PORT` são usados).
3. Inicie o servidor: `npm run dev` (a aplicação usa armazenamento em memória; não é necessário MongoDB).

## Documentação
Acesse `/api-docs` após iniciar o servidor.

## Requisitos
Consulte o documento `REQUISITOS.md` para a especificação completa dos requisitos funcionais e não-funcionais do projeto.

## Políticas de API

- Strict validation: as rotas de criação e atualização (`POST`/`PUT` em `/users`, `/foods`, `/meals`) rejeitam campos extras no corpo da requisição com resposta `400` e mensagem explicando os campos não permitidos. Use apenas os campos documentados no Swagger.
- Timestamps: as entidades retornadas incluem `createdAt` e `updatedAt` (ISO 8601), gerados automaticamente pelo repositório em memória.

### Nota sobre criação de Refeições

- O endpoint `POST /meals` aceita apenas o corpo contendo a lista de IDs de alimentos (`foods`).
- Os campos `date`, `createdAt` e `updatedAt` são gerados automaticamente pelo servidor no momento da criação da refeição e não devem ser enviados pelo cliente.
- Os campos `totalCalories`, `totalProtein`, `totalCarbs` e `totalFat` também são calculados automaticamente com base nos alimentos referenciados tanto na criação quanto na atualização.

## Controle de Progresso Diário

O endpoint `GET /progress` permite consultar o progresso diário de consumo calórico do usuário. A progressão é feita através da comparação diária do registro das calorias existentes nas refeições do usuário com sua meta calórica (`calorieGoal`).

### Parâmetros

- `date` (opcional): Data no formato `YYYY-MM-DD`. Se não fornecido, usa a data atual.
- `userId` (opcional): ID do usuário. Apenas administradores podem usar este parâmetro para consultar o progresso de outros usuários. Usuários comuns sempre consultam seu próprio progresso.

### Resposta

```json
{
  "userId": "user-1",
  "date": "2025-01-20",
  "totalCalories": 1850,
  "calorieGoal": 2000,
  "difference": 150,
  "status": "below"
}
```

O campo `status` pode ter três valores:
- `below`: Consumo abaixo da meta
- `equal`: Consumo exatamente na meta
- `above`: Consumo acima da meta

## Permissões de Administrador

Usuários com role `admin` têm acesso a funcionalidades adicionais:

- **Refeições**: Podem listar, atualizar e excluir refeições de qualquer usuário
  - `GET /meals?userId=<id>`: Lista refeições de um usuário específico (ou todas se omitido)
  - `PUT /meals/:id`: Atualiza refeição de qualquer usuário
  - `DELETE /meals/:id`: Remove refeição de qualquer usuário

- **Progresso**: Podem consultar o progresso diário de qualquer usuário
  - `GET /progress?userId=<id>&date=YYYY-MM-DD`: Consulta progresso de qualquer usuário

Exemplo de payload para criar uma refeição:

```json
{
	"foods": ["food-id-1", "food-id-2"]
}
```

Resposta de exemplo (parcial):

```json
{
	"id": "meal-1",
	"user": "user-1",
	"date": "2025-08-21T12:34:56.789Z",
	"foods": ["food-id-1", "food-id-2"],
	"totalCalories": 200,
	"totalProtein": 8.5,
	"createdAt": "2025-08-21T12:34:56.789Z",
	"updatedAt": "2025-08-21T12:34:56.789Z"
}
```

## Idioma dos testes
Todos os testes funcionais e unitários foram traduzidos para Português (pt-BR). Os relatórios gerados pelos frameworks de teste (mochawesome, jest-junit) conterão títulos e descrições em pt-BR quando executados localmente nesta base.

