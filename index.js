const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');
const app = express();

// Initialize Discord client with necessary intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers  // Ajout de l'intent pour les membres
    ]
});

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const PORT = process.env.PORT || 3000;

// Configuration du serveur Express
app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Fonction pour créer l'embed des règles
function createRulesEmbed() {
    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('**ⒶRègles De Lacommuneautogérée Ⓐ **')
        .setDescription(`
            1. **Liberté d'expression** : Chacun est libre de s'exprimer, dans le respect de l'autonomie de tous, sans entrave ni hiérarchie, tant que cela ne porte pas atteinte à la liberté et à l'égalité des autres
            2. **Solidarité** : Soutenons-nous mutuellement dans nos luttes et aspirations.
            3. **Égalité** : Chaque voix compte. Les décisions doivent être prises collectivement.
            4. **Respect de la vie privée** : Protégeons les informations personnelles et respectons la vie privée de chacun.
            5. **Participation active** : Engageons-nous dans les discussions et les activités du serveur.
            6. **Refus de la violence** : La violence et l'intimidation n'ont pas leur place ici.
            7. **Éducation et apprentissage** : Encourageons l'échange de connaissances et d'expériences.
            8. **Responsabilité collective** : Chacun est responsable de maintenir un environnement sûr et inclusif.
            9. **Autonomie et collectif ** : Encourageons l'initiative individuelle et collectif tout en respectant le bien commun.
            10. **Créativité** : Valorisons l'innovation et la créativité dans nos interactions et nos projets.
        `)
        .setFooter({ 
            text: 'Vive l\'anarchie !', 
            iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Anarchy.svg/1024px-Anarchy.svg.png' 
        });
}

// Système anti-veille amélioré
function keepAlive() {
    setInterval(() => {
        if (client.ws.ping > 0) {
            console.log(`Bot actif - Ping: ${client.ws.ping}ms`);
        } else {
            console.log('Reconnexion...');
            client.login(token);
        }
    }, 300000); // Vérifie toutes les 5 minutes (300000ms)
}

// Gestion des erreurs basique
process.on('unhandledRejection', error => {
    console.error('Erreur:', error);
    client.login(token);
});

// Your existing sujetsAutomatiques array stays the same
const sujetsAutomatiques = [
    "1. La propriété collective : Est-elle la clé pour une société plus juste ?",
    // ... (all other topics remain the same)
    "100. La question de la liberté d'expression dans une société communiste : Quels enjeux ?"
];

const CONFIG_FILE = 'config.json';
let config = { 
    debateChannelId: null, 
    pingChannelId: null,
    rulesChannelId: null  // Ajout d'un canal pour les règles
};

if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

// Ajout de la commande pour configurer le canal des règles
const commands = [
    {
        name: 'creerdebat',
        description: 'Crée un nouveau débat avec un sujet spécifié',
        options: [
            {
                name: 'sujet',
                type: 3,
                description: 'Le sujet du débat',
                required: true,
            },
            {
                name: 'canal',
                type: 7,
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
                type: 7,
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
                type: 7,
                description: 'Le salon à configurer pour les pings',
                required: true,
            },
        ],
    },
    {
        name: 'regles',
        description: 'Affiche les règles du serveur',
    },
    {
        name: 'configureregles',
        description: 'Configure le salon pour l\'affichage automatique des règles',
        options: [
            {
                name: 'canal',
                type: 7,
                description: 'Le salon à configurer pour les règles',
                required: true,
            },
        ],
    },
    {
        name: 'afficheregles',
        description: 'Affiche les règles dans le canal actuel',
    }
];

const rest = new REST({ version: '10' }).setToken(token);

// Register slash commands
(async () => {
    try {
        console.log('Enregistrement des commandes slash globales...');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Les commandes slash globales ont été enregistrées.');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des commandes:', error);
    }
})();

// Gestion des nouveaux membres
client.on('guildMemberAdd', async (member) => {
    try {
        // Envoie un message de bienvenue avec les règles en DM
        await member.send({ 
            content: `Bienvenue sur le serveur, ${member.user.username} ! Voici nos règles :`,
            embeds: [createRulesEmbed()]
        });

        // Si un canal de règles est configuré, y envoyer aussi les règles
        if (config.rulesChannelId) {
            const rulesChannel = member.guild.channels.cache.get(config.rulesChannelId);
            if (rulesChannel) {
                await rulesChannel.send({
                    content: `Bienvenue ${member} ! Voici les règles du serveur :`,
                    embeds: [createRulesEmbed()]
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi des règles:', error);
    }
});

// Ready event handler
client.on('ready', () => {
    console.log(`Le bot est en ligne en tant que ${client.user.tag}`);
    
    keepAlive();
    
    client.user.setPresence({
        activities: [{ name: 'Veiller sur l\'anarchie', type: 'WATCHING' }],
        status: 'online'
    });

    // Schedule daily debate topic
    cron.schedule('0 12 * * *', async () => {
        const channel = client.channels.cache.get(config.debateChannelId);
        if (channel) {
            const sujet = sujetsAutomatiques[Math.floor(Math.random() * sujetsAutomatiques.length)];
            try {
                await channel.send(`Nouveau sujet de débat : ${sujet}`);
            } catch (error) {
                console.error('Erreur lors de l\'envoi du débat:', error);
            }
        } else {
            console.error('Canal de débat non configuré.');
        }
    });
});

// Interaction handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'regles' || commandName === 'afficheregles') {
        await interaction.reply({ embeds: [createRulesEmbed()] });
    } else if (commandName === 'creerdebat') {
        const sujet = interaction.options.getString('sujet');
        const canal = interaction.options.getChannel('canal') || interaction.channel;

        await canal.send(`Nouveau sujet de débat : ${sujet}`);
        await interaction.reply({ content: 'Débat créé avec succès !', ephemeral: true });
    } else if (commandName === 'configurerdebats') {
        const canal = interaction.options.getChannel('canal');
        config.debateChannelId = canal.id;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        await interaction.reply({ content: 'Canal de débats configuré avec succès !', ephemeral: true });
    } else if (commandName === 'configurerping') {
        const canal = interaction.options.getChannel('canal');
        config.pingChannelId = canal.id;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        await interaction.reply({ content: 'Canal de pings configuré avec succès !', ephemeral: true });
    } else if (commandName === 'configureregles') {
        const canal = interaction.options.getChannel('canal');
        config.rulesChannelId = canal.id;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        await interaction.reply({ content: 'Canal des règles configuré avec succès !', ephemeral: true });
        
        // Affiche immédiatement les règles dans le nouveau canal
        await canal.send({ embeds: [createRulesEmbed()] });
    }
});

// Gestion des déconnexions
client.on('disconnect', () => {
    console.log('Bot déconnecté. Reconnexion...');
    client.login(token);
});

// Bot login initial
client.login(token);
