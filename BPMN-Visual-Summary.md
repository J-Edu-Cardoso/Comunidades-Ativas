# 🎯 **Resumo Visual dos Processos BPMN**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       📋 API COMUNIDADE ATIVA - BPMN                   │
└─────────────────────────────────────────────────────────────────────────┘

                          USUÁRIO ANÔNIMO
                                 │
                    ┌────────────▼────────────┐
                    │     REGISTRAR-SE       │
                    │   (Criar Conta)        │
                    └─────────┬───────────────┘
                              │
                              ▼
                    ┌─────────▼───────────────┐
                    │      FAZER LOGIN       │
                    │   (JWT Authentication) │
                    └─────────┬───────────────┘
                              │
                              ▼
                    ┌─────────▼───────────────┐    ┌─────────────────────────┐
                    │    USUÁRIO LOGADO      │───▶│     ADMIN DASHBOARD     │
                    │                         │    │   (Se is_admin = true)  │
                    └─────────┬───────────────┘    └─────────────────────────┘
                              │
               ┌──────────────▼──────────────┐
               │      VISUALIZAR IDEIAS     │
               │   (Listar com filtros)     │
               └─────────┬───────────────┬───┘
                         │               │
              ┌──────────▼───┐  ┌────────▼────────┐
              │   CRIAR      │  │    VOTAR        │
              │   IDEIA      │  │  (Up/Down)      │
              └──────────────┘  └─────────────────┘
                         │               │
              ┌──────────▼───┐  ┌────────▼────────┐
              │  COMENTAR    │  │    BUSCAR       │
              │   IDEIA      │  │    IDEIAS       │
              └──────────────┘  └─────────────────┘
                         │               │
               ┌─────────▼───────────────┐
               │   SALVAR NO BANCO        │
               │   (PostgreSQL)           │
               └─────────┬───────────────┘
                         │
               ┌─────────▼───────────────┐
               │   RECALCULAR MÉTRICAS     │
               │   (Votos, Comentários)   │
               └─────────┬───────────────┘
                         │
               ┌─────────▼───────────────┐
               │     NOTIFICAÇÕES         │
               │   (Email, Push, In-App)  │
               └─────────┬───────────────┘
                         │
               ┌─────────▼───────────────┐
               │   ATUALIZAR INTERFACE    │
               │   (Frontend Realtime)    │
               └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   🔐 FLUXO DE AUTENTICAÇÃO E AUTORIZAÇÃO                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐    ┌─────────┐
  │  Frontend   │───▶│   Middleware    │───▶│ Controller  │───▶│  Model  │
  │  (React/Vue)│    │  (Auth JWT)     │    │  (Business) │    │ (DB)    │
  └─────────────┘    └─────────────────┘    └─────────────┘    └─────────┘
         │                    │                     │              │
         │ HTTP Request       │ Validate Token      │ Process      │ Query DB
         │                    │                     │              │
         ◀────────────────────┴─────────────────────┘              │
                    HTTP Response with Data                        │
                                                                 │
┌─────────────────────────────────────────────────────────────────┘
│                  📊 FLUXO DE MODERAÇÃO (ADMIN)                      │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
  │ Nova Ideia  │───▶│   Admin Revisa  │───▶│   Gateway   │───▶┌─────────┐
  │ Submetida   │    │   (Dashboard)   │    │  Decisão    │   │ Aprovar │
  └─────────────┘    └─────────────────┘    └─────────────┘   └─────────┘
         │                    │                     │              │
         │                    │                     │              │ Notificar
         │                    │                     │              │ Usuário
         │                    │                     │              │
         │                    │                     │              │
         │                    │                     │              │
         │                    │                     │              │
  ┌─────────────┐    ┌─────────────────┐         │         ┌─────────┐
  │ Rejeitar    │◀───│   Notificação   │◀────────┘         │ Revisar │
  │ (Conteúdo)  │    │   ao Usuário    │                    │ Ideia   │
  └─────────────┘    └─────────────────┘                    └─────────┘
         │                    │
         │                    │
         │                    │
  ┌─────────────┐    ┌─────────────────┐
  │ Solicitar   │◀───│   Gateway       │
  │ Alterações  │    │  Moderação      │
  └─────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    🎯 PRINCIPAIS ENDPOINTS DA API                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔓 PÚBLICOS (sem autenticação)                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ GET  /health              → Verificação de saúde da API                 │
