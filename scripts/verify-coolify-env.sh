#!/bin/bash

# Script de vérification des variables d'environnement pour Coolify
# Ce script aide à vérifier que toutes les variables nécessaires sont présentes

echo "================================================"
echo "🔍 Vérification des Variables d'Environnement"
echo "================================================"
echo ""

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
PRESENT=0
MISSING=0

# Fonction pour vérifier une variable
check_var() {
    local var_name=$1
    local is_required=$2
    TOTAL=$((TOTAL + 1))

    if [ -z "${!var_name}" ]; then
        if [ "$is_required" = "required" ]; then
            echo -e "${RED}❌ $var_name${NC} - MANQUANTE (OBLIGATOIRE)"
            MISSING=$((MISSING + 1))
        else
            echo -e "${YELLOW}⚠️  $var_name${NC} - Manquante (optionnelle)"
        fi
    else
        # Afficher seulement les premiers caractères pour la sécurité
        local value="${!var_name}"
        local display_value="${value:0:30}"
        if [ ${#value} -gt 30 ]; then
            display_value="${display_value}..."
        fi
        echo -e "${GREEN}✅ $var_name${NC} = $display_value"
        PRESENT=$((PRESENT + 1))
    fi
}

echo "📋 Variables Supabase (OBLIGATOIRES)"
echo "------------------------------------"
check_var "VITE_SUPABASE_URL" "required"
check_var "VITE_SUPABASE_ANON_KEY" "required"
echo ""

echo "📋 Variables Application (OBLIGATOIRES)"
echo "------------------------------------"
check_var "VITE_APP_NAME" "required"
check_var "VITE_APP_URL" "required"
echo ""

echo "💳 Variables Stripe (OBLIGATOIRES)"
echo "------------------------------------"
check_var "VITE_STRIPE_PUBLISHABLE_KEY" "required"
check_var "VITE_STRIPE_SECRET_KEY" "required"
echo ""

echo "💳 Variables PayPal (OBLIGATOIRES)"
echo "------------------------------------"
check_var "VITE_PAYPAL_CLIENT_ID" "required"
check_var "VITE_PAYPAL_CLIENT_SECRET" "required"
echo ""

echo "👤 Variables Admin (OBLIGATOIRES)"
echo "------------------------------------"
check_var "VITE_ADMIN_USER_ID" "required"
echo ""

echo "📧 Variables EmailJS (OPTIONNELLES)"
echo "------------------------------------"
check_var "VITE_EMAILJS_SERVICE_ID" "optional"
check_var "VITE_EMAILJS_TEMPLATE_ID_ADMIN" "optional"
check_var "VITE_EMAILJS_TEMPLATE_ID_CLIENT" "optional"
check_var "VITE_EMAILJS_PUBLIC_KEY" "optional"
echo ""

echo "🎬 Variables Giphy (OPTIONNELLES)"
echo "------------------------------------"
check_var "VITE_GIPHY_API_KEY" "optional"
echo ""

echo "================================================"
echo "📊 Résumé"
echo "================================================"
echo "Total de variables vérifiées: $TOTAL"
echo -e "${GREEN}Variables présentes: $PRESENT${NC}"
if [ $MISSING -gt 0 ]; then
    echo -e "${RED}Variables manquantes (obligatoires): $MISSING${NC}"
fi
echo ""

# Vérifications supplémentaires
echo "================================================"
echo "🔍 Vérifications Supplémentaires"
echo "================================================"

# Vérifier NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}✅ NODE_ENV${NC} = production"
else
    echo -e "${YELLOW}⚠️  NODE_ENV${NC} = ${NODE_ENV:-'non défini'} (devrait être 'production' en prod)"
fi

# Vérifier PORT
if [ -n "$PORT" ]; then
    echo -e "${GREEN}✅ PORT${NC} = $PORT"
else
    echo -e "${YELLOW}⚠️  PORT${NC} non défini (devrait être 80 pour nginx)"
fi

echo ""

# Conclusion
echo "================================================"
echo "🎯 Conclusion"
echo "================================================"

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ TOUTES les variables obligatoires sont présentes!${NC}"
    echo "Vous pouvez procéder au build Docker."
    exit 0
else
    echo -e "${RED}❌ Il manque $MISSING variable(s) obligatoire(s)!${NC}"
    echo "Veuillez ajouter les variables manquantes dans Coolify avant de déployer."
    echo ""
    echo "📝 Instructions:"
    echo "1. Allez dans Coolify → Votre Projet → Settings → Environment Variables"
    echo "2. Ajoutez les variables manquantes (marquées ❌ ci-dessus)"
    echo "3. Cochez 'Available at Buildtime' ET 'Available at Runtime'"
    echo "4. Cliquez sur 'Update' pour chaque variable"
    echo "5. Redéployez votre application"
    exit 1
fi
