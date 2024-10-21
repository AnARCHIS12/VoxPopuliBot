require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, InteractionType } = require('discord.js');
const cron = require('node-cron'); // Importation de node-cron pour la planification
const express = require('express');
const https = require('https');
const fs = require('fs');

const token = process.env.DISCORD_TOKEN;
const domainName = process.env.DOMAIN_NAME; 

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

// Liste de sujets automatiques pour les débats
const sujetsAutomatiques = [
    "La nécessité d'une éducation gratuite et accessible à tous.",
    "Les impacts de la technologie sur la vie sociale.",
    "Le rôle des mouvements sociaux dans la lutte pour les droits civiques.",
    "La place de l'art dans la contestation politique.",
    "Les avantages et inconvénients de la démocratie directe.",
    "La gestion des ressources naturelles et la durabilité.",
    "La responsabilité des individus face aux crises climatiques.",
    "La santé mentale et son importance dans nos sociétés.",
    "Les dangers de la désinformation dans les médias modernes.",
    "L'impact de l'immigration sur les sociétés contemporaines.",
    "Les droits des travailleurs à l'ère du télétravail.",
    "Les alternatives à la prison dans le système judiciaire.",
    "Le rôle des femmes dans les mouvements de changement social.",
    "Les défis des communautés autochtones dans la société moderne.",
    "Comment favoriser l'entraide et la solidarité au sein des communautés."
];


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
        // Enregistrer les commandes pour tous les serveurs (globalement)
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // Utilisez la variable d'environnement si nécessaire
            { body: commands },
        );

        console.log('Les commandes slash globales ont été enregistrées.');
    } catch (error) {
        console.error(error);
    }
})();

// Création d'un serveur HTTPS
const app = express();

const options = {
    key: fs.readFileSync(`/etc/letsencrypt/live/${domainName}/privkey.pem`),
    cert: fs.readFileSync(`/etc/letsencrypt/live/${domainName}/fullchain.pem`),
};

// Démarrer le serveur HTTPS
const server = https.createServer(options, app);
server.listen(3000, () => {
    console.log('Le serveur HTTPS est en ligne sur le port 3000');
});

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
