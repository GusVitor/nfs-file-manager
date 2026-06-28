# NFS File Manager 📁

Um projeto de validação de conceitos em infraestrutura AWS com assistência de IA para desenvolvimento da aplicação.

> **📌 Nota Importante:** A infraestrutura AWS (VPC, EC2, ELB, EFS, Security Groups) foi projetada e implementada por mim. A aplicação Flask/Frontend foi desenvolvida com assistência de IA, permitindo focar no que importa: infraestrutura robusta na cloud.

## 🎯 Funcionalidades

✅ **Upload de Arquivos** - Envie arquivos para o diretório NFS  
✅ **Download de Arquivos** - Baixe arquivos armazenados no NFS  
✅ **Listar Arquivos** - Visualize todos os arquivos disponíveis  
✅ **Interface Web** - UI simples, responsiva e intuitiva  
✅ **API REST** - Endpoints documentados para integração  
✅ **Health Checks** - Monitoramento automático da aplicação  

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Internet/Usuários                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          AWS Elastic Load Balancer (ELB)             │
│         Distribui tráfego entre EC2s                 │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐        ┌────────▼──────┐
│   EC2 #1     │        │    EC2 #2     │
│  Ubuntu 22   │        │   Ubuntu 22   │
│   Flask App  │        │   Flask App   │
│  Gunicorn    │        │  Gunicorn     │
└───────┬──────┘        └────────┬──────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────▼───────────┐
        │   AWS EFS (NFS Server) │
        │  Armazena arquivos     │
        └────────────────────────┘
