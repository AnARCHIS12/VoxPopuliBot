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
        .setTitle('🏴 **MANIFESTE DE LA COMMUNE NUMÉRIQUE AUTOGÉRÉE** ⚔️')
        .setDescription(`
            \`\`\`diff
            + PRINCIPES FONDAMENTAUX DE NOTRE COLLECTIF RÉVOLUTIONNAIRE
            \`\`\`
            
            🔥 **1. LIBERTÉ ABSOLUE ET RÉSISTANCE**
            L'expression libre est notre arme contre l'oppression. Aucune hiérarchie ne sera tolérée.
            
            ⚒️ **2. SOLIDARITÉ PROLÉTARIENNE**
            Unis dans la lutte, nous sommes la force du changement. Le soutien mutuel est notre fondation.
            
            ⭐ **3. DÉMOCRATIE DIRECTE**
            Le pouvoir au peuple! Chaque camarade a une voix égale dans notre commune digitale.
            
            🛡️ **4. SÉCURITÉ COLLECTIVE**
            Protection mutuelle des données et de la vie privée contre la surveillance capitaliste.
            
            ✊ **5. ACTION DIRECTE**
            Participation active dans la lutte pour un monde meilleur. L'inaction est complice du système.
            
            🕊️ **6. RÉSISTANCE NON-VIOLENTE**
            Notre force est dans l'unité et l'intelligence collective, pas dans la violence physique.
            
            📚 **7. ÉDUCATION RÉVOLUTIONNAIRE**
            Le savoir est une arme. Partageons-le librement, brisons les chaînes de l'ignorance.
            
            🌐 **8. AUTOGESTION NUMÉRIQUE**
            Nous sommes les architectes de notre propre espace virtuel libéré.
            
            🎨 **9. CRÉATIVITÉ SUBVERSIVE**
            L'art et l'innovation comme outils de résistance et de changement social.
            
            ⚡ **10. RÉVOLUTION PERMANENTE**
            La lutte continue jusqu'à la libération totale de l'humanité.
            
            \`\`\`diff
            - CONTRE L'ÉTAT, LE CAPITAL ET TOUTE FORME D'OPPRESSION
            + POUR L'ÉMANCIPATION TOTALE ET LA LIBERTÉ COLLECTIVE
            \`\`\`
        `)
        .setImage('https://cdn.discordapp.com/attachments/1330606622887645304/1330613413528862761/UNION_ANARCHISTE2.png?ex=678e9dcf&is=678d4c4f&hm=b43747d7fd7941b9d3438ff424b454b3f291f9e36c452d18b6e0849f22fda08b&')
        .setFooter({ 
            text: '✊ NO PASARAN! La révolution sera numérique ou ne sera pas! ✊', 
            iconURL: 'https://cdn.discordapp.com/attachments/1330606622887645304/1330613413528862761/UNION_ANARCHISTE2.png?ex=678e9dcf&is=678d4c4f&hm=b43747d7fd7941b9d3438ff424b454b3f291f9e36c452d18b6e0849f22fda08b&' 
        })
        .setTimestamp();
}

