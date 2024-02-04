import express from "express"
import fs from "fs"
import { exec } from "child_process"
import http from "http"
import https from "https"

const app = express();
app.use(express.static("public"))

const privateKey = fs.readFileSync('/etc/letsencrypt/live/diru.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/diru.dev/fullchain.pem', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate
};


const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers['host']}${req.url}` });
    res.end();
});

app.get("/", (req, res) => {
    res.render("index.ejs")
})

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');

    exec('certbot certonly --webroot -w / -d diru.dev', (err, stdout, stderr) => {
        if (err) {
          console.error(`Failed to get CertBot: ${stderr}`);
        } else {
          console.log(`Certified Succesfull: \n${stdout}`);
        }
      });
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
})