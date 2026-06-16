# 2. Configure a Infraestrutura AWS

Guia prático para configurar a infraestrutura AWS necessária para o NFS File Manager usando o **Console AWS**. Este guia é direcionado para usuários com conhecimento intermediário.

---

## 📋 Pré-requisitos

- Conta AWS ativa com permissões administrativas
- Acesso ao Console AWS
- Conhecimento de VPC, Security Groups e EC2
- Região AWS selecionada: **us-east-1** (ajuste conforme necessário)

---

## 🎯 Visão Geral da Infraestrutura

```
┌─────────────────────────────────────────────────────────────┐
│                          VPC (10.0.0.0/16)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │  Public Sub 1   │          │  Public Sub 2   │           │
│  │ (10.0.1.0/24)   │          │ (10.0.2.0/24)   │           │
│  │  us-east-1a     │          │  us-east-1b     │           │
│  │                 │          │                 │           │
│  │  ┌───────────┐  │          │  ┌───────────┐  │           │
│  │  │ EC2 - 1   │  │          │  │ EC2 - 2   │  │           │
│  │  │ Ubuntu    │  │          │  │ Ubuntu    │  │           │
│  │  └───────────┘  │          │  └───────────┘  │           │
│  └─────────────────┘          └─────────────────┘           │
│           ▲                             ▲                    │
│           └─────────────┬───────────────┘                    │
│                         │                                    │
│           ┌─────────────▼────────────────┐                  │
│           │  Application Load Balancer   │                  │
│           └──────────────────────────────┘                  │
│                                                               │
│  ┌─────────────────┐          ┌─────────────────┐           │
│  │ Private Sub 1   │          │ Private Sub 2   │           │
│  │ (10.0.3.0/24)   │          │ (10.0.4.0/24)   │           │
│  │  us-east-1a     │          │  us-east-1b     │           │
│  │                 │          │                 │           │
│  │  ┌───────────┐  │          │  ┌───────────┐  │           │
│  │  │ Mount NFS │  │          │  │ Mount NFS │  │           │
│  │  └───────────┘  │          │  └───────────┘  │           │
│  └─────────────────┘          └─────────────────┘           │
│           ▲                             ▲                    │
│           └─────────────┬───────────────┘                    │
│                         │                                    │
│           ┌─────────────▼────────────────┐                  │
│           │         EFS (NFS)            │                  │
│           │   (Elastic File System)      │                  │
│           └──────────────────────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Passo 1: Criar VPC

### 1.1 Acessar VPC Dashboard

1. Faça login no **Console AWS**
2. Vá para **Services** → **VPC** → **Your VPCs**
3. Clique em **Create VPC**

### 1.2 Configurar VPC

Na página de criação:

| Campo | Valor |
|-------|-------|
| **VPC only** | Selecione esta opção |
| **Name tag** | `nfs-vpc` |
| **IPv4 CIDR block** | `10.0.0.0/16` |
| **IPv6 CIDR block** | Sem IPv6 (deixe em branco) |
| **Tenancy** | Default |

Clique em **Create VPC**

> **Nota:** Salve o **VPC ID** (ex: `vpc-xxxxxxxx`) para usar nos próximos passos.

---

## 🌐 Passo 2: Criar Internet Gateway

### 2.1 Acessar Internet Gateway

1. No painel de VPC, clique em **Internet Gateways** (lado esquerdo)
2. Clique em **Create internet gateway**

### 2.2 Configurar IGW

| Campo | Valor |
|-------|-------|
| **Name tag** | `nfs-igw` |

Clique em **Create internet gateway**

### 2.3 Anexar IGW à VPC

1. O IGW foi criado e está em estado **Detached**
2. Selecione o IGW criado
3. Clique em **Attach to VPC**
4. Selecione a VPC `nfs-vpc` que você criou
5. Clique em **Attach internet gateway**

---

## 🛣️ Passo 3: Criar Subnets

### 3.1 Criar Subnet Pública 1

1. No painel de VPC, clique em **Subnets**
2. Clique em **Create subnet**

| Campo | Valor |
|-------|-------|
| **VPC ID** | Selecione `nfs-vpc` |
| **Subnet name** | `nfs-public-subnet-1` |
| **Availability Zone** | `us-east-1a` |
| **IPv4 CIDR block** | `10.0.1.0/24` |

Clique em **Create subnet**

### 3.2 Criar Subnet Pública 2

Repita o processo anterior com:

| Campo | Valor |
|-------|-------|
| **Subnet name** | `nfs-public-subnet-2` |
| **Availability Zone** | `us-east-1b` |
| **IPv4 CIDR block** | `10.0.2.0/24` |

### 3.3 Criar Subnet Privada 1

| Campo | Valor |
|-------|-------|
| **Subnet name** | `nfs-private-subnet-1` |
| **Availability Zone** | `us-east-1a` |
| **IPv4 CIDR block** | `10.0.3.0/24` |

### 3.4 Criar Subnet Privada 2

| Campo | Valor |
|-------|-------|
| **Subnet name** | `nfs-private-subnet-2` |
| **Availability Zone** | `us-east-1b` |
| **IPv4 CIDR block** | `10.0.4.0/24` |

---

## 📋 Passo 4: Configurar Route Tables

### 4.1 Criar Route Table Pública

1. Clique em **Route Tables** (lado esquerdo)
2. Clique em **Create route table**

| Campo | Valor |
|-------|-------|
| **Name** | `nfs-public-rt` |
| **VPC** | Selecione `nfs-vpc` |

Clique em **Create route table**

### 4.2 Adicionar Rota para Internet Gateway

1. Selecione a route table `nfs-public-rt`
2. Vá para a aba **Routes**
3. Clique em **Edit routes**
4. Clique em **Add route**

| Campo | Valor |
|-------|-------|
| **Destination** | `0.0.0.0/0` |
| **Target** | Selecione `Internet Gateway` e escolha `nfs-igw` |

Clique em **Save routes**

### 4.3 Associar Subnets Públicas à Route Table

1. Vá para a aba **Subnet associations**
2. Clique em **Edit subnet associations**
3. Selecione as duas subnets públicas:
   - `nfs-public-subnet-1`
   - `nfs-public-subnet-2`
4. Clique em **Save associations**

> **Nota:** As subnets privadas usarão a Route Table padrão (sem acesso direto à internet)

---

## 🔐 Passo 5: Criar Security Groups

### 5.1 Criar Security Group para EC2

1. Clique em **Security Groups** (lado esquerdo)
2. Clique em **Create security group**

| Campo | Valor |
|-------|-------|
| **Security group name** | `nfs-ec2-sg` |
| **Description** | `Security Group para EC2 do NFS File Manager` |
| **VPC** | Selecione `nfs-vpc` |

Clique em **Create security group**

### 5.2 Adicionar Inbound Rules para EC2 SG

Selecione o SG `nfs-ec2-sg` e vá para **Inbound rules** → **Edit inbound rules**

Adicione as seguintes regras:

| Type | Protocol | Port Range | Source | Description |
|------|----------|-----------|--------|-------------|
| SSH | TCP | 22 | `0.0.0.0/0` | SSH access |
| HTTP | TCP | 80 | `0.0.0.0/0` | HTTP traffic |
| HTTPS | TCP | 443 | `0.0.0.0/0` | HTTPS traffic |
| NFS | TCP | 2049 | `10.0.0.0/16` | NFS mount |

Clique em **Save rules**

### 5.3 Criar Security Group para EFS

Crie um novo Security Group:

| Campo | Valor |
|-------|-------|
| **Security group name** | `nfs-efs-sg` |
| **Description** | `Security Group para EFS do NFS File Manager` |
| **VPC** | Selecione `nfs-vpc` |

### 5.4 Adicionar Inbound Rules para EFS SG

Adicione a seguinte regra:

| Type | Protocol | Port Range | Source | Description |
|------|----------|-----------|--------|-------------|
| NFS | TCP | 2049 | `10.0.0.0/16` | NFS from VPC |

Clique em **Save rules**

---

## 🖥️ Passo 6: Criar EC2 Instances

### 6.1 Criar Primeira Instância EC2

1. Acesse **Services** → **EC2**
2. Clique em **Instances**
3. Clique em **Launch instances**

#### Configuração:

**Step 1: Name and tags**
- **Name:** `nfs-server-1`

**Step 2: Application and OS Images**
- Procure por `Ubuntu 22.04 LTS`
- Selecione a AMI mais recente (x86_64)

**Step 3: Instance type**
- **Instance type:** `t3.medium`

**Step 4: Key pair**
- Se não tiver uma key pair:
  - Clique em **Create new key pair**
  - **Key pair name:** `nfs-key`
  - **Key pair type:** RSA
  - **Private key file format:** .pem
  - Clique em **Create key pair** (salve em local seguro)
- Se já tiver, selecione `nfs-key`

**Step 5: Network settings**
- **VPC:** Selecione `nfs-vpc`
- **Subnet:** `nfs-public-subnet-1` (us-east-1a)
- **Auto-assign public IP:** Enable
- **Firewall (security groups):** Selecione `nfs-ec2-sg`

**Step 6: Configure storage**
- **Size:** 30 GiB
- **Volume type:** gp3

**Step 7: Advanced details**
- Deixe padrão

Clique em **Launch instance**

### 6.2 Criar Segunda Instância EC2

Repita o processo anterior com as seguintes diferenças:

- **Name:** `nfs-server-2`
- **Subnet:** `nfs-public-subnet-2` (us-east-1b)
- **Rest:** Igual ao anterior

### 6.3 Aguardar Instâncias Iniciarem

1. Vá para **Instances**
2. Aguarde até que ambas as instâncias tenham:
   - **Instance State:** Running
   - **Status checks:** 2/2 passed

Salve os **Public IPs** das instâncias para acesso via SSH.

---

## 📁 Passo 7: Criar EFS (Elastic File System)

### 7.1 Acessar EFS

1. Acesse **Services** → **EFS**
2. Clique em **File systems**
3. Clique em **Create file system**

### 7.2 Configurar EFS

**General:**
- **Name:** `nfs-efs`

**Availability and durability:**
- **Storage class:** Standard
- **Performance mode:** General purpose
- **Throughput mode:** Bursting

**Encryption:**
- **Encryption of data at rest:** Enable

**Network:**
- **VPC:** Selecione `nfs-vpc`

Clique em **Create**

### 7.3 Aguardar EFS Estar Disponível

O EFS pode levar alguns minutos para ficar pronto. Aguarde o estado mudar para **Available**.

> **Salve o EFS ID** (ex: `fs-xxxxxxxx`) para o próximo passo.

### 7.4 Criar Mount Targets

Após o EFS estar disponível:

1. Selecione o EFS `nfs-efs`
2. Vá para a aba **Network**
3. Clique em **Create mount target**

**Mount Target 1:**
- **Subnet:** `nfs-private-subnet-1` (us-east-1a)
- **Security groups:** Selecione `nfs-efs-sg`
- Clique em **Create mount target**

**Mount Target 2:**
- **Subnet:** `nfs-private-subnet-2` (us-east-1b)
- **Security groups:** Selecione `nfs-efs-sg`
- Clique em **Create mount target**

> Aguarde os mount targets ficarem em estado **Available**

---

## ⚖️ Passo 8: Criar Load Balancer

### 8.1 Criar Target Group

1. Acesse **Services** → **EC2**
2. Clique em **Target Groups** (lado esquerdo)
3. Clique em **Create target group**

**Basic configuration:**
- **Choose a target type:** Instances
- **Target group name:** `nfs-tg`
- **Protocol:** HTTP
- **Port:** 80
- **VPC:** Selecione `nfs-vpc`

**Health checks:**
- **Health check protocol:** HTTP
- **Health check path:** `/`
- **Port:** traffic port
- **Healthy threshold:** 2
- **Unhealthy threshold:** 2
- **Timeout:** 5 seconds
- **Interval:** 30 seconds
- **Success codes:** 200

Clique em **Next**

### 8.2 Registrar Targets

Na próxima página:
1. Selecione as duas instâncias EC2 (`nfs-server-1` e `nfs-server-2`)
2. Clique em **Include as pending below**
3. Clique em **Create target group**

### 8.3 Criar Application Load Balancer

1. Clique em **Load Balancers** (lado esquerdo)
2. Clique em **Create load balancer**
3. Selecione **Application Load Balancer**
4. Clique em **Create**

**Basic configuration:**
- **Load balancer name:** `nfs-alb`
- **Scheme:** Internet-facing
- **IP address type:** IPv4

**Network mapping:**
- **VPC:** Selecione `nfs-vpc`
- **Subnets:** Selecione ambas as subnets públicas:
  - `nfs-public-subnet-1`
  - `nfs-public-subnet-2`

**Security groups:**
- Remova o SG padrão
- Selecione `nfs-ec2-sg`

**Listeners and routing:**
- **Protocol:** HTTP
- **Port:** 80
- **Default action:** Forward to `nfs-tg`

Clique em **Create load balancer**

### 8.4 Aguardar ALB Estar Disponível

Aguarde o ALB atingir estado **Active**. Isso pode levar alguns minutos.

> **Salve o DNS name do ALB** (ex: `nfs-alb-xxxxxxxx.us-east-1.elb.amazonaws.com`)

---

## ✅ Passo 9: Verificar Infraestrutura

### 9.1 Testar Health Checks

1. Vá para **Target Groups**
2. Selecione `nfs-tg`
3. Vá para a aba **Targets**
4. Aguarde os targets mudarem para **Healthy**

Se os targets ficarem **Unhealthy**, verifique:
- Aplicação está rodando nas instâncias EC2
- Security groups permitem tráfego HTTP
- Subnets têm rotas corretas

### 9.2 Testar Acesso via ALB

1. Copie o DNS name do ALB
2. Cole em um navegador: `http://nfs-alb-xxxxx.us-east-1.elb.amazonaws.com`
3. Você deve ver a aplicação respondendo