```

## 📋 Pré-requisitos

- AWS Account com acesso a EC2, ELB, EFS
- Ubuntu Server 22.04 LTS (nas instâncias EC2)
- Python 3.9+
- pip3
- Conexão SSH para as instâncias
- Git instalado

## 🚀 Quick Start

### 1. Clone o repositório

```bash
git clone https://github.com/GusVitor/nfs-file-manager.git
cd nfs-file-manager
```

### 2. Configure a Infraestrutura AWS

Siga o guia completo em **[SETUP-AWS.md](./SETUP-AWS.md)**

Você irá criar:
- ✅ VPC com subnets públicas e privadas
- ✅ Security Groups para EC2 e EFS
- ✅ 2x EC2 Instances (Ubuntu 22.04)
- ✅ EFS (Elastic File System para NFS)
- ✅ Elastic Load Balancer com Health Checks

### 3. Deploy na Instância EC2

Siga o passo a passo em **[DEPLOYMENT.md](./DEPLOYMENT.md)**

Você irá:
- ✅ Clonar o repositório
- ✅ Instalar dependências Python
- ✅ Montar o NFS (EFS)
- ✅ Configurar a aplicação Flask
- ✅ Iniciar o serviço com systemd
- ✅ Configurar Gunicorn como servidor WSGI

### 4. Testar a Aplicação

Acesse via Load Balancer:
```
http://nfs-alb-xxxxx.region.elb.amazonaws.com
```

## 📖 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| **[SETUP-AWS.md](./SETUP-AWS.md)** | Guia passo a passo de infraestrutura AWS (VPC, EC2, ELB, EFS) - **Minha Autoria** |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Instruções de instalação e execução nas instâncias - **Minha Autoria** |
| **[API.md](./API.md)** | Documentação dos endpoints REST |

## 🛠️ Tecnologias

| Componente | Tecnologia | Autoria |
|-----------|-----------|---------|
| Backend | Python 3.9+ / Flask 2.3+ | IA Assistida |
| Frontend | HTML5, CSS3, Vanilla JavaScript | IA Assistida |
| Servidor Web | Gunicorn + Nginx | IA Assistida |
| **Infraestrutura** | **AWS (EC2, ELB, VPC, EFS)** | **👤 Minha Autoria** |
| **SO** | **Ubuntu Server 22.04 LTS** | **👤 Minha Autoria** |
| **Armazenamento** | **NFS (Network File System) / EFS** | **👤 Minha Autoria** |

## 📊 Estrutura do Projeto

```
nfs-file-manager/
├── README.md                    # Este arquivo
├── SETUP-AWS.md                 # 👤 Minha Autoria - Infraestrutura
├── DEPLOYMENT.md                # 👤 Minha Autoria - Deploy
├── API.md                       # Documentação API
├── requirements.txt             # Dependências Python
├── app.py                       # Backend Flask
├── .gitignore                   # Configuração Git
├── templates/
│   └── index.html               # Template HTML
├── static/
│   ├── style.css                # Estilos CSS
│   └── script.js                # Lógica JavaScript
└── venv/                        # Python Virtual Environment
```

## 🔄 Por Que IA na Aplicação?

Este projeto foi desenvolvido com um foco estratégico:

1. **Infraestrutura é o Diferencial** 🎯
   - Design robusto de VPC
   - Configuração segura de Security Groups
   - Integração ELB + EC2 + EFS
   - Deploy automatizado com systemd
   - Health checks e auto-recovery

2. **Aplicação é Suporte** 🛠️
   - Simples o suficiente para testar a infraestrutura
   - Suficientemente completa para validar conceitos
   - Foco em estrutura, não em complexidade de código

3. **Tempo Otimizado** ⏱️
   - Concentre esforço no que importa: AWS
   - Deixe IA gerar código boilerplate confiável
   - Valide conceitos de infraestrutura rapidamente

## 🎓 O Que Você Aprenderá

**Infraestrutura AWS (Minha Autoria):**
- ✅ Design de VPC com subnets públicas/privadas
- ✅ Configuração segura de Security Groups
- ✅ Criação e scaling com EC2
- ✅ Load Balancing com ELB/ALB
- ✅ Armazenamento centralizado com EFS
- ✅ Health Checks e Auto-recovery
- ✅ Deploy manual e automação com systemd

**Aplicação Web (IA Assistida):**
- ✅ Framework Flask
- ✅ Estrutura REST API
- ✅ Frontend responsivo
- ✅ Boas práticas de segurança
- ✅ Integração com NFS

## 🔒 Segurança

- ✅ Validação de caminhos para prevenir directory traversal
- ✅ Security Groups restritivos (porta 2049 para NFS)
- ✅ Limite de tamanho de arquivo (1GB)
- ✅ Nomes de arquivo sanitizados com `secure_filename`
- ✅ Sem exposição de caminhos internos
- ✅ HTTPS recomendado (usar ACM + ALB)

## 📝 Fluxo de Uso

### 1. Upload
```
Usuário → Interface Web → POST /api/upload → Flask → NFS (EFS)
```

### 2. Download
```
Usuário → Interface Web → GET /api/download → Flask → NFS (EFS) → Navegador
```

### 3. Listar Arquivos
```
Usuário → Interface Web → GET /api/files → Flask → NFS (EFS) → JSON
```

### 4. Health Check
```
Load Balancer → GET /api/health → Flask → JSON (200 OK)
```

## 📋 Endpoints da API

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| GET | `/` | Interface web | 200 |
| GET | `/api/health` | Health check para Load Balancer | 200 |
| POST | `/api/upload` | Upload de arquivo | 201 |
| GET | `/api/files` | Listar todos os arquivos | 200 |
| GET | `/api/download/<filename>` | Download de arquivo | 200 |
| DELETE | `/api/delete/<filename>` | Deletar arquivo | 200 |
| GET | `/api/info` | Informações do sistema | 200 |

## ⏱️ Tempo para Completar

- **Setup AWS**: 20-30 minutos
- **Deploy Instâncias**: 10-15 minutos por EC2
- **Testes**: 5-10 minutos

**Total**: ~1 hora

## 🧪 Testando Localmente

Antes de fazer deploy em produção, você pode testar localmente:

### 1. Clonar repositório
```bash
git clone https://github.com/GusVitor/nfs-file-manager.git
cd nfs-file-manager
```

### 2. Criar virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependências
```bash
pip install -r requirements.txt
```

### 4. Executar aplicação
```bash
python3 app.py
```

### 5. Acessar
```
http://localhost:8000
```

## 🐛 Troubleshooting

Consulte as seções de troubleshooting em:
- **[SETUP-AWS.md](./SETUP-AWS.md)** - Problemas com infraestrutura AWS
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Problemas com deploy e execução

## 💡 Aprendizados Principais

Este projeto demonstra minha capacidade de:

1. **Arquitetura AWS** 🏗️
   - Planejamento de infraestrutura escalável
   - Segurança em camadas (VPC, SGs, NFS)
   - Load balancing e distribuição de tráfego
   - Multi-AZ deployment para alta disponibilidade

2. **DevOps & Deployment** 🚀
   - Automação com systemd
   - Configuração de serviços Linux
   - Monitoramento e health checks
   - Reverse proxy com Nginx

3. **Decisões de Projeto** 📊
   - Quando usar IA vs. desenvolver manualmente
   - Otimização de tempo de projeto
   - Foco em valor agregado (infraestrutura)

4. **Integração Cloud** ☁️
   - Componentes AWS trabalhando juntos
   - NFS como storage centralizado
   - ELB distribuindo tráfego
   - Multi-instância deployment

## 📈 Próximos Passos (Opcional)

- Adicionar HTTPS/SSL (usar ACM + ALB)
- Implementar autenticação (JWT/OAuth)
- Adicionar banco de dados para logs
- Implementar quotas de espaço por usuário
- Auto Scaling com Launch Templates
- CloudWatch monitoring e alarms
- S3 backup automático do EFS

## 📝 Licença

Projeto de código aberto para fins educacionais e de portfólio.

## 👨‍💼 Autor & Infraestrutura

**Gustavo Vitor**

- 🏗️ **Infraestrutura AWS**: Minha Autoria
- 📱 **Aplicação Web**: Desenvolvida com IA assistida
- 📚 **Documentação**: Minha Autoria
- 🚀 **Deployment & DevOps**: Minha Autoria

---

## 🎬 Começar Agora

1. **Primeiro**: [SETUP-AWS.md](./SETUP-AWS.md) - Configure a infraestrutura (Minha Autoria)
2. **Depois**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Faça o deploy (Minha Autoria)
3. **Finalmente**: [API.md](./API.md) - Integre em outras aplicações (opcional)

---

**Este projeto é um exemplo de como usar IA estrategicamente para focar no que importa: infraestrutura robusta em cloud.**
