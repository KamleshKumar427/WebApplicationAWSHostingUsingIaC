<img width="1200" height="700" alt="architecture" src="https://github.com/user-attachments/assets/34afdb9c-3e60-43ef-8709-8a126e58109d" />
# **README**



<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700" font-family="Helvetica, Arial, sans-serif">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#545B64"/>
    </marker>
  </defs>

  <rect width="1200" height="700" fill="#FFFFFF"/>
  <text x="40" y="50" font-size="28" font-weight="bold" fill="#232F3E">Portfolio Tracker on AWS</text>
  <text x="40" y="78" font-size="15" fill="#545B64">React frontend and Express API, deployed with AWS CDK</text>

  <rect x="230" y="110" width="930" height="490" rx="14" fill="none" stroke="#232F3E" stroke-width="1.5" stroke-dasharray="6 5"/>
  <text x="246" y="136" font-size="14" font-weight="bold" fill="#232F3E">AWS Cloud</text>

  <rect x="480" y="290" width="660" height="190" rx="12" fill="#FBFAFF" stroke="#8C4FFF" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="496" y="314" font-size="13" font-weight="bold" fill="#8C4FFF">VPC</text>

  <line x1="190" y1="305" x2="260" y2="305" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="225" y="296" font-size="13" text-anchor="middle" fill="#545B64">HTTPS</text>

  <path d="M 345 260 V 190 H 500" fill="none" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="356" y="232" font-size="13" fill="#545B64">static files</text>

  <path d="M 345 350 V 380 H 520" fill="none" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="356" y="372" font-size="13" fill="#545B64">/api/*</text>

  <line x1="740" y1="380" x2="840" y2="380" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="790" y="370" font-size="13" text-anchor="middle" fill="#545B64">port 8080</text>

  <rect x="40" y="275" width="150" height="60" rx="10" fill="#F2F3F3" stroke="#545B64" stroke-width="2"/>
  <text x="58" y="302" font-size="16" font-weight="bold" fill="#232F3E">Users</text>
  <text x="58" y="322" font-size="13" fill="#545B64">web browser</text>

  <rect x="260" y="260" width="170" height="90" rx="10" fill="#F4EEFF" stroke="#8C4FFF" stroke-width="2"/>
  <text x="276" y="296" font-size="15" font-weight="bold" fill="#232F3E">Amazon CloudFront</text>
  <text x="276" y="318" font-size="13" fill="#545B64">single HTTPS entry</text>

  <rect x="500" y="150" width="200" height="80" rx="10" fill="#EEF7EA" stroke="#3F8624" stroke-width="2"/>
  <text x="516" y="182" font-size="15" font-weight="bold" fill="#232F3E">Amazon S3</text>
  <text x="516" y="204" font-size="13" fill="#545B64">React frontend</text>

  <rect x="520" y="345" width="220" height="70" rx="10" fill="#F4EEFF" stroke="#8C4FFF" stroke-width="2"/>
  <text x="534" y="373" font-size="14" font-weight="bold" fill="#232F3E">Application Load Balancer</text>
  <text x="534" y="395" font-size="13" fill="#545B64">routes /api traffic</text>

  <rect x="840" y="345" width="240" height="70" rx="10" fill="#FFF2E8" stroke="#ED7100" stroke-width="2"/>
  <text x="856" y="373" font-size="15" font-weight="bold" fill="#232F3E">Amazon ECS on Fargate</text>
  <text x="856" y="395" font-size="13" fill="#545B64">Express API container</text>

  <rect x="520" y="510" width="180" height="60" rx="10" fill="#EEF7EA" stroke="#3F8624" stroke-width="2"/>
  <text x="534" y="536" font-size="14" font-weight="bold" fill="#232F3E">Amazon ECR</text>
  <text x="534" y="556" font-size="12" fill="#545B64">container images</text>

  <rect x="720" y="510" width="200" height="60" rx="10" fill="#FDEBF4" stroke="#E7157B" stroke-width="2"/>
  <text x="734" y="536" font-size="14" font-weight="bold" fill="#232F3E">CloudWatch Logs</text>
  <text x="734" y="556" font-size="12" fill="#545B64">application logs</text>

  <rect x="940" y="510" width="200" height="60" rx="10" fill="#FDEEF0" stroke="#DD344C" stroke-width="2"/>
  <text x="954" y="536" font-size="14" font-weight="bold" fill="#232F3E">AWS IAM</text>
  <text x="954" y="556" font-size="12" fill="#545B64">task permissions</text>

  <rect x="380" y="630" width="440" height="40" rx="20" fill="#F2F3F3" stroke="#545B64" stroke-width="1.5"/>
  <text x="600" y="655" font-size="14" font-weight="bold" text-anchor="middle" fill="#232F3E">Infrastructure as code: AWS CDK (TypeScript)</text>
</svg>

---
This guide will help you **deploy and test** the full project —
including **Infrastructure (AWS CDK)**, **Backend (Node.js API)**, and **Frontend (React)** —
in your own AWS account **from scratch**. This guide works for deployment via Windows/Mac/Linxu OS

## Application Screenshots:
<img width="1093" height="1067" alt="image" src="https://github.com/user-attachments/assets/a297d14d-3d92-4938-bb91-d982cb18d9e1" />
<img width="1108" height="1053" alt="image" src="https://github.com/user-attachments/assets/b038ee51-5499-4f04-8c8e-713eb2d93bb8" />


## 1. Setup Your AWS Account

### Step 1.1 — Create an AWS Account

Go to [https://aws.amazon.com/](https://aws.amazon.com/) → click **“Create an AWS Account”**
and complete the signup (credit card required for free trial).

---

### Step 1.2 — Create an IAM User (for CDK and CLI)

1. In the AWS console → search **“IAM”** → **Users → Create user**
2. Name it `reviewer` (or any name you like) 
3. Don't select "Provide user access to the AWS Management Console"
4. In Set Permission tab Create select **attach policies directly**
5. Select existing policy: AdministratorAccess
6. After creating the IAM user, click the userName → “Create access key” → “Command Line Interface (CLI)” → then download or copy the key pair 
   * **Access Key ID**
   * **Secret Access Key**

Keep that file safe.

---

## 2. Install Required Tools

Open **Terminal as Administrator** and run each line below:

```powershell
# Install Node.js LTS (download installer manually if needed)
# https://nodejs.org/en/download

# Install AWS CLI (if not already installed)
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Check installation
aws --version (restart if need after installing)

# Install AWS CDK (Infrastructure-as-Code tool)
npm install -g aws-cdk

# (Optional) Restart PowerShell to load the CDK command
```

Then, **install Docker Desktop** (from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop))
and keep it **running** before deployment.

---

## 3. Configure AWS Credentials

In PowerShell:

```powershell
aws configure --profile myapp
```

It will ask for:

```
AWS Access Key ID: <paste from .csv>
AWS Secret Access Key: <paste from .csv>
Default region name: eu-north-1      # or your preferred AWS region
Default output format: json
```

Then verify that your account is connected:

```powershell
aws sts get-caller-identity --profile myapp
```

You should see your AWS account ID and username.

---

## 4. Deploy the Project (Automatic Scripts)

Now you’re ready to use the supplied scripts (PowerShell for Windows, bash for macOS/Linux). For each step below, pick the command that matches your OS.

### Step 4.1 — Set Environment
Run following commands inside the project's root folder.

*Windows (PowerShell)*  
```powershell
.\scripts\.windowsDeploymentScripts\set-env.ps1
```

*macOS / Linux (bash)*  
```bash
source scripts/LinuxAndMacDeploymentScripts/set-env.sh
```

This sets your AWS profile and region for all other scripts.

---

### Step 4.2 — Create the Infrastructure

This uses **AWS CDK** to create the infrastructure:



*Windows (PowerShell)*  
```powershell
.\scripts\.windowsDeploymentScripts\init-infra.ps1
```

*macOS / Linux (bash)*  
```bash
bash scripts/LinuxAndMacDeploymentScripts/init-infra.sh
```

🕐 *Takes about 5–10 minutes on first deploy.* When it finishes, the infrastructure is ready to host your app.

---

### Step 4.3 — Deploy the Backend


*Windows (PowerShell)*  
```powershell
.\scripts\.windowsDeploymentScripts\deploy-backend.ps1
```

*macOS / Linux (bash)*  
```bash
bash scripts/LinuxAndMacDeploymentScripts/deploy-backend.sh
```

🕐 *Takes 2–3 minutes.*

---

### Step 4.4 — Deploy the Frontend


*Windows (PowerShell)*  
```powershell
.\scripts\.windowsDeploymentScripts\deploy-frontend.ps1
```

*macOS / Linux (bash)*  
```bash
bash scripts/LinuxAndMacDeploymentScripts/deploy-frontend.sh
```

🕐 *Takes about 2 minutes.* When finished, it prints something like:

```
Frontend deployed. Open: https://d123abc.cloudfront.net
```

---

### Step 4.5 — Verify the Deployment

*Windows (PowerShell)*  
```powershell
.\scripts\.windowsDeploymentScripts\verify.ps1
```

*macOS / Linux (bash)*  
```bash
bash scripts/LinuxAndMacDeploymentScripts/verify.sh
```

You’ll see both URLs printed:

```
Frontend URL: https://d123abc.cloudfront.net
Backend URL : http://my-api-alb-123.eu-north-1.elb.amazonaws.com
```

➡️ **Open the Frontend URL** in a browser — you should see the app running and fetching data from the backend.

* Your **frontend** should be live on a CloudFront URL
  (e.g., `https://d123abc.cloudfront.net`)
* Your **backend** should be accessible through an ALB URL
  (e.g., `http://my-api-alb-123.eu-north-1.elb.amazonaws.com`)
* Visiting the frontend will show data fetched from the backend API.

---

### Step 4.6 — (Optional) Destroy Everything

When you are done testing, remove all created AWS resources (including the CDK bootstrap stack):

*Windows (PowerShell)*  
```powershell
.\scripts\.windowsDeploymentScripts\destroy-all.ps1
```

*macOS / Linux (bash)*  
```bash
bash scripts/LinuxAndMacDeploymentScripts/destroy-all.sh
```

The scripts clean up the account so the next `init-infra` run starts fresh.

---

## 5. What’s Inside the Project

```
your-project/
│
├── infra/                 # AWS CDK (Infrastructure-as-Code)
│   ├── lib/
│   │   ├── backend-stack.ts     # ECS, ECR, ALB, SSM
│   │   └── frontend-stack.ts    # S3, CloudFront, SSM
│   └── bin/infra.ts
│
├── backend/               # Node.js (Express) API
│   ├── src/index.ts
│   ├── package.json
│   └── Dockerfile
│
├── frontend/              # React + TypeScript App
│   ├── src/
│   ├── package.json
│   └── build config
│
└── scripts/
    ├── .windowsDeploymentScripts/  # PowerShell scripts for Windows deployment
    │   ├── set-env.ps1
    │   ├── init-infra.ps1
    │   ├── deploy-backend.ps1
    │   ├── deploy-frontend.ps1
    │   ├── verify.ps1
    │   └── destroy-all.ps1
    └── LinuxAndMacDeploymentScripts/     # Bash scripts for macOS / Linux deployment
        ├── set-env.sh
        ├── init-infra.sh
        ├── deploy-backend.sh
        ├── deploy-frontend.sh
        ├── verify.sh
        └── destroy-all.sh
```



---



