/**
 * alert-freebox
 *
 * Monitors a remote URL every 5 minutes. If the request fails (timeout or error),
 * sends an SMS alert via the Free Mobile API. Useful for detecting Freebox disconnections
 * from an external server (VPS, cloud instance, etc.).
 *
 * Required environment variables:
 *   HOST_URL  — URL to probe (e.g. your Freebox's dynamic DNS address)
 *   USER      — Free Mobile account ID (note: do not rely on the system USER variable)
 *   PASS      — Free Mobile SMS API key (generated in Mon Compte > Mes Options)
 */

require('dotenv').config();
const https = require('https');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST_URL = process.env.HOST_URL;

const FREE_SMS_API = 'https://smsapi.free-mobile.fr/sendmsg';
const USER = process.env.USER;
const PASS = process.env.PASS;

const MESSAGE_START = 'Script lance pour verifier la connexion vers ' + HOST_URL;
const MESSAGE_ALERT = 'Alerte : La box est deconnectee !';
const MESSAGE_TEST = 'Requete test depuis web';

// Self-signed or private certificates are common on home boxes — skip TLS verification
// for the monitored host only, not for the Free Mobile API.
const agent = new https.Agent({ rejectUnauthorized: false });

// Notify on startup so you know the script is running
axios.get(FREE_SMS_API, {
    params: { user: USER, pass: PASS, msg: MESSAGE_START }
}).catch(error => console.error('Erreur envoi SMS demarrage:', error));

async function checkConnection() {
    try {
        const res = await axios.get(HOST_URL, { timeout: 5000, httpsAgent: agent });
        console.log(res.data);
    } catch (error) {
        console.log('La box est deconnectee. Envoi du SMS...');
        axios.get(FREE_SMS_API, {
            params: { user: USER, pass: PASS, msg: MESSAGE_ALERT }
        }).catch(err => console.error('Erreur envoi SMS alerte:', err));
    }
}

// Check immediately on startup, then every 5 minutes
checkConnection();
setInterval(checkConnection, 300_000);

// Trigger a test SMS from the outside (e.g. from a Freebox rule or webhook)
app.get('/testeurderequete', async (req, res) => {
    console.log('Requete GET recue sur /testeurderequete');
    try {
        await axios.get(FREE_SMS_API, {
            params: { user: USER, pass: PASS, msg: MESSAGE_TEST }
        });
        res.send('Envoi de requete de test en cours');
    } catch (error) {
        console.error('Erreur lors de l envoi du SMS de test:', error);
        res.status(500).send('Erreur lors de l envoi du SMS');
    }
});

app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`);
});
