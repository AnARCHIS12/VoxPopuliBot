require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const express = require('express');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const app = express();
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

const sujetsAutomatiques = [
    "1. La propriété collective : Est-elle la clé pour une société plus juste ?",
    "2. L'égalité économique : Comment l'atteindre dans une société moderne ?",
    // Ajoutez tous les autres sujets ici
];

const CONFIG_FILE = 'config.json';
let config = {};
if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
} else {
    config = { debateChannelId: null, pingChannelId: null };
}

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
            {
                name: 'canal',
                type: 7, // CHANNEL type
                description: 'Le canal où envoyer le débat',
                required: false,
            },
        ],
    },
    {
        name: 'configurerdebats',
        description: 'Configure le salon pour les débats automatiques et manuels',
        options: [
            {
                name: 'canal',
                type: 7, // CHANNEL type
                description: 'Le salon à configurer pour les débats',
                required: true,
            },
        ],
    },
    {
        name: 'configurerping',
        description: 'Configure le salon pour les pings automatiques',
        options: [
            {
                name: 'canal',
                type: 7, // CHANNEL type
                description: 'Le salon à configurer pour les pings',
                required: true,
            },
        ],
    },
    {
        name: 'regles',
        description: 'Affiche les règles du serveur',
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

    cron.schedule('0 */6 * * *', async () => {
        const guild = client.guilds.cache.first();
        if (!guild || !config.debateChannelId) return;

        const sujet = sujetsAutomatiques[Math.floor(Math.random() * sujetsAutomatiques.length)];
        const debatChannel = guild.channels.cache.get(config.debateChannelId);

        if (debatChannel) {
            await debatChannel.send(`**Nouveau sujet de débat :** ${sujet}`);
            console.log('Débat automatique envoyé.');
        } else {
            console.log('Débat automatique échoué : Canal introuvable.');
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'creerdebat') {
        const sujet = options.getString('sujet');
        const canal = options.getChannel('canal') || client.channels.cache.get(config.debateChannelId);
        
        if (canal) {
            await canal.send(`**Débat :** ${sujet}`);
            await interaction.reply({ content: 'Débat créé avec succès.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Salon de débat non configuré.', ephemeral: true });
        }

    } else if (commandName === 'configurerdebats') {
        const canal = options.getChannel('canal');
        config.debateChannelId = canal.id;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        await interaction.reply(`Salon des débats configuré sur ${canal}`);

    } else if (commandName === 'configurerping') {
        const canal = options.getChannel('canal');
        config.pingChannelId = canal.id;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        await interaction.reply(`Salon pour les pings configuré sur ${canal}`);

    } else if (commandName === 'regles') {
        await interaction.reply("Règles du serveur : Respectez les autres, soyez bienveillant, et participez de manière constructive.");
    }
});

client.login(token);

app.listen(3000, () => console.log('Serveur Express en écoute sur le port 3000'));