│ GET  /categories          → Listar categorias                          │
│ GET  /ideas               → Listar ideias (com filtros)                │
│ GET  /ideas/:id           → Detalhes da ideia                          │
│ GET  /search              → Busca global                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔐 PROTEGIDOS (requer autenticação JWT)                               │
├─────────────────────────────────────────────────────────────────────────┤
│ POST /auth/login          → Login de usuário                           │
│ POST /auth/register       → Registro de usuário                       │
│ POST /ideas               → Criar nova ideia                           │
│ POST /ideas/:id/vote      → Votar em ideia                             │
│ POST /ideas/:id/comments  → Comentar ideia                            │
│ GET  /users/:id           → Perfil do usuário                          │
│ PUT  /users/:id           → Atualizar perfil                           │
│ POST /users/:id/avatar    → Upload de avatar                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔑 ADMINISTRATIVOS (requer role admin)                                │
├─────────────────────────────────────────────────────────────────────────┤
│ GET  /users               → Listar usuários                            │
│ GET  /stats               → Estatísticas gerais                        │
│ POST /categories          → Criar categoria                            │
│ PUT  /categories/:id      → Atualizar categoria                       │
│ DELETE /categories/:id    → Excluir categoria                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    📈 MÉTRICAS E KPIS DO SISTEMA                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────┬───────────────────────────┐
│     PERFORMANCE     │      QUALIDADE      │       NEGÓCIO             │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ ⏱️  < 200ms         │ ✅ < 0.1% erros     │ 👥 Usuários ativos        │
│ 📈 1000+ req/min    │ 🔒 100% seguro      │ 💡 Ideias/mês             │
│ 🔄 99.9% uptime     │ 📱 Mobile-first     │ 🗳️ Votos por ideia        │
│ 💾 Cache Redis      │ 🎨 UX intuitiva     │ ⭐ Taxa conversão         │
└─────────────────────┴─────────────────────┴───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    🏗️ ARQUITETURA TÉCNICA                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐    ┌─────────┐
  │   Frontend  │───▶│   Middleware    │───▶│ Controller  │───▶│  Model  │
  │   (HTML/JS) │    │  (Auth/Upload)  │    │ (Business)  │    │  (DB)   │
  └─────────────┘    └─────────────────┘    └─────────────┘    └─────────┘
         │                    │                     │              │
         │ HTTP/JSON          │ JWT Validation      │ CRUD         │ SQL
         │                    │ File Upload         │ Validation   │ ORM
         │                    │ Rate Limiting       │              │
         ◀──────────────────────────────────────────────────────────────┘
                    JSON Response + Status Codes

┌─────────────────────────────────────────────────────────────────────────┐
│                    📱 PÁGINAS DO FRONTEND                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 🏠 index.html           → Página inicial, listagem de ideias            │
│ 👤 Profile.html         → Perfil do usuário, upload de avatar          │
│ 💡 nova-ideia.html      → Formulário para submissão de ideias          │
│ 🔐 login.html          → Autenticação de usuários                      │
│ 📝 register.html       → Cadastro de novos usuários                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    🎨 RECURSOS VISUAIS DO BPMN                          │
└─────────────────────────────────────────────────────────────────────────┘

🔵 START EVENT     → Início de um processo
🔴 END EVENT       → Fim de um processo
👤 USER TASK       → Ação que requer usuário
⚙️  SERVICE TASK   → Processamento automático
🔶 GATEWAY         → Tomada de decisão
➡️  SEQUENCE FLOW  → Fluxo de execução
📊 DATA OBJECT     → Dados processados

┌─────────────────────────────────────────────────────────────────────────┐
│                    📋 LEGENDA DOS ATORES                                 │
└─────────────────────────────────────────────────────────────────────────┘

👤 USUÁRIO         → Cidadão que usa a plataforma
⚙️  SISTEMA        → API e backend processando
🔑 ADMIN           → Administrador/moderador
📱 FRONTEND        → Interface web/mobile
🗄️  DATABASE       → PostgreSQL com dados

┌─────────────────────────────────────────────────────────────────────────┐
│                    🚀 PRÓXIMOS PASSOS                                   │
└─────────────────────────────────────────────────────────────────────────┘

✅ [COMPLETO] Sistema de avatar com sincronização
🔄 [EM ANDAMENTO] Documentação BPMN completa
📋 [PLANEJADO] Sistema de notificações real-time
🎯 [PLANEJADO] App mobile nativo
🤖 [FUTURO] Machine Learning para recomendação
🌐 [FUTURO] Integração com prefeituras

┌─────────────────────────────────────────────────────────────────────────┐
│                    📞 CONTATO E SUPORTE                                 │
└─────────────────────────────────────────────────────────────────────────┘

📧 Email: contato@comunidadeativa.com
📱 Phone: (11) 9999-9999
🌐 Web: https://comunidadeativa.com
📍 Local: São Paulo, Brasil

---
*Diagrama BPMN gerado automaticamente a partir da análise da API Comunidade Ativa*
*Última atualização: 26 de outubro de 2025*