// Fonction pour créer l'embed des débats
function createDebateEmbed(sujet) {
    return new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('💭 **DIALECTIQUE RÉVOLUTIONNAIRE** 🗣️')
        .setDescription(`
            \`\`\`diff
            + DÉBAT DU JOUR : CONSCIENCE DE CLASSE ET RÉFLEXION COLLECTIVE
            \`\`\`

            ⚔️ **SUJET DE DISCUSSION :**
            ${sujet}

            \`\`\`md
            # DIRECTIVES POUR UN DÉBAT CONSTRUCTIF
            \`\`\`

            🎯 **OBJECTIF**
            Développer notre conscience collective et affiner notre analyse révolutionnaire

            🔄 **MÉTHODE DIALECTIQUE**
            1. Thèse ➜ Exposez vos arguments
            2. Antithèse ➜ Confrontez les perspectives
            3. Synthèse ➜ Construisons ensemble

            ⚡ **RÈGLES D'ENGAGEMENT**
            • Argumentez avec rigueur et respect
            • Citez vos sources théoriques
            • Liez théorie et pratique
            • Pensez collectivement

            \`\`\`diff
            - CONTRE LA PENSÉE UNIQUE CAPITALISTE
            + POUR UNE RÉFLEXION LIBRE ET RÉVOLUTIONNAIRE
            \`\`\`
        `)
        .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Raised_fist.svg/1200px-Raised_fist.svg.png')
        .setFooter({ 
            text: '🏴 La théorie sans action est stérile, l\'action sans théorie est aveugle! ⚔️',
            iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Anarchy.svg/1024px-Anarchy.svg.png' 
        })
        .setTimestamp();
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
    "9. La production autogérée : expériences historiques",
    "10. Le sabotage : tactique de lutte légitime ?",
    "11. L'éducation libertaire : principes et méthodes",
    "12. La propriété sociale : alternative à la propriété étatique ?",
    "13. Le communisme primitif : leçons pour aujourd'hui ?",
    "14. L'abolition du patriarcat : dimension économique",
    "15. La démocratie au travail : quelles formes ?",
    "16. Le socialisme du XXIe siècle : ruptures et continuités",
    "17. L'économie participative : modèle viable ?",
    "18. La révolution permanente : concept actuel ?",
    "19. L'abolition des frontières : processus révolutionnaire ?",
    "20. Le contrôle populaire : mécanismes et institutions",
    "21. La production pour l'usage : alternative au marché ?",
    "22. L'écologie sociale : perspective révolutionnaire ?",
    "23. Le fédéralisme libertaire : organisation politique alternative ?",
    "24. La décolonisation mentale : préalable révolutionnaire ?",
    "25. L'abolition du profit : conséquences systémiques",
    "26. La culture prolétarienne : existe-t-elle encore ?",
    "27. Le luxemburgisme aujourd'hui : quelle pertinence ?",
    "28. La commune insurrectionnelle : modèle d'action ?",
    "29. L'entraide : base d'une nouvelle société ?",
    "30. Le situationnisme : critique sociale toujours valable ?",
    "31. La propriété commune des ressources naturelles",
    "32. L'abolition du travail salarié : étapes concrètes",
    "33. Le conseillisme : alternative au léninisme ?",
    "34. La révolution culturelle : dimension nécessaire ?",
    "35. L'autonomie territoriale : base révolutionnaire ?",
    "36. Le communisme de guerre : leçons historiques",
    "37. L'abolition de la bureaucratie : méthodes et moyens",
    "38. La socialisation de l'art : nécessité révolutionnaire ?",
    "39. Le contrôle des prix : mesure transitoire ?",
    "40. L'autogestion généralisée : possibilités concrètes",
    "41. La révolution numérique : opportunité émancipatrice ?",
    "42. Le municipalisme : base de reconstruction sociale ?",
    "43. L'abolition de la propriété intellectuelle : conséquences",
    "44. La planification démocratique : mécanismes concrets",
    "45. Le communisme anarchiste : synthèse possible ?",
    "46. La révolution sociale : conditions objectives",
    "47. L'abolition de la hiérarchie : processus graduel ?",
    "48. Le contrôle ouvrier : expériences historiques",
    "49. La propriété sociale : gestion démocratique ?",
    "50. L'économie solidaire : alternative systémique ?",
    "51. La révolution permanente : actualisation nécessaire ?",
    "52. Le socialisme scientifique : concept dépassé ?",
    "53. L'abolition du marché : étapes transitoires",
    "54. La commune autonome : viabilité économique ?",
    "55. Le contrôle populaire : institutions nécessaires",
    "56. L'autogestion territoriale : expériences concrètes",
    "57. La propriété collective : modes de gestion",
    "58. L'économie planifiée : nouveaux modèles",
    "59. La révolution digitale : potentiel émancipateur ?",
    "60. Le communisme municipal : alternative locale ?",
    "61. L'abolition de l'argent : société post-monétaire",
    "62. La démocratie économique : formes concrètes",
    "63. Le socialisme autogestionnaire : perspectives actuelles",
    "64. La révolution écologique : dimension anticapitaliste",
    "65. La question de la liberté d'expression : Quels enjeux ?"
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
                await channel.send({ embeds: [createDebateEmbed(sujet)] });
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

        await canal.send({ embeds: [createDebateEmbed(sujet)] });
        await interaction.reply({ content: '✊ Débat révolutionnaire lancé avec succès! ⚔️', ephemeral: true });
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
