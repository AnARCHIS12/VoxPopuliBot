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
            11. **satanisme** : ne doit pas etre mis en avant sinon ban sous vote immediat!
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
    "2. Le concept de lutte des classes est-il toujours pertinent au XXIe siècle ?",
    "3. La révolution prolétarienne : mythe ou nécessité historique ?",
    "4. L'abolition du salariat : une utopie réalisable ?",
    "5. Le marxisme face aux défis écologiques contemporains",
    "6. L'autogestion ouvrière : alternative viable au capitalisme ?",
    "7. La dictature du prolétariat : concept dépassé ou mal compris ?",
    "8. L'internationalisme prolétarien à l'ère de la mondialisation",
    "9. La planification économique peut-elle être démocratique ?",
    "10. L'anticapitalisme : quelles alternatives concrètes ?",
    "11. Le syndicalisme révolutionnaire a-t-il encore sa place aujourd'hui ?",
    "12. La démocratie directe : solution aux limites de la démocratie représentative ?",
    "13. L'aliénation au travail : comment la dépasser ?",
    "14. La propriété intellectuelle : obstacle à la diffusion du savoir ?",
    "15. Le communisme libertaire : une alternative au marxisme-léninisme ?",
    "16. La grève générale : arme politique efficace ?",
    "17. L'éducation populaire : vecteur de transformation sociale ?",
    "18. La socialisation des moyens de production : modalités et enjeux",
    "19. Le revenu universel : réforme capitaliste ou mesure transitoire ?",
    "20. L'anarcho-syndicalisme : perspectives contemporaines",
    "21. La commune comme unité politique de base : quelle viabilité ?",
    "22. Le contrôle ouvrier : formes et possibilités",
    "23. La décroissance : nécessité révolutionnaire ?",
    "24. L'abolition de l'État : processus et conséquences",
    "25. Le féminisme radical : dimension anticapitaliste",
    "26. Les soviets : modèle d'organisation politique ?",
    "27. L'écosocialisme : synthèse nécessaire ?",
    "28. La décolonisation économique : quelles stratégies ?",
    "29. L'antimilitarisme : fondement de la paix sociale ?",
    "30. Le municipalisme libertaire : expériences et perspectives",
    "31. La gratuité des services publics : vers quel modèle ?",
    "32. L'autosuffisance alimentaire : base de l'émancipation ?",
    "33. Le travail émancipé : quelle organisation ?",
    "34. La propriété d'usage contre la propriété privée",
    "35. L'abolition de la monnaie : quelles alternatives ?",
    "36. La rotation des tâches : principe d'organisation sociale ?",
    "37. Le communisme de conseils : actualité et pertinence",
    "38. L'autonomie ouvrière : formes et limites",
    "39. La socialisation du care : enjeu révolutionnaire ?",
    "40. L'abolition des classes sociales : processus historique ?",
    "41. Le dépérissement de l'État : conditions et étapes",
    "42. La commune libre : base d'une société nouvelle ?",
    "43. L'internationalisme aujourd'hui : quelles pratiques ?",
    "44. La production autogérée : expériences historiques",
    "45. Le sabotage : tactique de lutte légitime ?",
    "46. L'éducation libertaire : principes et méthodes",
    "47. La propriété sociale : alternative à la propriété étatique ?",
    "48. Le communisme primitif : leçons pour aujourd'hui ?",
    "49. L'abolition du patriarcat : dimension économique",
    "50. La démocratie au travail : quelles formes ?",
    "51. Le socialisme du XXIe siècle : ruptures et continuités",
    "52. L'économie participative : modèle viable ?",
    "53. La révolution permanente : concept actuel ?",
    "54. L'abolition des frontières : processus révolutionnaire ?",
    "55. Le contrôle populaire : mécanismes et institutions",
    "56. La production pour l'usage : alternative au marché ?",
    "57. L'écologie sociale : perspective révolutionnaire ?",
    "58. Le fédéralisme libertaire : organisation politique alternative ?",
    "59. La décolonisation mentale : préalable révolutionnaire ?",
    "60. L'abolition du profit : conséquences systémiques",
    "61. La culture prolétarienne : existe-t-elle encore ?",
    "62. Le luxemburgisme aujourd'hui : quelle pertinence ?",
    "63. La commune insurrectionnelle : modèle d'action ?",
    "64. L'entraide : base d'une nouvelle société ?",
    "65. Le situationnisme : critique sociale toujours valable ?",
    "66. La propriété commune des ressources naturelles",
    "67. L'abolition du travail salarié : étapes concrètes",
    "68. Le conseillisme : alternative au léninisme ?",
    "69. La révolution culturelle : dimension nécessaire ?",
    "70. L'autonomie territoriale : base révolutionnaire ?",
    "71. Le communisme de guerre : leçons historiques",
    "72. L'abolition de la bureaucratie : méthodes et moyens",
    "73. La socialisation de l'art : nécessité révolutionnaire ?",
    "74. Le contrôle des prix : mesure transitoire ?",
    "75. L'autogestion généralisée : possibilités concrètes",
    "76. La révolution numérique : opportunité émancipatrice ?",
    "77. Le municipalisme : base de reconstruction sociale ?",
    "78. L'abolition de la propriété intellectuelle : conséquences",
    "79. La planification démocratique : mécanismes concrets",
    "80. Le communisme anarchiste : synthèse possible ?",
    "81. La révolution sociale : conditions objectives",
    "82. L'abolition de la hiérarchie : processus graduel ?",
    "83. Le contrôle ouvrier : expériences historiques",
    "84. La propriété sociale : gestion démocratique ?",
    "85. L'économie solidaire : alternative systémique ?",
    "86. La révolution permanente : actualisation nécessaire ?",
    "87. Le socialisme scientifique : concept dépassé ?",
    "88. L'abolition du marché : étapes transitoires",
    "89. La commune autonome : viabilité économique ?",
    "90. Le contrôle populaire : institutions nécessaires",
    "91. L'autogestion territoriale : expériences concrètes",
    "92. La propriété collective : modes de gestion",
    "93. L'économie planifiée : nouveaux modèles",
    "94. La révolution digitale : potentiel émancipateur ?",
    "95. Le communisme municipal : alternative locale ?",
    "96. L'abolition de l'argent : société post-monétaire",
    "97. La démocratie économique : formes concrètes",
    "98. Le socialisme autogestionnaire : perspectives actuelles",
    "99. La révolution écologique : dimension anticapitaliste",
    "100. La question de la liberté d'expression : Quels enjeux ?"
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
