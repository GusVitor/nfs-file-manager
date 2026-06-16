# Deployment Guide 🚀

Instruções passo a passo para fazer deploy da aplicação NFS File Manager nas instâncias EC2.

## 📋 Pré-requisitos

- ✅ Infraestrutura AWS criada ([SETUP-AWS.md](./SETUP-AWS.md))
- ✅ 2 EC2 Instances rodando (Ubuntu 22.04 LTS)
- ✅ EFS criado e montado
- ✅ Load Balancer configurado
- ✅ Arquivo `.pem` da chave SSH

## 🔑 Conectar via SSH

### Obter o endereço IP público
1. Vá para **AWS Console** → **EC2** → **Instances**
2. Copie o **Public IPv4 address** da primeira instância (ex: `3.123.45.67`)

### Conectar (Linux/Mac)
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@3.123.45.67
```

### Conectar (Windows - PuTTY)
1. Converta `.pem` para `.ppk` usando PuTTYgen
2. Abra PuTTY
3. Host: `ubuntu@3.123.45.67`
4. Auth → Private key: selecione `.ppk`
5. Conecte

---

## 🔄 Executar em Ambas as Instâncias

**Execute os passos abaixo em AMBAS as EC2 instances**

---

## 1️⃣ Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 2️⃣ Instalar Dependências

```bash
# Python e pip
sudo apt install -y python3.9 python3-pip python3-venv

# Build tools (para compilar módulos)
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev

# NFS client
sudo apt install -y nfs-common

# Nginx (reverse proxy - opcional, pode usar Gunicorn direto)
sudo apt install -y nginx
```

---

## 3️⃣ Criar Diretório do Projeto

```bash
mkdir -p ~/nfs-file-manager
cd ~/nfs-file-manager
```

---

## 4️⃣ Clonar Repositório

```bash
git clone https://github.com/GusVitor/nfs-file-manager.git .
```

Ou se preferir usar HTTPS sem credenciais:
```bash
git clone https://github.com/GusVitor/nfs-file-manager.git .
```

---

## 5️⃣ Criar Diretório NFS

```bash
# Criar ponto de montagem
sudo mkdir -p /mnt/nfs
sudo chown ubuntu:ubuntu /mnt/nfs
```

---

## 6️⃣ Montar EFS

### Obter o DNS do EFS
1. Vá para **AWS Console** → **EFS**
2. Selecione `nfs-storage`
3. Copie o **DNS name** (ex: `fs-12345678.efs.us-east-1.amazonaws.com`)

### Montar o EFS
```bash
# Substituir fs-xxxxx.efs.region.amazonaws.com pelo seu DNS
sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 \
  fs-xxxxx.efs.us-east-1.amazonaws.com:/ /mnt/nfs

# Verificar montagem
df -h | grep nfs
```

### Montar automaticamente no boot (fstab)
```bash
# Adicionar ao fstab
echo "fs-xxxxx.efs.us-east-1.amazonaws.com:/ /mnt/nfs nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 0 0" \
  | sudo tee -a /etc/fstab
```

---

## 7️⃣ Configurar Ambiente Python

```bash
# Criar virtual environment
python3 -m venv venv

# Ativar
source venv/bin/activate

# Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 8️⃣ Criar Diretório de Uploads

```bash
# Criar diretório dentro do NFS
mkdir -p /mnt/nfs/uploads
chmod 777 /mnt/nfs/uploads

# Verificar
ls -la /mnt/nfs/
```

---

## 9️⃣ Testar Aplicação Localmente

```bash
# Ativar venv (se não estiver ativado)
source venv/bin/activate

# Executar aplicação
python3 app.py
```

Acesse `http://localhost:5000` (ou `http://<IP-PUBLICO>:5000`)

Deve ver a interface web. Teste:
- ✅ Upload de arquivo
- ✅ Listagem
- ✅ Download

Paralize com `Ctrl+C`

---

## 🔟 Configurar Gunicorn

### Instalar Gunicorn
```bash
source venv/bin/activate
pip install gunicorn
```

### Testar com Gunicorn
```bash
source venv/bin/activate
gunicorn --bind 0.0.0.0:8000 --workers 4 app:app
```

Acesse `http://<IP-PUBLICO>:8000`

Paralize com `Ctrl+C`

---

## 1️⃣1️⃣ Configurar Serviço Systemd

### Criar arquivo de serviço
```bash
sudo nano /etc/systemd/system/nfs-file-manager.service
```

