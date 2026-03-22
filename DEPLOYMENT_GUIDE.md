# 🚀 Promesa Midtown — Complete AWS EKS Deployment Guide

> **Who is this guide for?**  
> This guide is written for someone with **zero coding knowledge**. Every command is ready to copy and paste. Every technical term is explained in plain English. Just follow the steps in order, from top to bottom.

---

## 📋 Table of Contents

1. [What You're Deploying (Overview)](#1--what-youre-deploying-overview)
2. [Prerequisites — Tools You Need to Install](#2--prerequisites--tools-you-need-to-install)
3. [Download the Code](#3--download-the-code)
4. [Build & Push Docker Images to Amazon ECR](#4--build--push-docker-images-to-amazon-ecr)
5. [Create an EKS Cluster](#5--create-an-eks-cluster)
6. [Deploy the Application on EKS](#6--deploy-the-application-on-eks)
7. [Expose to the Internet (Load Balancer)](#7--expose-to-the-internet-load-balancer)
8. [Buy a Domain & Configure DNS](#8--buy-a-domain--configure-dns)
9. [Set Up HTTPS (SSL Certificate)](#9--set-up-https-ssl-certificate)
10. [Create the First Admin User](#10--create-the-first-admin-user)
11. [Access & Manage Database Data](#11--access--manage-database-data)
12. [Troubleshooting](#12--troubleshooting)
13. [How to Update the Application](#13--how-to-update-the-application)
14. [Estimated Monthly AWS Cost](#14--estimated-monthly-aws-cost)
15. [Final Folder Structure](#15--final-folder-structure)

---

## 1. 🏗️ What You're Deploying (Overview)

You are deploying the **Promesa Midtown Society Management Portal** — a website that lets residents register, manage vehicles, pay maintenance, file complaints, and submit compound requests.

### The 3-Container Architecture

Your application is made up of **3 separate programs** (called containers) that work together:

| Container | Technology | Port | What it does |
|-----------|-----------|------|--------------|
| **Frontend** | React + Nginx | 80 | The visual website users see in their browser |
| **Backend** | Node.js + Express | 5000 | The brain — handles logins, saves data, enforces rules |
| **MongoDB** | MongoDB 7 | 27017 | The database — stores all users, vehicles, complaints, etc. |

### How Data Flows

```
User opens website
      ↓
Frontend loads in the browser (React app)
      ↓
User fills out a form (e.g., registers or files a complaint)
      ↓
Frontend sends the data to the Backend (/api/... requests)
      ↓
Backend validates and saves data into MongoDB
      ↓
Backend sends a success/error response back to the Frontend
      ↓
Frontend shows a confirmation message to the user
```

### Why AWS EKS?

**EKS (Elastic Kubernetes Service)** is Amazon's managed service for running containers reliably in the cloud. It automatically restarts crashed containers, balances traffic across multiple servers, and scales up when usage grows.

---

## 2. 🛠️ Prerequisites — Tools You Need to Install

### Step 2.1 — Create an AWS Account

If you don't already have an AWS account:

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Follow the signup process (you will need a credit card, but there is a free tier)
4. After signing in, note your **12-digit Account ID** (visible in the top-right dropdown in the AWS Console) — you will need it later

### Step 2.2 — Install Required Tools

Install each tool on your computer using the links below:

| Tool | What it is | Install Link |
|------|-----------|--------------|
| **AWS CLI** | Command-line tool to talk to AWS services | [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| **kubectl** | Command-line tool to manage your Kubernetes cluster | [Install kubectl](https://kubernetes.io/docs/tasks/tools/) |
| **eksctl** | Tool specifically for creating EKS clusters on AWS | [Install eksctl](https://eksctl.io/installation/) |
| **Docker Desktop** | Runs and builds containers on your computer | [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Git** | Downloads and manages code from GitHub | [Install Git](https://git-scm.com/downloads) |

> 💡 **Tip:** After installing each tool, open a new Terminal (Mac/Linux) or Command Prompt (Windows) and verify it works by typing the tool name followed by `--version`. For example: `aws --version`

### Step 2.3 — Configure the AWS CLI

After installing AWS CLI, you need to link it to your AWS account. You'll need an **Access Key** — here's how to get one:

1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Click your name in the top-right corner → **"Security credentials"**
3. Scroll to **"Access keys"** → click **"Create access key"**
4. Choose **"Command Line Interface (CLI)"** → confirm → download the CSV file (keep it safe!)

Now run this command in your terminal:

```bash
aws configure
```

You will be asked 4 questions — answer them like this:

```
AWS Access Key ID [None]: PASTE_YOUR_ACCESS_KEY_ID_HERE
AWS Secret Access Key [None]: PASTE_YOUR_SECRET_ACCESS_KEY_HERE
Default region name [None]: ap-south-1
Default output format [None]: json
```

> ⚠️ **Security Warning:** Never share your Access Key with anyone. Treat it like a password.

---

## 3. 📥 Download the Code

Open your Terminal (Mac/Linux) or Command Prompt (Windows) and run these commands one by one:

### Step 3.1 — Clone the repository

```bash
git clone https://github.com/ARajbhar007/Project-Promesa.git
```

### Step 3.2 — Enter the project folder

```bash
cd Project-Promesa
```

### Step 3.3 — Create your environment configuration file

```bash
cp .env.example .env
```

### Step 3.4 — Edit the `.env` file

Open the `.env` file in any text editor (Notepad on Windows, TextEdit on Mac) and change the `JWT_SECRET` value to something long and random:

```env
JWT_SECRET=MyVeryStrongAndLongSecretKey2024ChangeThisNow!
```

> ⚠️ **IMPORTANT:** The JWT_SECRET is like a master password that protects all user logins. Use at least 32 random characters. Never use the example value in production.

Example of a strong secret: `xK9#mP2$vL7@nQ4&wR1!jT6*cY8^bU3`

---

## 4. 🐳 Build & Push Docker Images to Amazon ECR

**Amazon ECR (Elastic Container Registry)** is like a private folder on AWS where you store your packaged application images (similar to how Google Drive stores files).

### Step 4.1 — Find your AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

Write down the number it shows — this is your **AWS Account ID** (12 digits, looks like `123456789012`). You'll use it throughout this guide.

### Step 4.2 — Create ECR repositories

Create a storage location for each image:

```bash
aws ecr create-repository --repository-name promesa-frontend --region ap-south-1
```

```bash
aws ecr create-repository --repository-name promesa-backend --region ap-south-1
```

Each command will output a JSON block. Look for `"repositoryUri"` — it will look like:  
`123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-frontend`

> 📝 Write down both URIs — you'll need them in the next steps.

### Step 4.3 — Log Docker into ECR

This command gives Docker permission to push images to your private ECR repositories.  
**Replace `123456789012` with your actual AWS Account ID:**

```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-south-1.amazonaws.com
```

You should see: `Login Succeeded`

### Step 4.4 — Build, tag, and push the Frontend image

**Replace `123456789012` with your actual AWS Account ID in all 3 commands:**

```bash
docker build -t promesa-frontend ./frontend
```

```bash
docker tag promesa-frontend:latest 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-frontend:latest
```

```bash
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-frontend:latest
```

### Step 4.5 — Build, tag, and push the Backend image

**Replace `123456789012` with your actual AWS Account ID in all 3 commands:**

```bash
docker build -t promesa-backend ./backend
```

```bash
docker tag promesa-backend:latest 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-backend:latest
```

```bash
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-backend:latest
```

### ✅ Checkpoint

Go to [AWS Console → ECR](https://ap-south-1.console.aws.amazon.com/ecr/repositories) and verify you can see both `promesa-frontend` and `promesa-backend` repositories, each containing an image tagged `latest`.

---

## 5. ☁️ Create an EKS Cluster

**EKS Cluster** = a group of cloud servers (called nodes) that will run your containers.

### Step 5.1 — Update the Kubernetes manifest files with your Account ID

Before deploying, you need to update the image placeholders in the manifest files.

**Replace `123456789012` with your actual AWS Account ID in the commands below:**

```bash
# On Mac/Linux:
sed -i '' 's/<AWS_ACCOUNT_ID>/123456789012/g' k8s/backend-deployment.yaml
sed -i '' 's/<AWS_ACCOUNT_ID>/123456789012/g' k8s/frontend-deployment.yaml
```

```bash
# On Windows (PowerShell):
(Get-Content k8s\backend-deployment.yaml) -replace '<AWS_ACCOUNT_ID>', '123456789012' | Set-Content k8s\backend-deployment.yaml
(Get-Content k8s\frontend-deployment.yaml) -replace '<AWS_ACCOUNT_ID>', '123456789012' | Set-Content k8s\frontend-deployment.yaml
```

### Step 5.2 — Create the cluster

Run this single command (it creates the entire cluster):

```bash
eksctl create cluster \
  --name promesa-cluster \
  --region ap-south-1 \
  --nodegroup-name promesa-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed
```

> ⏳ **This takes 15–20 minutes.** You will see progress messages. This is normal — go make a cup of tea!

What this command does:
- Creates a cluster named `promesa-cluster` in Mumbai (ap-south-1)
- Creates 2 servers of type `t3.medium` (2 CPU, 4GB RAM each)
- Allows the cluster to auto-scale from 1 to 3 servers based on traffic

### Step 5.3 — Verify the cluster is ready

```bash
kubectl get nodes
```

Expected output (both nodes should say `Ready`):

```
NAME                                             STATUS   ROLES    AGE   VERSION
ip-192-168-xx-xx.ap-south-1.compute.internal    Ready    <none>   2m    v1.28.x
ip-192-168-yy-yy.ap-south-1.compute.internal    Ready    <none>   2m    v1.28.x
```

---

## 6. 🚢 Deploy the Application on EKS

Now you'll deploy your 3 containers onto the cluster using the Kubernetes manifest files in the `k8s/` folder.

> 💡 **What is a manifest file?** Think of it as a recipe — it tells Kubernetes exactly what containers to run, how many copies, and how much memory/CPU to give them.

### Step 6.1 — Set your JWT Secret

Open `k8s/secrets.yaml` in a text editor and replace `CHANGE_ME_TO_A_STRONG_SECRET` with the same strong secret you set in your `.env` file.

### Step 6.2 — Deploy in order

Run these commands one at a time, waiting between each:

**Create the namespace first:**

```bash
kubectl apply -f k8s/namespace.yaml
```

**Deploy the secret:**

```bash
kubectl apply -f k8s/secrets.yaml
```

**Deploy MongoDB:**

```bash
kubectl apply -f k8s/mongo-deployment.yaml
```

**Wait 30 seconds for MongoDB to start:**

```bash
sleep 30
```

**Deploy the Backend:**

```bash
kubectl apply -f k8s/backend-deployment.yaml
```

**Wait 20 seconds for the Backend to start:**

```bash
sleep 20
```

**Deploy the Frontend:**

```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

### Step 6.3 — Verify all pods are running

```bash
kubectl get pods
```

Expected output (all pods should show `Running` and `1/1` or `2/2` in the READY column):

```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxx-xxxxx     1/1     Running   0          2m
backend-xxxxxxxxx-yyyyy     1/1     Running   0          2m
frontend-xxxxxxxxx-xxxxx    1/1     Running   0          1m
frontend-xxxxxxxxx-yyyyy    1/1     Running   0          1m
mongo-xxxxxxxxx-xxxxx       1/1     Running   0          3m
```

> ⚠️ If any pod shows `Pending` or `CrashLoopBackOff`, see the [Troubleshooting](#12--troubleshooting) section.

---

## 7. 🌐 Expose to the Internet (Load Balancer)

The `frontend` service creates an AWS Load Balancer automatically. It takes 2–3 minutes to provision.

### Step 7.1 — Get the Load Balancer address

```bash
kubectl get service frontend
```

Look at the `EXTERNAL-IP` column. It will show a long address like:

```
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP                                                    PORT(S)
frontend   LoadBalancer   10.100.x.x      abc123.elb.ap-south-1.amazonaws.com                           80:30xxx/TCP
```

> ⏳ If EXTERNAL-IP shows `<pending>`, wait 2–3 minutes and run the command again.

### Step 7.2 — Test in your browser

Copy the `EXTERNAL-IP` address and paste it into your browser address bar. You should see the Promesa Midtown website! 🎉

---

## 8. 🌍 Buy a Domain & Configure DNS

Right now your website is accessible via a long, ugly AWS URL. In this section you'll give it a proper domain name like `promesa-midtown.com`.

### Step 8.1 — Buy a Domain Name

**Option A: Buy from AWS Route 53 (Recommended — easiest integration)**

1. Go to [AWS Console → Route 53](https://console.aws.amazon.com/route53/)
2. Click **"Register a domain"**
3. Search for your desired domain name (e.g., `promesa-midtown.com`)
4. Add to cart and complete the purchase (~$12/year for .com)
5. AWS automatically creates a Hosted Zone for you

**Option B: Buy from an external provider (GoDaddy, Namecheap, etc.)**

1. Go to [namecheap.com](https://www.namecheap.com) or [godaddy.com](https://www.godaddy.com)
2. Search and purchase your domain
3. After purchase, go to your domain's DNS settings

### Step 8.2 — Get your Load Balancer DNS name

```bash
kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Copy the output — it's your Load Balancer address (e.g., `abc123.elb.ap-south-1.amazonaws.com`).

### Step 8.3 — Create DNS records

**If using Route 53 (Option A):**

1. Go to [AWS Console → Route 53 → Hosted Zones](https://console.aws.amazon.com/route53/v2/hostedzones)
2. Click on your domain
3. Click **"Create record"**
4. Leave the name field empty (for the root domain) → toggle **"Alias"** ON → choose **"Alias to Application and Classic Load Balancer"** → select **"Asia Pacific (Mumbai)"** → paste your Load Balancer DNS name
5. Click **"Create records"**
6. Repeat for `www`: enter `www` in the name field, same alias target

**If using an external provider (Option B):**

Go to your domain's DNS settings and add a **CNAME record**:
- **Host/Name:** `www`
- **Value/Target:** your Load Balancer DNS name (e.g., `abc123.elb.ap-south-1.amazonaws.com`)
- **TTL:** 300

For the root domain (`promesa-midtown.com` without www), most providers support a **CNAME Flattening** or **ALIAS** record — check your provider's documentation.

> ⏳ **DNS propagation** takes anywhere from **5 minutes to 48 hours** depending on your provider and location. Be patient!

---

## 9. 🔒 Set Up HTTPS (SSL Certificate)

HTTPS encrypts the connection between your users' browsers and your website. Without it, browsers show a "Not Secure" warning.

### Step 9.1 — Request an SSL certificate from AWS ACM

1. Go to [AWS Console → Certificate Manager (ACM)](https://ap-south-1.console.aws.amazon.com/acm/home?region=ap-south-1)
2. Click **"Request a certificate"**
3. Choose **"Request a public certificate"** → click Next
4. In "Fully qualified domain name", enter your domain: `promesa-midtown.com`
5. Click **"Add another name to this certificate"** and enter `*.promesa-midtown.com` (the `*` covers all subdomains including `www`)
6. Choose **"DNS validation"** → click **"Request"**

### Step 9.2 — Validate the certificate

1. Click on the certificate you just created
2. Click **"Create records in Route 53"** (if using Route 53 — it does everything automatically!)  
   **OR** manually add the CNAME records shown to your DNS provider
3. Wait 5–10 minutes for the status to change from `Pending validation` to `Issued`

### Step 9.3 — Note your Certificate ARN

On the certificate details page, copy the **ARN** — it looks like:  
`arn:aws:acm:ap-south-1:123456789012:certificate/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Step 9.4 — Install the AWS Load Balancer Controller

This controller enables Kubernetes to create and manage Application Load Balancers (ALB) on AWS.

**Create an IAM policy (gives Kubernetes permission to create load balancers):**

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.1/docs/install/iam_policy.json
```

```bash
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```

**Create the IAM service account (replace `123456789012` with your Account ID):**

```bash
eksctl create iamserviceaccount \
  --cluster=promesa-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::123456789012:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve
```

**Install Helm (a package manager for Kubernetes):**

- Mac: `brew install helm`
- Windows: Download from [https://helm.sh/docs/intro/install/](https://helm.sh/docs/intro/install/)
- Linux: `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash`

**Add the EKS chart repository:**

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

**Install the controller (replace `123456789012` with your Account ID):**

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=promesa-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=ap-south-1 \
  --set vpcId=$(aws eks describe-cluster --name promesa-cluster --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

### Step 9.5 — Update and apply the Ingress

Open `k8s/ingress.yaml` and replace the placeholders:
- Replace `<AWS_ACCOUNT_ID>` with your Account ID (e.g., `123456789012`)
- Replace `<YOUR-CERT-ID>` with the certificate ID from Step 9.3 (the part after `certificate/`)
- Replace `promesa-midtown.com` and `www.promesa-midtown.com` with your actual domain

Then apply it:

```bash
kubectl apply -f k8s/ingress.yaml
```

### Step 9.6 — Switch the Frontend service to ClusterIP

Now that ALB handles incoming traffic, the Frontend no longer needs its own LoadBalancer:

```bash
kubectl patch service frontend -p '{"spec": {"type": "ClusterIP"}}'
```

### Step 9.7 — Verify HTTPS is working

Wait 3–5 minutes, then visit `https://your-domain.com` in your browser. You should see a padlock 🔒 in the address bar!

---

## 10. 👑 Create the First Admin User

By default, all users who register are "Residents". You need to manually promote the first Admin.

### Step 10.1 — Register on the website

1. Go to your website and click **Register**
2. Fill in all details and create your account
3. Note the **username** you used

### Step 10.2 — Find the MongoDB pod name

```bash
kubectl get pods -l app=mongo
```

The output will look like:

```
NAME                     READY   STATUS    RESTARTS   AGE
mongo-5b9f8d4b7c-xkzpq   1/1     Running   0          30m
```

Copy the full pod name (the part that starts with `mongo-`).

### Step 10.3 — Connect to MongoDB inside the pod

**Replace `mongo-5b9f8d4b7c-xkzpq` with the actual pod name from the previous step:**

```bash
kubectl exec -it mongo-5b9f8d4b7c-xkzpq -- mongosh promesa_midtown
```

You will see the MongoDB shell prompt: `promesa_midtown>`

### Step 10.4 — Promote your user to Admin

**Replace `yourusername` with your actual username:**

```javascript
db.users.updateOne({ username: "yourusername" }, { $set: { role: "Admin" } })
```

Expected output:

```json
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

- `matchedCount: 1` means it found your user ✅
- `modifiedCount: 1` means it updated the role ✅

### Step 10.5 — Exit and verify

```javascript
exit
```

Log out of the website and log back in. You should now see the Admin panel!

---

## 11. 🗄️ Access & Manage Database Data

### Step 11.1 — Connect to MongoDB

First, find the pod name:

```bash
kubectl get pods -l app=mongo
```

Then connect (replace pod name):

```bash
kubectl exec -it mongo-5b9f8d4b7c-xkzpq -- mongosh promesa_midtown
```

### Step 11.2 — View all data

**View all registered users:**

```javascript
db.users.find().pretty()
```

**View all vehicles:**

```javascript
db.vehicles.find().pretty()
```

**View all maintenance records:**

```javascript
db.maintenances.find().pretty()
```

**View all complaints:**

```javascript
db.complaints.find().pretty()
```

**View all compound requests:**

```javascript
db.compoundrequests.find().pretty()
```

### Step 11.3 — Search examples

**Find a user by flat number:**

```javascript
db.users.find({ flatNumber: "A-101" }).pretty()
```

**Find complaints with status "Pending":**

```javascript
db.complaints.find({ status: "Pending" }).pretty()
```

**Find maintenance records for a specific month:**

```javascript
db.maintenances.find({ month: "January 2025" }).pretty()
```

### Step 11.4 — Count documents

```javascript
db.users.countDocuments()
db.complaints.countDocuments({ status: "Pending" })
```

### Step 11.5 — Use MongoDB Compass (GUI Option)

If you prefer a visual interface instead of typing commands:

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass) (free)
2. Open a port-forward tunnel from your computer to the MongoDB pod:

```bash
kubectl port-forward service/mongo 27017:27017
```

3. Leave that terminal open and open MongoDB Compass
4. Use this connection string:

```
mongodb://localhost:27017/promesa_midtown
```

5. Click **Connect** — you can now browse and edit data with a graphical interface

---

## 12. 🔧 Troubleshooting

### Common Issues

| Problem | Diagnosis Command | Fix |
|---------|-------------------|-----|
| Pod not starting | `kubectl describe pod <pod-name>` | Check events at the bottom for error messages |
| Website not loading | `kubectl get service frontend` | Wait for EXTERNAL-IP; check PENDING status |
| Backend can't connect to DB | `kubectl logs <backend-pod-name>` | Ensure MongoDB pod is Running first |
| Image pull error | `kubectl describe pod <pod-name>` | Verify ECR image URI and that you're logged in |
| DNS not working | `nslookup your-domain.com` | Wait up to 48 hours; verify DNS records are correct |
| Pod keeps restarting | `kubectl logs <pod-name> --previous` | View logs from the crashed instance |

### Step-by-step diagnosis

**Check what's wrong with a specific pod:**

```bash
kubectl describe pod <paste-pod-name-here>
```

**View live logs from a pod:**

```bash
kubectl logs <paste-pod-name-here> --follow
```

**Check all services and their IPs:**

```bash
kubectl get services
```

**Check resource usage (CPU/memory):**

```bash
kubectl top pods
```

**Restart a deployment (if something is stuck):**

```bash
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

**Get a full status overview:**

```bash
kubectl get pods,services,ingress
```

---

## 13. 🔄 How to Update the Application

When you make changes to the code and want to deploy the new version:

### Step 13.1 — Rebuild and push the updated image

**Replace `123456789012` with your AWS Account ID:**

**For backend changes:**

```bash
docker build -t promesa-backend ./backend
docker tag promesa-backend:latest 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-backend:latest
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-backend:latest
```

**For frontend changes:**

```bash
docker build -t promesa-frontend ./frontend
docker tag promesa-frontend:latest 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-frontend:latest
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/promesa-frontend:latest
```

### Step 13.2 — Tell Kubernetes to use the new image

```bash
kubectl rollout restart deployment/backend
```

```bash
kubectl rollout restart deployment/frontend
```

### Step 13.3 — Watch the update happen (optional)

```bash
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
```

Kubernetes performs a **rolling update** — it starts new pods with the new version before stopping the old ones, so your website stays online the entire time with **zero downtime**.

---

## 14. 💰 Estimated Monthly AWS Cost

> **Note:** Prices are approximate for the `ap-south-1` (Mumbai) region. AWS pricing changes over time — always check the [AWS Pricing Calculator](https://calculator.aws/pricing/2/home) for the most current estimates.

| Service | What it is | Monthly Cost |
|---------|-----------|-------------|
| **EKS Control Plane** | The Kubernetes management service | ~$73 |
| **2× EC2 t3.medium** | The 2 worker servers running your containers | ~$60 |
| **Network Load Balancer** | Routes internet traffic to your app | ~$18 |
| **ECR** | Stores your Docker images | ~$1 |
| **EBS Storage** | The 10GB disk for MongoDB | ~$1 |
| **Route 53** | DNS hosting for your domain | ~$0.50 |
| **Total** | | **~$153/month** |

### 💡 Cost-Saving Tip for Testing

If you're just testing and don't need the application running 24/7, you can reduce costs by scaling down to 1 node:

```bash
eksctl scale nodegroup --cluster=promesa-cluster --name=promesa-nodes --nodes=1 --nodes-min=1 --region=ap-south-1
```

Or delete the entire cluster when done testing (⚠️ this deletes all data!):

```bash
eksctl delete cluster --name promesa-cluster --region ap-south-1
```

---

## 15. 📁 Final Folder Structure

After following this guide, your project folder will look like this:

```
Project-Promesa/
├── 📄 .env                        ← Your secret config (JWT_SECRET) — never share this!
├── 📄 .env.example                ← Template for .env
├── 📄 .gitignore
├── 📄 docker-compose.yml          ← For running locally (development)
├── 📄 README.md                   ← Project overview
├── 📄 DEPLOYMENT_GUIDE.md         ← This guide!
│
├── 📁 k8s/                        ← Kubernetes manifests for AWS EKS
│   ├── 📄 secrets.yaml            ← JWT secret (stored securely in Kubernetes)
│   ├── 📄 mongo-deployment.yaml   ← MongoDB database
│   ├── 📄 backend-deployment.yaml ← Node.js API server
│   ├── 📄 frontend-deployment.yaml← React website served by Nginx
│   └── 📄 ingress.yaml            ← HTTPS + domain routing rules
│
├── 📁 backend/                    ← Node.js + Express API source code
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   └── 📁 src/
│       ├── 📄 server.js
│       ├── 📁 models/
│       ├── 📁 routes/
│       └── 📁 middleware/
│
└── 📁 frontend/                   ← React application source code
    ├── 📄 Dockerfile
    ├── 📄 package.json
    └── 📁 src/
        ├── 📄 App.jsx
        ├── 📁 pages/
        └── 📁 components/
```

---

## 🎉 Congratulations!

You've successfully deployed the Promesa Midtown Society Management Portal on AWS EKS with:
- ✅ Public internet access
- ✅ Custom domain name
- ✅ HTTPS encryption (padlock in the browser)
- ✅ Persistent database with MongoDB
- ✅ Auto-scaling capability
- ✅ Production-grade reliability

If you run into any issues, refer to the [Troubleshooting](#12--troubleshooting) section or check the [AWS EKS documentation](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html).

---

*© 2024 Promesa Midtown — Pestom Sagar Road No 4, Chembur West 400089, Mumbai, Maharashtra*
