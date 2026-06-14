# alert-freebox

Script Node.js qui surveille une URL toutes les 5 minutes et envoie un SMS via l'API Free Mobile si la requête échoue. Conçu pour détecter les coupures d'une Freebox depuis un serveur externe (VPS, cloud).

## Principe

Le script tourne sur un serveur externe, pas sur la Freebox elle-même. Il sonde périodiquement l'URL de la box (adresse DynDNS ou IP fixe). Si la requête time out ou échoue, c'est que la box n'est plus joignable depuis internet — un SMS d'alerte est envoyé.

Cas d'usage typique : alarme, caméra de surveillance, serveur hébergé derrière une Freebox.

## Prérequis

- Un compte Free Mobile avec l'option SMS activée (Mon Compte > Mes Options > Notifications par SMS)
- Node.js 18+
- Un serveur externe (le script doit être hébergé en dehors du réseau Freebox)

## Installation

```bash
git clone https://github.com/<user>/alert-freebox.git
cd alert-freebox
npm install
cp .env.example .env
# Remplir les valeurs dans .env
```

## Configuration

| Variable | Description |
|---|---|
| `HOST_URL` | URL à surveiller (ex : `https://votredomaine.dyndns.org`) |
| `USER` | Identifiant Free Mobile (8 chiffres) |
| `PASS` | Clé API SMS générée dans Mon Compte Free Mobile |
| `PORT` | Port du serveur Express (défaut : 3000) |

> Attention : `USER` est aussi une variable système sur Linux. Définissez-la explicitement dans le fichier `.env` — dotenv la prendra en priorité sur la valeur système.

## Lancement

```bash
node index.js
# Ou avec PM2 pour un fonctionnement en continu :
pm2 start index.js --name alert-freebox
```

Un SMS de confirmation est envoyé au démarrage pour vérifier que la configuration fonctionne.

## Endpoint HTTP

| Endpoint | Description |
|---|---|
| `GET /testeurderequete` | Envoie un SMS de test immédiatement |

Peut être appelé depuis une règle Freebox, un webhook, ou simplement depuis un navigateur pour valider l'installation.

## Fonctionnement

- Au démarrage : SMS de confirmation + première vérification immédiate
- Ensuite : vérification toutes les 5 minutes
- En cas d'échec (timeout ou erreur réseau) : SMS d'alerte envoyé

La vérification TLS est désactivée pour `HOST_URL` (`rejectUnauthorized: false`) afin de gérer les certificats auto-signés ou les adresses IP directes. L'API Free Mobile est contactée normalement avec TLS valide.
