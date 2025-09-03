# User Guide: Deploying Holographic E-commerce to Hetzner Kubernetes

This guide will walk you through setting up a Kubernetes cluster on Hetzner and deploying your Holographic E-commerce application.

## 1. Setting up Kubernetes on Hetzner

Hetzner offers a managed Kubernetes service (Hetzner Kubernetes Engine - HKE) which is the recommended and easiest way to get started. Alternatively, you can set up a self-managed cluster.

### Option 1: Hetzner Managed Kubernetes (Recommended)

This option handles the Kubernetes control plane for you, simplifying management.

1.  **Log in to Hetzner Cloud Console:** Go to [https://console.hetzner.cloud/](https://console.hetzner.cloud/) and log in.
2.  **Create a new Kubernetes Cluster:**
    *   Navigate to the "Kubernetes" section in the left sidebar.
    *   Click "Add Cluster".
    *   Choose a **Location** (e.g., Falkenstein, Nuremberg, Helsinki).
    *   Give your cluster a **Name** (e.g., `holographic-ecommerce-k8s`).
    *   Select a **Kubernetes Version** (e.g., `1.27`).
    *   (Optional) Configure network, labels, etc.
    *   Click "Create Kubernetes Cluster".
3.  **Add Node Pools:** After the cluster is created, you'll need to add node pools (worker nodes where your applications will run).
    *   Select your newly created cluster.
    *   Go to the "Node Pools" tab.
    *   Click "Add Node Pool".
    *   Choose a **Server Type** (e.g., `CPX21` for a small cluster, `CPX31` or `CPX41` for production).
    *   Set the **Node Count** (start with 1 or 2 for testing).
    *   Click "Add Node Pool". Wait for the nodes to provision and join the cluster.
4.  **Download Kubeconfig:** Once your cluster and node pools are ready:
    *   Go to the "Overview" tab of your Kubernetes cluster.
    *   Click "Download Kubeconfig". Save this file (e.g., `kubeconfig.yaml`) to your local machine. This file contains the credentials to connect to your cluster using `kubectl`.
5.  **Install `kubectl`:** If you don't have `kubectl` installed, follow the official Kubernetes documentation: [https://kubernetes.io/docs/tasks/tools/install-kubectl/](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
6.  **Configure `kubectl`:** Set the `KUBECONFIG` environment variable to point to your downloaded file:
    ```bash
    export KUBECONFIG=/path/to/your/kubeconfig.yaml
    ```
    (Replace `/path/to/your/kubeconfig.yaml` with the actual path).
7.  **Verify Connection:** Test your connection to the cluster:
    ```bash
    kubectl get nodes
    ```
    You should see your Hetzner nodes listed with a `Ready` status.

### Option 2: Self-Managed K3s Cluster (Advanced)

This option gives you more control but requires manual setup of the control plane and worker nodes. K3s is a lightweight Kubernetes distribution often used for edge or smaller clusters.

1.  **Provision Hetzner Cloud Servers:** Create multiple Cloud Servers (e.g., 1 for master, 1+ for workers) via the Hetzner Cloud Console.
2.  **SSH into your servers.**
3.  **Install K3s:** Follow the official K3s installation guide on each server:
    *   **Master Node:** [https://docs.k3s.io/installation/quickstart#install-k3s-on-the-server](https://docs.k3s.io/installation/quickstart#install-k3s-on-the-server)
    *   **Worker Nodes:** [https://docs.k3s.io/installation/quickstart#install-k3s-on-the-agents](https://docs.k3s.io/installation/quickstart#install-k3s-on-the-agents)
4.  **Retrieve Kubeconfig:** On your master node, copy the `kubeconfig` file to your local machine (usually located at `/etc/rancher/k3s/k3s.yaml`).
5.  **Install and Configure `kubectl`:** Same as steps 5 and 6 in Option 1.
6.  **Verify Connection:** Same as step 7 in Option 1.

## 2. CDN Configuration

A Content Delivery Network (CDN) serves your static assets (like your frontend application files, images, and videos) from servers geographically closer to your users. This significantly improves loading times and reduces the load on your origin server.

### General CDN Integration Steps

1.  **Choose a CDN Provider:** Popular choices include:
    *   **Cloudflare:** Offers a free tier and comprehensive features.
    *   **Fastly:** Known for performance and flexibility.
    *   **Akamai:** Enterprise-grade solutions.
    *   **Amazon CloudFront (AWS):** If you decide to use AWS for other services.
    *   **Google Cloud CDN (GCP):** If you decide to use GCP for other services.

2.  **Create a CDN Distribution/Service:** Sign up with your chosen provider and create a new CDN distribution. You will typically configure your origin server (where your frontend application is hosted, e.g., your Hetzner server's IP or domain).

3.  **Point Your Domain:** Update your DNS records (e.g., CNAME record) to point your frontend domain (or a subdomain like `cdn.your-domain.com`) to the CDN's provided hostname.

4.  **Configure Caching Rules:** Set up caching policies for different types of assets (e.g., cache HTML for a short time, images/CSS/JS for a longer time).

5.  **Enable SSL/TLS:** Ensure your CDN distribution is configured to use HTTPS for secure communication.

### Configuring Your Frontend for CDN

To ensure your frontend application loads assets correctly from the CDN, you need to configure its build process to use the CDN URL as its base path. For a Vite project, this is done by setting the `base` option in `vite.config.ts`.

1.  **Open `holographic-ecommerce/vite.config.ts`**.
2.  **Modify the `base` option** to your CDN URL. For example, if your CDN serves from `https://cdn.your-domain.com/`:

    ```typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      base: 'https://cdn.your-domain.com/', // <--- Add this line with your CDN URL
    })
    ```

    If your application is served from the root of your domain (e.g., `https://your-domain.com/`), and your CDN is configured to serve from that same root, you might not need to change `base` if it's already `/`.

## 2. CDN Configuration

A Content Delivery Network (CDN) serves your static assets (like your frontend application files, images, and videos) from servers geographically closer to your users. This significantly improves loading times and reduces the load on your origin server.

### General CDN Integration Steps

1.  **Choose a CDN Provider:** Popular choices include:
    *   **Cloudflare:** Offers a free tier and comprehensive features.
    *   **Fastly:** Known for performance and flexibility.
    *   **Akamai:** Enterprise-grade solutions.
    *   **Amazon CloudFront (AWS):** If you decide to use AWS for other services.
    *   **Google Cloud CDN (GCP):** If you decide to use GCP for other services.

2.  **Create a CDN Distribution/Service:** Sign up with your chosen provider and create a new CDN distribution. You will typically configure your origin server (where your frontend application is hosted, e.g., your Hetzner server's IP or domain).

3.  **Point Your Domain:** Update your DNS records (e.g., CNAME record) to point your frontend domain (or a subdomain like `cdn.your-domain.com`) to the CDN's provided hostname.

4.  **Configure Caching Rules:** Set up caching policies for different types of assets (e.g., cache HTML for a short time, images/CSS/JS for a longer time).

5.  **Enable SSL/TLS:** Ensure your CDN distribution is configured to use HTTPS for secure communication.

### Configuring Your Frontend for CDN

To ensure your frontend application loads assets correctly from the CDN, you need to configure its build process to use the CDN URL as its base path. For a Vite project, this is done by setting the `base` option in `vite.config.ts`.

1.  **Open `holographic-ecommerce/vite.config.ts`**.
2.  **Modify the `base` option** to your CDN URL. For example, if your CDN serves from `https://cdn.your-domain.com/`:

    ```typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      base: 'https://cdn.your-domain.com/', // <--- Add this line with your CDN URL
    })
    ```

    If your application is served from the root of your domain (e.g., `https://your-domain.com/`), and your CDN is configured to serve from that same root, you might not need to change `base` if it's already `/`.

## 3. Deploying Your Application to Kubernetes

Once your Kubernetes cluster is set up and `kubectl` is configured, you can deploy your application using the provided Kubernetes manifest files.

### Kubernetes Manifests Overview

Your project now includes the following Kubernetes manifest files (YAML files) that define how your application components will run in the cluster:

*   `backend-deployment.yaml`: Defines the deployment and service for your Node.js backend.
*   `frontend-deployment.yaml`: Defines the deployment and service for your Nginx-served React frontend.
*   `postgres-deployment.yaml`: Defines the deployment and service for your PostgreSQL database.
*   `redis-deployment.yaml`: Defines the deployment and service for your Redis cache.
*   `elasticsearch-deployment.yaml`: Defines the deployment and service for your Elasticsearch instance.
*   `ingress.yaml`: Defines the Ingress resource to expose your frontend and backend services to the internet (requires an Ingress Controller like Nginx Ingress Controller to be installed in your cluster).
*   `secrets.yaml`: A template for Kubernetes Secrets to securely store sensitive information like database passwords, API keys, etc. **DO NOT COMMIT THIS FILE WITH ACTUAL SECRETS TO GIT!**

### Applying Manifests

1.  **Create Kubernetes Secrets:** Before deploying, you need to create Kubernetes Secrets for your sensitive environment variables (DB credentials, API keys). Edit the `secrets.yaml` file (or create a new one) with your actual values. **Ensure you do not commit actual secrets to your Git repository.**
    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: app-secrets
    type: Opaque
    stringData:
      DB_USER: "your_db_user"
      DB_PASSWORD: "your_db_password"
      DB_NAME: "holographic_ecommerce_db"
      REDIS_URL: "redis://redis-service:6379" # Internal Kubernetes service name
      ELASTICSEARCH_URL: "http://elasticsearch-service:9200" # Internal Kubernetes service name
      STRIPE_SECRET_KEY: "sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/exampleProjectId"
      DATADOG_API_KEY: "your_datadog_api_key"
      DATADOG_APP_KEY: "your_datadog_app_key"
      # Add any other secrets here
    ```
    Apply the secrets:
    ```bash
    kubectl apply -f secrets.yaml
    ```
2.  **Deploy Services:** Apply the manifest files to your cluster. It's recommended to deploy databases first, then backend, then frontend.
    ```bash
    kubectl apply -f postgres-deployment.yaml
    kubectl apply -f redis-deployment.yaml
    kubectl apply -f elasticsearch-deployment.yaml
    kubectl apply -f backend-deployment.yaml
    kubectl apply -f frontend-deployment.yaml
    kubectl apply -f ingress.yaml # Deploy Ingress last
    ```
3.  **Verify Deployment:** Check the status of your pods and services:
    ```bash
    kubectl get pods
    kubectl get services
    kubectl get ingress
    ```

### Accessing Your Application

Once the Ingress is deployed and your DNS is configured (if using a custom domain), you can access your application via the Ingress's external IP address or hostname.

## 6. Load Balancing

Load balancing is crucial for distributing incoming network traffic across multiple servers or pods, ensuring high availability and optimal resource utilization. In Kubernetes, load balancing is primarily handled by Services and Ingress Controllers.

### 6.1 Kubernetes Services

Kubernetes `Service` objects abstract away the underlying pods and provide a stable IP address and DNS name for a set of pods. They can perform basic load balancing across the pods they select.

### 6.2 Ingress Controllers and Ingress Resources

For HTTP/HTTPS traffic, `Ingress` resources, managed by an `Ingress Controller` (like Nginx Ingress Controller), provide advanced routing and load balancing capabilities. The `ingress.yaml` manifest you have already defines how external traffic should be routed to your frontend and backend services.

### 6.3 Exposing the Ingress Controller (External Load Balancer)

To make your application accessible from the internet, your Ingress Controller needs an external IP address. This is typically achieved by creating a Kubernetes `Service` of type `LoadBalancer` for your Ingress Controller.

1.  **Managed Kubernetes (Hetzner HKE):** If you are using Hetzner Managed Kubernetes, creating an Ingress resource (as defined in `kubernetes/ingress.yaml`) will often automatically provision an external Load Balancer for your Ingress Controller. You can check the external IP/hostname of your Ingress by running:
    ```bash
    kubectl get ingress
    ```
    The `ADDRESS` column will show the external IP/hostname provided by Hetzner.

2.  **Self-Managed Kubernetes:** If you set up a self-managed cluster, you might need to manually deploy a Load Balancer service for your Ingress Controller. For example, if you are using Nginx Ingress Controller, you would typically expose it via a `LoadBalancer` type Service:

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: ingress-nginx-controller
      namespace: ingress-nginx # Or wherever your Ingress Controller is deployed
    spec:
      type: LoadBalancer
      selector:
        app.kubernetes.io/component: controller
        app.kubernetes.io/instance: ingress-nginx
      ports:
        - name: http
          port: 80
          targetPort: 80
        - name: https
          port: 443
          targetPort: 443
    ```
    Applying this manifest would request an external Load Balancer from your cloud provider (Hetzner in this case) and assign an external IP to your Ingress Controller.

### 6.4 Traffic Distribution

Once your Ingress Controller has an external IP, it will distribute traffic to your backend and frontend services based on the rules defined in your `kubernetes/ingress.yaml` file. The `Ingress` resource handles routing based on hostnames (e.g., `your-frontend-domain.com`, `api.your-frontend-domain.com`) and paths.

## 7. Next Steps for Deployment

After setting up load balancing, you can proceed with the remaining deployment tasks:

*   **Failover systems**
*   **Security Hardening**
*   **Production Launch**



## 6. Load Balancing

Load balancing is crucial for distributing incoming network traffic across multiple servers or pods, ensuring high availability and optimal resource utilization. In Kubernetes, load balancing is primarily handled by Services and Ingress Controllers.

### 6.1 Kubernetes Services

Kubernetes `Service` objects abstract away the underlying pods and provide a stable IP address and DNS name for a set of pods. They can perform basic load balancing across the pods they select.

### 6.2 Ingress Controllers and Ingress Resources

For HTTP/HTTPS traffic, `Ingress` resources, managed by an `Ingress Controller` (like Nginx Ingress Controller), provide advanced routing and load balancing capabilities. The `ingress.yaml` manifest you have already defines how external traffic should be routed to your frontend and backend services.

### 6.3 Exposing the Ingress Controller (External Load Balancer)

To make your application accessible from the internet, your Ingress Controller needs an external IP address. This is typically achieved by creating a Kubernetes `Service` of type `LoadBalancer` for your Ingress Controller.

1.  **Managed Kubernetes (Hetzner HKE):** If you are using Hetzner Managed Kubernetes, creating an Ingress resource (as defined in `kubernetes/ingress.yaml`) will often automatically provision an external Load Balancer for your Ingress Controller. You can check the external IP/hostname of your Ingress by running:
    ```bash
    kubectl get ingress
    ```
    The `ADDRESS` column will show the external IP/hostname provided by Hetzner.

2.  **Self-Managed Kubernetes:** If you set up a self-managed cluster, you might need to manually deploy a Load Balancer service for your Ingress Controller. For example, if you are using Nginx Ingress Controller, you would typically expose it via a `LoadBalancer` type Service:

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: ingress-nginx-controller
      namespace: ingress-nginx # Or wherever your Ingress Controller is deployed
    spec:
      type: LoadBalancer
      selector:
        app.kubernetes.io/component: controller
        app.kubernetes.io/instance: ingress-nginx
      ports:
        - name: http
          port: 80
          targetPort: 80
        - name: https
          port: 443
          targetPort: 443
    ```
    Applying this manifest would request an external Load Balancer from your cloud provider (Hetzner in this case) and assign an external IP to your Ingress Controller.

### 6.4 Traffic Distribution

Once your Ingress Controller has an external IP, it will distribute traffic to your backend and frontend services based on the rules defined in your `kubernetes/ingress.yaml` file. The `Ingress` resource handles routing based on hostnames (e.g., `your-frontend-domain.com`, `api.your-frontend-domain.com`) and paths.

## 7. Next Steps for Deployment

After setting up load balancing, you can proceed with the remaining deployment tasks:

*   **Failover systems**
*   **Security Hardening**
*   **Production Launch**

