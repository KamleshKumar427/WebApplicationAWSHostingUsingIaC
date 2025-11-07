# **README**

This guide will help you **deploy and test** the full project —
including **Infrastructure (AWS CDK)**, **Backend (Node.js API)**, and **Frontend (React)** —
in your own AWS account **from scratch**. This guide works for deployment via Windows/Mac/Linxu OS

---

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



