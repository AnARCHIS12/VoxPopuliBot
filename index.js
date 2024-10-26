const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');

// Initialize Discord client with necessary intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

// Système anti-veille simple
function keepAlive() {
    setInterval(() => {
        if (client.ws.ping > 0) {
            console.log(`Bot actif - Ping: ${client.ws.ping}ms`);
        } else {
            console.log('Reconnexion...');
            client.login(token);
        }
    }, 10000); // Vérifie toutes les 10 secondes
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
let config = { debateChannelId: null, pingChannelId: null };

if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

// Slash commands configuration
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

// Ready event handler
client.on('ready', () => {
    console.log(`Le bot est en ligne en tant que ${client.user.tag}`);
    
    // Démarre le système anti-veille
    keepAlive();
    
    // Met un statut permanent
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

    if (commandName === 'regles') {
        const rulesEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('**Règles du Serveur Anarchiste**')
            .setDescription(`
                1. **Liberté d'expression** : Chaque membre est libre de s'exprimer tant que cela ne nuit pas aux autres.
                2. **Solidarité** : Soutenons-nous mutuellement dans nos luttes et aspirations.
                3. **Égalité** : Chaque voix compte. Les décisions doivent être prises collectivement.
                4. **Respect de la vie privée** : Protégeons les informations personnelles et respectons la vie privée de chacun.
                5. **Participation active** : Engageons-nous dans les discussions et les activités du serveur.
                6. **Refus de la violence** : La violence et l'intimidation n'ont pas leur place ici.
                7. **Éducation et apprentissage** : Encourageons l'échange de connaissances et d'expériences.
                8. **Responsabilité collective** : Chacun est responsable de maintenir un environnement sûr et inclusif.
                9. **Autonomie** : Encourageons l'initiative individuelle tout en respectant le bien commun.
                10. **Créativité** : Valorisons l'innovation et la créativité dans nos interactions et nos projets.
            `)
            .setFooter({ 
                text: 'Vive l\'anarchie !', 
                iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Anarchy.svg/1024px-Anarchy.svg.png' 
            });

        await interaction.reply({ embeds: [rulesEmbed] });
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
    }
});

// Gestion des déconnexions
client.on('disconnect', () => {
    console.log('Bot déconnecté. Reconnexion...');
    client.login(token);
});

// Bot login initial
client.login(token);