# Broadcast SaaS

Aplicação de Broadcast em que cada cliente gerencia suas conexões, contatos e mensagens, com envio simulado imediato e agendamento processado automaticamente no backend.

**Aplicação publicada:** https://broadcast-saas-d44c8.web.app

> Nenhuma mensagem real é enviada: o "envio" apenas registra a mensagem como enviada.

## Funcionalidades

- Cadastro, login, logout e recuperação de senha com Firebase Authentication. Cada usuário é um cliente.
- CRUD de conexões e de contatos (nome e celular brasileiro com DDD) vinculados a uma conexão.
- Mensagens para um ou mais contatos da conexão, com **envio imediato** ou **agendamento** para data e horário futuros (até 1 ano à frente).
- Histórico em tempo real com filtros _Todas_, _Enviadas_ e _Agendadas_, paginado em blocos de 30 mensagens.
- Edição de mensagens agendadas (reagendar ou enviar agora) e exclusão de qualquer mensagem.
- Uma Cloud Function agendada marca as mensagens vencidas como enviadas a cada minuto, mesmo com o site fechado.

## Tecnologias

| Camada         | Stack                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Frontend       | React 19, TypeScript, Vite, React Router, Material UI, Tailwind CSS, Zod |
| Backend        | Cloud Functions for Firebase (v2, Node 24), Firebase Admin SDK, Zod      |
| Infraestrutura | Cloud Firestore, Firebase Authentication, Firebase Hosting               |
| Qualidade      | ESLint, Prettier, Vitest com Firebase Emulator Suite                     |

## Arquitetura

```text
broadcast-saas/
├── web/                     # Frontend (Vite + React)
│   └── src/
│       ├── components/      # Componentes de interface
│       ├── hooks/           # Autenticação, listeners em tempo real, formulários
│       ├── layouts/         # Layouts autenticado e de autenticação
│       ├── pages/           # Telas (login, conexões, contatos, mensagens)
│       ├── services/        # Acesso ao Firebase (Firestore, Auth, callables)
│       ├── types/           # Tipos do domínio
│       └── utils/           # Validação (Zod), datas, telefone, erros
├── functions/               # Cloud Functions
│   ├── src/
│   │   ├── index.ts         # Callables autenticadas e função agendada
│   │   ├── connections.ts   # Exclusão de conexão com dependentes
│   │   ├── contacts.ts      # CRUD de contatos
│   │   ├── messages.ts      # Criação, edição e exclusão de mensagens
│   │   ├── scheduled-messages.ts  # Processamento das mensagens vencidas
│   │   └── lib/             # Schemas Zod e verificação de propriedade
│   └── test/                # Testes de regras e handlers (emulador)
├── firestore.rules
├── firestore.indexes.json
└── firebase.json
```

### Modelo de dados

Collections independentes, sem subcoleções, relacionadas por ID. Todo documento tem `ownerId` (UID do Firebase Authentication).

- `connections`: `ownerId`, `name`, `createdAt`, `updatedAt`
- `contacts`: `ownerId`, `connectionId`, `name`, `phone` (E.164), `createdAt`, `updatedAt`
- `messages`: `ownerId`, `connectionId`, `contactIds[]`, `content`, `status` (`scheduled` | `sent`), `scheduledAt`, `sentAt`, `createdAt`, `updatedAt`

### Segurança e regras de negócio

- **Isolamento entre clientes:** as Security Rules só permitem ler documentos cujo `ownerId` é o UID autenticado.
- **Escritas:** conexões são criadas e renomeadas pelo cliente, com campos e tamanhos validados nas regras. Contatos, mensagens e a exclusão de conexões passam por Cloud Functions, que validam o payload com Zod e verificam em transação a propriedade e as relações: os contatos de uma mensagem precisam pertencer ao cliente e à conexão.
- **Exclusão de conexão:** remove também os contatos e as mensagens, inclusive as agendadas. A conexão é marcada como `deleting` antes, para que nada novo seja vinculado a ela durante a exclusão.
- **Exclusão de contato:** o contato sai das mensagens agendadas; uma agendada que fica sem destinatários é excluída. O histórico de enviadas é mantido.
- **Mensagens enviadas** não podem ser editadas. Excluir uma mensagem nunca gera um novo envio.
- **Agendamento:** a função roda a cada minuto e usa uma transação por mensagem, então execuções repetidas ou concorrentes não processam a mesma mensagem duas vezes. O envio ocorre em até cerca de 1 minuto após o horário agendado.

## Executando localmente

### Pré-requisitos

- Node.js 24
- Firebase CLI (`npm install -g firebase-tools`)
- Java 11+ (para o Firebase Emulator Suite)

### Instalação

```bash
npm install --prefix web
npm install --prefix functions
cp web/.env.example web/.env.local   # preencha com a configuração do seu app web
```

### Variáveis de ambiente (`web/.env.local`)

| Variável                            | Descrição                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Configuração do app web, obtida no Console do Firebase (Configurações do projeto > Seus apps) |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Idem                                                                                          |
| `VITE_FIREBASE_PROJECT_ID`          | Idem                                                                                          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Idem                                                                                          |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Idem                                                                                          |
| `VITE_FIREBASE_APP_ID`              | Idem                                                                                          |
| `VITE_USE_FIREBASE_EMULATORS`       | `true` para usar o Emulator Suite local                                                       |

A configuração do app web não é segredo, mas os arquivos `.env*` (exceto o exemplo) ficam fora do Git.

### Com o Emulator Suite (recomendado)

```bash
# Terminal 1: Auth, Firestore e Functions locais
npm run build --prefix functions
firebase emulators:start --only auth,firestore,functions --project demo-broadcast

# Terminal 2: frontend apontando para os emuladores
cd web
VITE_USE_FIREBASE_EMULATORS=true VITE_FIREBASE_PROJECT_ID=demo-broadcast npm run dev
```

A interface dos emuladores fica em http://127.0.0.1:4000. O projeto `demo-*` garante que nada acessa o projeto real.

### Testes e qualidade

```bash
npm test --prefix functions        # regras + handlers no emulador do Firestore
npm run lint --prefix web
npm run lint --prefix functions
npm run build --prefix web
```

## Deploy

O deploy é feito com a Firebase CLI, a partir da raiz, no projeto definido em `.firebaserc`:

```bash
firebase deploy --only hosting      # build do web (predeploy) e publicação de web/dist
firebase deploy --only functions    # lint e build das Functions (predeploy) e publicação
firebase deploy --only firestore    # regras e índices
firebase deploy                     # tudo
```

- O Hosting serve `web/dist` com fallback de SPA para `/index.html` e cabeçalhos de segurança (CSP, `X-Frame-Options` e outros), definidos em `firebase.json`.
- O build do frontend lê `web/.env.local`; **não** deixe `VITE_USE_FIREBASE_EMULATORS=true` nele ao publicar.
- A função agendada exige o plano Blaze e o Cloud Scheduler habilitado.
- Os limites de validação (tamanho do nome e da mensagem, número de destinatários, prazo de agendamento) estão duplicados em `web/src/utils/validation.ts` e `functions/src/lib/validation.ts`; ao alterar um deles, atualize os dois e publique frontend e Functions.
