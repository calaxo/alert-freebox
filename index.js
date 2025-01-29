require('dotenv').config();
const ping = require('ping');
const axios = require('axios');

const HOST = process.env.HOST;
const FREE_SMS_API = 'https://smsapi.free-mobile.fr/sendmsg';
const USER = process.env.USER;
const PASS = process.env.PASS;
const MESSAGE = 'Alerte : La box est déconnectée !';

async function checkConnection() {
    try {
        const res = await ping.promise.probe(HOST, { timeout: 5 });
        if (!res.alive) {
            console.log('La box est déconnectée. Envoi du SMS...');
            await axios.get(FREE_SMS_API, {
                params: {
                    user: USER,
                    pass: PASS,
                    msg: MESSAGE
                }
            });
        } else {
            console.log('La box est en ligne.');
        }
    } catch (error) {
        console.error('Erreur lors du ping ou de l'envoi du SMS :', error);
    }
}

// Vérification toutes les 5 minutes (300000 ms)
setInterval(checkConnection, 300000);

// Vérification immédiate au démarrage
checkConnection();
