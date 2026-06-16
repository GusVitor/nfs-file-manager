# NFS File Manager 📁

Um projeto simples e funcional para gerenciamento de arquivos em um diretório NFS, desenvolvido como validação de conceitos e demonstração de skills em:
- **Backend**: Python/Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Infraestrutura AWS**: EC2, ELB, NFS, VPC, Security Groups
- **DevOps**: Deploy em Ubuntu Server, configuração de serviços

## 🎯 Funcionalidades

✅ **Upload de Arquivos** - Envie arquivos para o diretório NFS  
✅ **Download de Arquivos** - Baixe arquivos armazenados no NFS  
✅ **Listar Arquivos** - Visualize todos os arquivos disponíveis  
✅ **Interface Web** - UI simples e responsiva  
✅ **API REST** - Endpoints documentados para integração  

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Internet/Usuários                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          AWS Load Balancer (ELB/ALB)                 │
│         Distribui tráfego entre EC2s                 │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐        ┌────────▼──────┐
│   EC2 #1     │        │    EC2 #2     │
│  Ubuntu 22   │        │   Ubuntu 22   │
│   Flask      │        │    Flask      │
└───────┬──────┘        └────────┬──────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────▼───────────┐
        │   AWS EFS/NFS Server   │
        │  Armazena arquivos     │
        └────────────────────────┘
```

## 📋 Pré-requisitos

- AWS Account com acesso a EC2, ELB, EFS/NFS
- Ubuntu Server 22.04 LTS
- Python 3.9+
- pip3

## 🚀 Quick Start

### 1. Clone o repositório
```bash
git clone https://github.com/GusVitor/nfs-file-manager.git
cd nfs-file-manager
```

### 2. Configure a Infraestrutura AWS
Siga o guia completo em [SETUP-AWS.md](./SETUP-AWS.md)

### 3. Deploy na Instância EC2
Siga o passo a passo em [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 Documentação

- **[SETUP-AWS.md](./SETUP-AWS.md)** - Guia completo de infraestrutura AWS (VPC, EC2, ELB, NFS)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Instruções de clone, instalação e execução
- **[API.md](./API.md)** - Documentação dos endpoints REST

## 🛠️ Tecnologias

| Componente | Tecnologia |
|-----------|-----------|
| Backend | Python 3.9+ / Flask 2.3+ |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Servidor Web | Gunicorn |
| Infraestrutura | AWS (EC2, ELB, VPC, EFS) |
| SO | Ubuntu Server 22.04 LTS |
| Armazenamento | NFS (Network File System) |

## 📊 Estrutura do Projeto

```
nfs-file-manager/
├── README.md                    # Este arquivo
├── SETUP-AWS.md                 # Guia infraestrutura AWS
├── DEPLOYMENT.md                # Guia de deployment
├── API.md                       # Documentação da API
├── requirements.txt             # Dependências Python
├── app.py                       # Aplicação Flask
├── nfs_file_manager.service     # Serviço systemd
└── static/
    ├── index.html               # Frontend
    ├── style.css                # Estilos
    └── script.js                # Lógica cliente
```

## 🔒 Segurança

- Validação de caminhos para prevenir directory traversal
- Security Groups restritivos na AWS
- Arquivo ignorado: `.env` para credenciais

## 📝 Licença

Este projeto é de código aberto para fins educacionais e de portfólio.

## 👨‍💼 Autor

**Gustavo Vitor**  
Portfolio & Validação de Conceitos em Infraestrutura AWS e Aplicações Web

---

**Comece agora:** [SETUP-AWS.md](./SETUP-AWS.md) → [DEPLOYMENT.md](./DEPLOYMENT.md)