### 9.3 Verificar EFS Mount Points

1. SSH para uma das instâncias EC2:
```bash
ssh -i nfs-key.pem ubuntu@<EC2_PUBLIC_IP>
```

2. Verifique os mount targets:
```bash
aws efs describe-mount-targets --file-system-id fs-xxxxxxxx
```

---

## 🔗 Próximas Etapas

Agora que a infraestrutura está configurada:

1. **Deploy da Aplicação:** Consulte `DEPLOYMENT.md`
2. **Configurar HTTPS:** Use AWS Certificate Manager + ALB
3. **Auto Scaling:** Crie Auto Scaling Groups
4. **Monitoramento:** Configure CloudWatch e alarms
5. **Backup:** Habilite EFS backup automático

---

## 🆘 Troubleshooting

### EC2 Instances não iniciam
- Verifique quotas de EC2 na sua conta
- Confira permissões de IAM
- Verifique se a chave privada foi salva corretamente

### EFS não monta
```bash
# SSH para instância EC2 e verifique:
sudo apt-get install nfs-common
sudo mount -t nfs4 fs-xxxxxxxx.efs.us-east-1.amazonaws.com:/ /mnt/efs
```

### Health checks falham
- SSH na instância e verifique se a app está rodando
- Teste localmente: `curl http://localhost:80`
- Verifique logs: `sudo tail -f /var/log/syslog`

### ALB não responde
- Verifique se instâncias têm rotas para internet
- Confira security groups (permitem tráfego na porta 80)
- Aguarde mais tempo (ALB pode levar alguns minutos)

---

## 📊 Checklist Final

- [ ] VPC criada com CIDR 10.0.0.0/16
- [ ] Internet Gateway anexado à VPC
- [ ] 4 Subnets criadas (2 públicas, 2 privadas)
- [ ] Route Table pública com rota para IGW
- [ ] Security Group EC2 com regras corretas
- [ ] Security Group EFS com regra NFS
- [ ] 2 EC2 Instances (Ubuntu 22.04) em subnets públicas
- [ ] EFS criado com mount targets nas subnets privadas
- [ ] Application Load Balancer criado e ativo
- [ ] Target Group com 2 targets saudáveis
- [ ] ALB responde via HTTP

---

**Pronto! Sua infraestrutura AWS está configurada e pronta para deploy.** 🚀
