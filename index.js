require('dotenv').config();
const https = require('https');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = 3000;
const HOST_URL = process.env.HOST_URL;

const FREE_SMS_API = 'https://smsapi.free-mobile.fr/sendmsg';
const USER = process.env.USER;
const PASS = process.env.PASS;
const MESSAGE_START = 'Script lance pour verifier la connexion vers ' + HOST_URL;
const MESSAGE_ALERT = 'Alerte : La box est deconnectee !';
const MESSAGE_TEST = 'Requete test depuis web';

const agent = new https.Agent({ rejectUnauthorized: false });

// Envoi d un SMS au demarrage
axios.get(FREE_SMS_API, {
    params: {
        user: USER,
        pass: PASS,
        msg: MESSAGE_START
    }
}).catch(error => console.error('Erreur envoi SMS demarrage:', error));

async function checkConnection() {
    try {
        const res = await axios.get(HOST_URL, { timeout: 5000, httpsAgent: agent });
        console.log(res.data);
    } catch (error) {
        console.log('La box est deconnectee. Envoi du SMS...');
        axios.get(FREE_SMS_API, {
            params: {
                user: USER,
                pass: PASS,
                msg: MESSAGE_ALERT
            }
        }).catch(err => console.error('Erreur envoi SMS alerte:', err));
    }
}

// Verification toutes les 5 minutes (300000 ms)
setInterval(checkConnection, 300000);

// Verification immediate au demarrage
checkConnection();

// Route pour tester la reception de requetes GET
app.get('/testeurderequete', async (req, res) => {
    console.log('Requete GET recue sur /testeurderequete');
    try {
        await axios.get(FREE_SMS_API, {
            params: {
                user: USER,
                pass: PASS,
                msg: MESSAGE_TEST
            }
        });
        res.send('Envoi de requete de test en cours');
    } catch (error) {
        console.error('Erreur lors de l envoi du SMS de test:', error);
        res.status(500).send('Erreur lors de l envoi du SMS');
    }
});

// Lancement du serveur Express
app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`);
});
