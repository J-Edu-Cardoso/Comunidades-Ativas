# 🎯 Visão Geral dos Processos - API Comunidade Ativa

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMUNIDADE ATIVA - API BPMN                  │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────────┐
                          │   Usuário    │
                          │ Autenticado  │
                          └──────┬───────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Visualizar Ideias     │
                    └─────────┬───────────────┘
                              │
               ┌──────────────▼──────────────┐
               │        Que ação?            │
               └─────────┬───────────────┬───┘
                         │              │
              ┌──────────▼───┐  ┌───────▼─────────┐
              │   Criar      │  │     Votar       │
              │   Ideia      │  │   em Ideia      │
              └──────────────┘  └─────────────────┘
                         │              │
              ┌──────────▼───┐  ┌───────▼─────────┐
              │  Comentar    │  │    Buscar       │
              │   Ideia      │  │    Ideias       │
              └──────────────┘  └─────────────────┘
                         │              │
               ┌─────────▼───────────────┐
               │   Sistema Salva Dados   │
               └─────────┬───────────────┘
                         │
               ┌─────────▼───────────────┐
               │   Recalcular Métricas    │
               │   (Votos, Comentários)  │
               └─────────┬───────────────┘
                         │
               ┌─────────▼───────────────┐
               │      Notificar          │
               │      Usuário            │
               └─────────┬───────────────┘
                         │
               ┌─────────▼───────────────┐
               │    Atualizar Feed       │
               │     da Comunidade       │
               └─────────────────────────────────┘
```

## 📋 **Processos Principais Mapeados**

### **1. Autenticação e Usuários**
- **Registro:** Validação → Criação → Email de boas-vindas
- **Login:** Validação de credenciais → Geração de token JWT
- **Perfil:** Upload de avatar → Sincronização em todas as páginas
- **Admin:** Gerenciamento de usuários → Ativação/Desativação

### **2. Gerenciamento de Ideias**
- **CRUD Completo:** Criar → Listar → Visualizar → Editar → Excluir
- **Sistema de Votos:** Upvote/Downvote → Recálculo automático
- **Busca Global:** Ideias, usuários, comentários, categorias
- **Filtros:** Por categoria, usuário, status, data

### **3. Sistema de Comentários**
- **Comentários em Cascata:** Respostas a comentários
- **Moderação:** Aprovação manual ou automática
- **Contadores:** Atualização em tempo real

### **4. Administração**
- **Painel Admin:** Dashboard com métricas
- **Gerenciamento de Categorias:** CRUD completo
- **Moderação:** Aprovação/rejeição de conteúdo
- **Estatísticas:** Relatórios detalhados

## 🏗️ **Arquitetura da API**

### **Camadas da Aplicação**
```
┌─────────────────────────────────────┐
│           Frontend (HTML/JS)        │
│  - Profile.html, index.html         │
│  - nova-ideia.html, login.html      │
└─────────────────┬───────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────┐
│         Middleware & Auth            │
│  - JWT Validation                   │
│  - File Upload                      │
│  - Rate Limiting                    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Controllers                 │
│  - UserController                   │
│  - IdeaController                   │
│  - CategoryController               │
│  - CommentController                │
└─────────────────┬───────────────────┘
                  │ Sequelize ORM
┌─────────────────▼───────────────────┐
│         Database Models             │
│  - User, UserProfile                │
│  - Idea, Category                   │
│  - Comment, Vote                    │
└─────────────────┬───────────────────┘
                  │ PostgreSQL
