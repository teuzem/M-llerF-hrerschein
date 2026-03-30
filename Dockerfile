# --- Étape de construction (Builder Stage) ---
FROM node:20-alpine AS builder

# Définir le répertoire de travail à l'intérieur du conteneur
WORKDIR /app

# Copier les fichiers de définition des dépendances en premier pour optimiser le cache Docker
# Cela permet de ne réinstaller les dépendances que si package.json ou package-lock.json changent
COPY package*.json yarn.lock .npmrc ./ # Copie vers le WORKDIR /app

# Installer toutes les dépendances, y compris les devDependencies nécessaires au build
RUN npm install

# Copier le reste du code source de l'application
# Cela doit être fait après npm install pour que le build puisse accéder aux fichiers
COPY . .

# Déclarer les arguments de build pour Coolify (ou tout autre système CI/CD)
# Ces ARG seront transformés en ENV pour le build Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_STRIPE_SECRET_KEY
ARG VITE_PAYPAL_CLIENT_ID
ARG VITE_PAYPAL_CLIENT_SECRET
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID_ADMIN
ARG VITE_EMAILJS_TEMPLATE_ID_CLIENT
ARG VITE_EMAILJS_PUBLIC_KEY
ARG VITE_GIPHY_API_KEY
ARG VITE_ADMIN_USER_ID
ARG VITE_APP_NAME=PermisCode
ARG VITE_APP_URL=https://permiscode.fr
ARG PORT=80
ARG NODE_ENV=production

# Exporter les arguments de build en tant que variables d'environnement pour le build Vite
# Cela garantit que Vite peut accéder à ces variables pendant le processus de build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY \
    VITE_STRIPE_SECRET_KEY=$VITE_STRIPE_SECRET_KEY \
    VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID \
    VITE_PAYPAL_CLIENT_SECRET=$VITE_PAYPAL_CLIENT_SECRET \
    VITE_EMAILJS_SERVICE_ID=$VITE_EMAILJS_SERVICE_ID \
    VITE_EMAILJS_TEMPLATE_ID_ADMIN=$VITE_EMAILJS_TEMPLATE_ID_ADMIN \
    VITE_EMAILJS_TEMPLATE_ID_CLIENT=$VITE_EMAILJS_TEMPLATE_ID_CLIENT \
    VITE_EMAILJS_PUBLIC_KEY=$VITE_EMAILJS_PUBLIC_KEY \
    VITE_GIPHY_API_KEY=$VITE_GIPHY_API_KEY \
    VITE_ADMIN_USER_ID=$VITE_ADMIN_USER_ID \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_URL=$VITE_APP_URL \
    PORT=$PORT \
    NODE_ENV=$NODE_ENV

# (Optionnel ) Débogage : Afficher les variables d'environnement pendant le build
# Utile pour vérifier que les variables sont correctement passées
RUN echo "=== BUILD ENVIRONMENT VARIABLES ===" && \
    echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL:0:30}..." && \
    echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:0:30}..." && \
    echo "VITE_APP_URL=$VITE_APP_URL" && \
    echo "NODE_ENV=$NODE_ENV" && \
    echo "==================================="

# Construire l'application
# Cette commande générera les fichiers statiques dans le répertoire 'dist'
RUN npm run build

# Vérifier la sortie du build
# S'assurer que le répertoire 'dist' et le fichier 'index.html' existent
RUN ls -la dist/ && \
    echo "Build completed successfully!" && \
    test -f dist/index.html && echo "✓ index.html found" || (echo "✗ index.html NOT found" && exit 1)

# --- Étape de production (Production Stage) ---
FROM nginx:alpine

# Installer wget pour le healthcheck
RUN apk add --no-cache wget

# Copier la configuration Nginx personnalisée
# Assurez-vous que nginx.conf est présent à la racine de votre projet
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les assets construits depuis l'étape 'builder' vers le répertoire de service de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Définir les permissions appropriées pour les fichiers servis par Nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Créer un endpoint de health check simple
RUN echo "OK" > /usr/share/nginx/html/health

# Exposer le port 80 pour le trafic web
EXPOSE 80

# Configuration du health check Docker
# Vérifie si Nginx sert correctement le fichier /health
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Commande par défaut pour démarrer Nginx en mode non-daemon
CMD ["nginx", "-g", "daemon off;"]
