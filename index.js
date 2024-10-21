require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, InteractionType } = require('discord.js');
const cron = require('node-cron'); // Importation de node-cron pour la planification
const express = require('express');
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const domainName = process.env.DOMAIN_NAME; 

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

// Liste de sujets automatiques pour les débats
const sujetsAutomatiques = [
    // Vos sujets ici...
    "1. L'avenir du travail à l'ère de l'automatisation : Quel impact l'automatisation a-t-elle sur l'emploi et le marché du travail ?",
    // Ajoutez d'autres sujets...
];

// Fonction pour générer les certificats SSL avec certbot
function generateSSLCertificates() {
    console.log('Génération des certificats SSL avec Certbot...');
    try {
        execSync(`sudo certbot certonly --standalone -d ${domainName} --non-interactive --agree-tos --email your-email@example.com`);
        console.log('Certificats SSL générés avec succès.');
    } catch (error) {
        console.error('Erreur lors de la génération des certificats SSL:', error.message);
        process.exit(1); // Arrêter le processus si l'erreur se produit
    }
}

// Vérification de l'existence des fichiers SSL
const keyPath = `/etc/letsencrypt/live/${domainName}/privkey.pem`;
const certPath = `/etc/letsencrypt/live/${domainName}/fullchain.pem`;

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    generateSSLCertificates(); // Générer les certificats si absents
}

// Lecture des fichiers SSL
const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
};

// Démarrer le serveur HTTPS
const server = https.createServer(options, express());
server.listen(3000, () => {
    console.log('Le serveur HTTPS est en ligne sur le port 3000');
});

// Enregistrement des slash commandes globales
const commands = [
    {
        name: 'creerdebat',
        description: 'Crée un nouveau débat avec un sujet spécifié',
        options: [
            {
                name: 'sujet',
                type: 3, // STRING type
                description: 'Le sujet du débat',
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Enregistrement des commandes slash globales...');
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Les commandes slash globales ont été enregistrées.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`Le bot est en ligne en tant que ${client.user.tag}`);

    // Planification d'un débat automatique toutes les 6 heures
    cron.schedule('0 */6 * * *', async () => {
        const guild = client.guilds.cache.first(); // Sélectionner le premier serveur (ou modifier pour un serveur spécifique)
        if (!guild) return;

        // Sélectionner un sujet aléatoire pour le débat
        const sujet = sujetsAutomatiques[Math.floor(Math.random() * sujetsAutomatiques.length)];

        // Chercher ou créer la catégorie "Débats"
        let category = guild.channels.cache.find(c => c.name === 'Débats' && c.type === 4); // Type 4 pour Catégorie
        if (!category) {
            category = await guild.channels.create({
                name: 'Débats',
                type: 4, // Catégorie
            });
        }

        // Créer un salon de texte pour le débat
        const debatChannel = await guild.channels.create({
            name: `débat-${sujet.split(':')[0]}`, // Utiliser juste le numéro pour le nom du channel
            type: 0, // Salon textuel
            parent: category.id,
        });

        // Envoyer un message dans le salon du débat
        await debatChannel.send(`Nouveau débat créé automatiquement : **${sujet}**`);
        console.log(`Débat automatique créé : ${sujet}`);
    });
});

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    if (interaction.commandName === 'creerdebat') {
        const sujet = interaction.options.getString('sujet');
        const guild = interaction.guild;

        // Chercher ou créer la catégorie "Débats"
        let category = guild.channels.cache.find(c => c.name === 'Débats' && c.type === 4); // Type 4 pour Catégorie
        if (!category) {
            category = await guild.channels.create({
                name: 'Débats',
                type: 4, // Catégorie
            });
        }

        // Créer un salon de texte pour le débat
        const debatChannel = await guild.channels.create({
            name: `débat-${sujet.split(':')[0]}`, // Utiliser juste le numéro pour le nom du channel
            type: 0, // Salon textuel
            parent: category.id,
        });

        // Répondre à l'interaction
        await interaction.reply(`Débat créé : ${debatChannel}`);
    }
});

client.login(token);