┌─────────────────▼───────────────────┐
│         Database Engine             │
│  - Tables, Indexes, Constraints     │
│  - Triggers, Stored Procedures      │
└─────────────────────────────────────┘
```

## 📊 **Métricas e KPIs**

### **Indicadores de Performance**
- ⏱️ **Tempo de Resposta:** < 200ms para consultas
- 📈 **Throughput:** 1000+ requisições/minuto
- 🔄 **Uptime:** 99.9% disponibilidade
- 💾 **Taxa de Erro:** < 0.1% de falhas

### **Indicadores de Negócio**
- 👥 **Usuários Ativos:** Crescimento mensal
- 💡 **Ideias Submetidas:** Volume e qualidade
- 🗳️ **Taxa de Engajamento:** Votos e comentários
- ⭐ **Taxa de Conversão:** Ideias → Implementação

## 🔐 **Segurança Implementada**

### **Autenticação**
- **JWT Tokens** com expiração configurável
- **Hash de Senhas** com bcrypt
- **Rate Limiting** por IP/usuário

### **Autorização**
- **Role-based Access** (User/Admin)
- **Ownership Validation** (dono do recurso)
- **Input Sanitization** contra XSS/SQL Injection

### **Validações**
- **Schema Validation** com Joi/Yup
- **File Upload Security** (tipo, tamanho)
- **Soft Delete** para integridade

## 🚀 **Como Executar**

### **Pré-requisitos**
```bash
Node.js >= 16.0
PostgreSQL >= 13.0
```

### **Instalação**
```bash
# 1. Clonar repositório
git clone <repository-url>
cd comunidade-ativa-upx

# 2. Instalar dependências
npm install

# 3. Configurar banco de dados
npm run setup-db

# 4. Executar servidor
npm start
```

### **Testes**
```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Testes de API
npm run test:api
```

## 📁 **Estrutura de Arquivos**

```
backend/
├── controllers/           # Lógica de negócio
│   ├── UserController.js      # 👤 Usuários
│   ├── IdeaController.js      # 💡 Ideias
│   ├── CategoryController.js  # 📂 Categorias
│   ├── CommentController.js   # 💬 Comentários
│   └── StatsController.js     # 📊 Estatísticas
├── models/               # Modelos Sequelize
├── routes/               # Definição de rotas
├── middleware/           # Autenticação e upload
└── services/             # Lógica reutilizável

frontend/
├── public/               # Arquivos estáticos
│   ├── index.html           # 🏠 Página inicial
│   ├── Profile.html         # 👤 Perfil do usuário
│   ├── nova-ideia.html      # 💡 Submissão de ideias
│   ├── login.html          # 🔐 Login
│   └── register.html       # 📝 Cadastro
└── js/                   # JavaScript modular
    ├── api.js               # 🔌 Cliente HTTP
    ├── ideas.js             # 💡 Gerenciamento de ideias
    └── ui.js                # 🎨 Interface do usuário

database/
└── migrations/           # Scripts de migração
    └── *.js                 # Criação/alteração de tabelas
```

## 🎯 **Funcionalidades Implementadas**

### **✅ Completamente Funcional**
- [x] **Sistema de autenticação** completo
- [x] **CRUD de ideias** com filtros avançados
- [x] **Sistema de votos** (upvote/downvote)
- [x] **Comentários em cascata** com moderação
- [x] **Upload de avatar** com crop e sincronização
- [x] **Busca global** multi-entidade
- [x] **Admin dashboard** com estatísticas
- [x] **API RESTful** bem documentada

### **🚧 Em Desenvolvimento**
- [ ] **Sistema de notificações** em tempo real
- [ ] **Gamificação** (badges, pontos)
- [ ] **Integração com redes sociais**
- [ ] **App mobile** nativo

### **📋 Planejado**
- [ ] **Machine Learning** para recomendação de ideias
- [ ] **Análise de sentimento** dos comentários
- [ ] **Sistema de geolocalização** avançado
- [ ] **Integração com prefeituras** para implementação

---

## 📞 **Contato e Suporte**

- **📧 Email:** contato@comunidadeativa.com
- **📱 Telefone:** (11) 9999-9999
- **🌐 Website:** https://comunidadeativa.com
- **📍 Endereço:** São Paulo, Brasil

---

*Este projeto foi desenvolvido como parte do curso de **Análise e Desenvolvimento de Sistemas** da **Universidade Paulista (UNIP)**.*
