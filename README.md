# Estimation Immobilière à Bordeaux

![Bordeaux](assets/Bordeaux.png)  



---

## Description du projet

Ce projet consiste à développer un **site web permettant d’estimer la valeur d’un bien immobilier à Bordeaux**.  
L’application prend en compte plusieurs critères :  

- Informations sur les quartiers et la ville  
- Surface du bien (m²)  
- Prix au m²  
- Classe énergétique (DPE)  
- Historique des estimations  

L’objectif est de fournir une estimation fiable et rapide pour les acheteurs ou vendeurs immobiliers.  

---

## Organisation du projet

Le projet est structuré de la manière suivante :

```text
/estimation-immobiliere-bordeaux
│
├── backend/           # Code serveur et API
├── database/          # Scripts SQL pour création des tables
├── frontend/          # Code frontend
├── docs/              # Documents, rapports, MCD/MLD, autres fichiers du projet
├── assets/            # Images et photos utilisées dans le projet
├── README.md          # Ce fichier
└── .gitignore
```

---

## Fonctionnalités principales

- **Consultation** des prix moyens par quartier  
- **Estimation automatique** du prix d’un bien selon ses caractéristiques  
- **Gestion des utilisateurs** (inscription, connexion)  
- **Historique des estimations** pour chaque utilisateur  

---

## Technologies utilisées

- **Base de données** : MySQL / PostgreSQL  
- **Backend** : Node.js / Python Flask  
- **Frontend** : HTML, CSS, JavaScript 
- **Versioning** : Git & GitHub  

---

## Installation et utilisation

1. Cloner le dépôt :  
```bash
git clone https://github.com/ton-utilisateur/estimation-immobiliere-bordeaux.git