### Colar conteúdo
```ini
[Unit]
Description=NFS File Manager Flask Application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/nfs-file-manager
Environment="PATH=/home/ubuntu/nfs-file-manager/venv/bin"
ExecStart=/home/ubuntu/nfs-file-manager/venv/bin/gunicorn \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 60 \
    app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Salvar (Ctrl+X, Y, Enter)

### Ativar serviço
```bash
sudo systemctl daemon-reload
sudo systemctl enable nfs-file-manager
sudo systemctl start nfs-file-manager
```

### Verificar status
```bash
sudo systemctl status nfs-file-manager
```

Saída esperada:
```
● nfs-file-manager.service - NFS File Manager Flask Application
     Loaded: loaded (/etc/systemd/system/nfs-file-manager.service; enabled; vendor preset: enabled)
     Active: active (running)
```

### Ver logs
```bash
sudo journalctl -u nfs-file-manager -f
```

---

## 1️⃣2️⃣ Configurar Nginx (Reverse Proxy - Opcional)

Se quiser usar Nginx como reverse proxy na porta 80:

### Criar configuração
```bash
sudo nano /etc/nginx/sites-available/nfs-file-manager
```

### Colar conteúdo
```nginx
upstream nfs_app {
    server 127.0.0.1:8000;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://nfs_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/ubuntu/nfs-file-manager/static/;
    }
}
```

### Ativar
```bash
sudo ln -s /etc/nginx/sites-available/nfs-file-manager /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 1️⃣3️⃣ Verificar Acesso via Load Balancer

### Aguarde health checks
1. Vá para **AWS Console** → **Load Balancers**
2. Selecione `nfs-alb`
3. Vá para **Target groups** → `nfs-targets`
4. Aguarde Status mudar para **Healthy** (pode levar 1-2 min)

### Testar via Load Balancer
```bash
# Obter DNS do Load Balancer
curl http://nfs-alb-xxxxx.region.elb.amazonaws.com

# Ou acesse no navegador
# http://nfs-alb-xxxxx.region.elb.amazonaws.com
```

---

## ✅ Checklist de Deployment

**Em AMBAS as instâncias:**

- ✅ Sistema atualizado
- ✅ Dependências instaladas
- ✅ Repositório clonado
- ✅ EFS montado e testado
- ✅ Virtual environment criado
- ✅ Gunicorn funcionando
- ✅ Serviço systemd criado e ativo
- ✅ Nginx configurado (opcional)

**AWS:**

- ✅ Load Balancer com targets HEALTHY
- ✅ Acesso via DNS do Load Balancer

---

## 🧪 Testes

### Teste 1: Upload via cURL
```bash
curl -F "file=@/etc/hostname" \
  http://nfs-alb-xxxxx.region.elb.amazonaws.com/api/upload
```

### Teste 2: Listar arquivos
```bash
curl http://nfs-alb-xxxxx.region.elb.amazonaws.com/api/files
```

### Teste 3: Interface Web
Acesse no navegador:
```
http://nfs-alb-xxxxx.region.elb.amazonaws.com
```

---

## 🔧 Troubleshooting

### A aplicação não inicia

```bash
# Ver logs
sudo journalctl -u nfs-file-manager -n 50

# Testar manualmente
source ~/nfs-file-manager/venv/bin/activate
python3 ~/nfs-file-manager/app.py
```

### EFS não monta

```bash
# Verificar conectividade
sudo nmap -p 2049 fs-xxxxx.efs.region.amazonaws.com

# Testar montagem manual
sudo mount -t nfs4 -o nfsvers=4.1 \
  fs-xxxxx.efs.region.amazonaws.com:/ /mnt/nfs

# Ver erros
dmesg | tail -20
```

### Load Balancer mostra Unhealthy

1. Verificar se Gunicorn está rodando:
   ```bash
   sudo systemctl status nfs-file-manager
   ```

2. Testar health check manualmente:
   ```bash
   curl http://localhost:8000/api/health
   ```

3. Aguardar health check passar (pode levar 1-2 min)

### Permissões de arquivo

```bash
# Garantir permissões no NFS
sudo chown -R ubuntu:ubuntu /mnt/nfs
sudo chmod -R 755 /mnt/nfs
```

---

## 📈 Monitoramento

### Ver logs da aplicação
```bash
sudo journalctl -u nfs-file-manager -f
```

### Ver logs do Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Ver espaço em disco
```bash
df -h
```

### Ver status do EFS
```bash
sudo nfsstat
```

---

## 🎉 Deploy Completo!

Sua aplicação está:
- ✅ Rodando em 2 EC2 Instances
- ✅ Distribuída por Load Balancer
- ✅ Com NFS storage centralizado
- ✅ Pronta para produção (básico)

Acesse: `http://nfs-alb-xxxxx.region.elb.amazonaws.com`

---

## 📚 Próximos Passos

- Adicionar HTTPS/SSL (usar ACM + ALB)
- Implementar autenticação
- Adicionar banco de dados para logs
- Implementar quotas de espaço
- Adicionar verificação de antivírus
