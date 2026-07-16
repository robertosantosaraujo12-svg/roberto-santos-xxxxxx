# Manual de Implantação (Deployment Guide)
**Projeto:** PIRAMID ENERGY GOVERNANCE
**Tecnologia:** React + Vite + TypeScript + Firebase Hosting

Este guia contém as instruções passo a passo para que o técnico possa configurar, compilar e implantar o sistema no **Firebase Hosting**.

---

## 📋 Pré-requisitos
Antes de começar, certifique-se de ter instalado na máquina:
1. **Node.js** (versão 18 ou superior)
2. **NPM** (geralmente vem instalado junto com o Node.js)
3. Conta com acesso ao projeto do Firebase correspondente (`piramyd-energy-govevernance`).

---

## 🚀 Passo a Passo para Implantação

### 1. Extrair os Arquivos
* Extraia o conteúdo do arquivo `codigo_fonte.zip` em uma pasta local em seu computador.
* Abra o terminal (Prompt de Comando ou PowerShell no Windows, ou Terminal no Mac/Linux) e navegue até a pasta extraída:
  ```bash
  cd /caminho/para/a/pasta/extraida
  ```

### 2. Instalar a Firebase CLI
Caso ainda não tenha a ferramenta do Firebase instalada globalmente, execute:
```bash
npm install -g firebase-tools
```

### 3. Autenticar no Firebase
Para conectar a CLI à sua conta do Firebase, execute:
```bash
firebase login
```
*Isso abrirá uma janela no seu navegador para fazer login com a conta Google que possui permissões no projeto do Firebase.*

### 4. Instalar as Dependências do Projeto
Baixe e instale todos os pacotes e bibliotecas necessários executando:
```bash
npm install
```

### 5. Compilar o Projeto (Build de Produção)
Gere os arquivos estáticos otimizados para produção executando:
```bash
npm run build
```
*Este comando criará uma pasta chamada `/dist` na raiz do projeto com todo o código otimizado, minificado e pronto para ser servido.*

### 6. Selecionar o Projeto no Firebase
O arquivo `.firebaserc` já está pré-configurado com o ID do projeto `piramyd-energy-govevernance`. Para garantir que a CLI usará o projeto correto, execute:
```bash
firebase use default
```

### 7. Implantar (Deploy) no Firebase Hosting
Para enviar o site compilado para os servidores do Firebase, execute o comando:
```bash
firebase deploy --only hosting
```
Ao final da execução, o terminal exibirá a URL pública gerada pelo Firebase (ex: `https://piramyd-energy-govevernance.web.app` ou `https://piramyd-energy-govevernance.firebaseapp.com`).

---

## 🌐 Configurando um Domínio Personalizado (ex: seu-dominio.com.br)
Para vincular o sistema ao seu próprio domínio:

1. Acesse o **Console do Firebase** (https://console.firebase.google.com/).
2. Selecione o projeto **Piramyd Energy Governance**.
3. No menu lateral esquerdo, vá em **Build** > **Hosting**.
4. Clique no botão **Adicionar domínio personalizado** (Add custom domain).
5. Digite o seu domínio (ex: `sistema.piramydenergy.com.br`) e siga as instruções na tela:
   * **Verificação de Propriedade:** O Firebase fornecerá um registro do tipo `TXT` para você adicionar na tabela DNS do seu registrador de domínio (onde você comprou o domínio, como Registro.br, HostGator, GoDaddy, etc.).
   * **Configuração de Apontamento:** Após verificado, o Firebase fornecerá um ou dois registros do tipo `A` (com IPs do Google) para você adicionar no seu gerenciador de DNS.
6. Após atualizar o DNS, o certificado SSL gratuito (HTTPS) será gerado automaticamente pelo Firebase em algumas horas.

---

## 🛠️ Comandos Úteis para Desenvolvimento Local
Se o técnico ou desenvolvedor precisar fazer alterações ou testar o projeto localmente:

* **Iniciar Servidor de Desenvolvimento:**
  ```bash
  npm run dev
  ```
  *(Inicia o servidor local, acessível por padrão em http://localhost:3000)*

* **Simular o Ambiente de Produção Localmente (Firebase Emulator):**
  ```bash
  firebase serve
  ```
  *(Permite testar as regras de rotas e o build exatamente como rodará no servidor do Firebase)*
