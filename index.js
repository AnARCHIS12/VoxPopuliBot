require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const express = require('express');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const app = express();
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

// Liste de sujets automatiques pour les débats
const sujetsAutomatiques = [
      "1. La propriété collective : Est-elle la clé pour une société plus juste ?",
    "2. L'égalité économique : Comment l'atteindre dans une société moderne ?",
    "3. L'impact des révolutions communistes du 20ème siècle : Qu'avons-nous appris ?",
    "4. L'anarchisme et l'organisation sociale : Peut-on vivre sans gouvernement ?",
    "5. La lutte des classes : Est-elle toujours d'actualité dans notre société ?",
    "6. La suppression de l'État : Est-ce une utopie ou un objectif réalisable ?",
    "7. La critique du capitalisme : Quels sont les arguments les plus convaincants ?",
    "8. Les communistes et les anarchistes : Quelles différences et similitudes existent-ils ?",
    "9. La collectivisation des ressources : Peut-elle résoudre les crises environnementales ?",
    "10. Le rôle de l'éducation dans une société anarchiste : Comment organiser l'apprentissage ?",
    "11. Les expériences communistes en Amérique latine : Réussites et échecs.",
    "12. Les limites de l'État dans le socialisme : Où doit-on tracer la ligne ?",
    "13. La solidarité internationale : Comment renforcer le mouvement ouvrier à l'échelle mondiale ?",
    "14. Les alternatives à la propriété privée : Quelles sont les modèles possibles ?",
    "15. Le féminisme et le socialisme : Comment ces mouvements peuvent-ils s'entraider ?",
    "16. Les luttes pour les droits des travailleurs : Quels sont les défis actuels ?",
    "17. Le concept de décentralisation dans l'anarchisme : Avantages et inconvénients.",
    "18. La réforme agraire : Une nécessité pour une société équitable ?",
    "19. La critique des partis politiques traditionnels : Sont-ils compatibles avec l'anarchisme ?",
    "20. L'impact des technologies sur l'organisation du travail : Une opportunité ou une menace ?",
    "21. La justice sociale dans une société communiste : Quelles mesures doivent être prises ?",
    "22. L'utopie communiste : Peut-elle devenir une réalité ?",
    "23. La culture et l'art dans une société sans classes : Quel rôle jouent-ils ?",
    "24. Le travail gratuit : Est-ce une forme d'exploitation ou un acte de solidarité ?",
    "25. La lutte contre le racisme et le sexisme dans les mouvements de gauche : Quelles stratégies adopter ?",
    "26. Les communes autonomes : Exemples et perspectives d'avenir.",
    "27. Le rôle des syndicats dans la lutte pour les droits des travailleurs : Quelles sont les meilleures pratiques ?",
    "28. La critique de la propriété intellectuelle dans une société communiste : Est-elle pertinente ?",
    "29. La guerre des classes : Quels moyens de lutte pour les opprimés ?",
    "30. La transition vers une économie planifiée : Quels défis à surmonter ?",
    "31. La commune de Paris : Leçons à tirer pour les mouvements contemporains.",
    "32. L'anarchisme et l'environnement : Comment les valeurs anarchistes peuvent-elles promouvoir la durabilité ?",
    "33. La désobéissance civile : Quand et comment l'utiliser dans les luttes sociales ?",
    "34. La vision d'un monde sans guerre : Comment les idéologies communistes et anarchistes contribuent-elles à cela ?",
    "35. La critique de la consommation de masse : Comment repenser notre rapport à la consommation ?",
    "36. La question de la violence dans la révolution : Est-elle justifiée ?",
    "37. Les communes et la démocratie directe : Exemples et implications.",
    "38. La relation entre anarchisme et écologie : Comment ces mouvements peuvent-ils s'entraider ?",
    "39. Les systèmes économiques alternatifs : Quelles expériences ont été réalisées ?",
    "40. La critique du nationalisme : Comment les mouvements communistes et anarchistes luttent contre lui ?",
    "41. Les féministes anarchistes : Quels sont leurs apports au mouvement ?",
    "42. La révolution numérique : Quel impact sur les luttes sociales ?",
    "43. Les débats sur le progrès : Peut-on parler de progrès sans capitalisme ?",
    "44. Les mouvements anti-capitalistes : Quelles stratégies communes peuvent être mises en œuvre ?",
    "45. Les perspectives d'une société sans argent : Utopie ou possibilité ?",
    "46. La nécessité d'une éducation révolutionnaire : Comment éduquer pour la liberté ?",
    "47. Les implications du travail à temps partiel dans une société post-capitaliste.",
    "48. La révolte des gilets jaunes : Quelles leçons pour les mouvements révolutionnaires ?",
    "49. L'art engagé : Comment peut-il être utilisé pour promouvoir des idéaux communistes ou anarchistes ?",
    "50. La question de l'immigration dans les mouvements de gauche : Quelles solutions ?",
    "51. Le pouvoir des femmes dans les luttes révolutionnaires : Un aspect souvent ignoré.",
    "52. Les réseaux de solidarité : Comment les construire dans nos sociétés actuelles ?",
    "53. Les expériences de démocratie directe dans le monde : Quelles leçons pour les mouvements d'aujourd'hui ?",
    "54. Le rôle des artistes dans les mouvements politiques : Une voix pour le changement ?",
    "55. La question de la redistribution des richesses : Est-elle réalisable sans révolution ?",
    "56. Les luttes contre l'austérité : Quelles stratégies doivent être adoptées ?",
    "57. L'impact du féminisme radical sur l'anarchisme : Un dialogue nécessaire ?",
    "58. La question de l'autorité dans les sociétés anarchistes : Comment s'organiser sans hiérarchie ?",
    "59. Les luttes anti-coloniales et le communisme : Quels liens ?",
    "60. La critique du travail salarié : Est-il possible de dépasser cette forme d'organisation ?",
    "61. La nécessité d'un agenda communiste dans la lutte contre le changement climatique.",
    "62. Les stratégies de résistance contre l'oppression : Quelles méthodes utiliser ?",
    "63. La place de la culture populaire dans les mouvements anarchistes : Un moyen d'éveil ?",
    "64. La crise des réfugiés : Quel rôle pour les mouvements de gauche ?",
    "65. Les droits humains : Quel impact sur les luttes communistes et anarchistes ?",
    "66. Les prisons et la répression : Comment les abolir ?",
    "67. Les philosophies anti-autoritaires : Comment se rejoignent-elles ?",
    "68. La question de l'alimentation : Comment une société communiste gérerait-elle l'agriculture ?",
    "69. Les luttes pour l'éducation : Quel modèle pour une société libre ?",
    "70. Les mouvements anarchistes dans l'histoire : Quelles sont les figures marquantes ?",
    "71. La question de l'identité : Comment l'anarchisme aborde-t-il les questions de race et de genre ?",
    "72. Le droit à la ville : Qu'est-ce que cela signifie pour les communistes et les anarchistes ?",
    "73. La critique du développement durable capitaliste : Quelles alternatives ?",
    "74. Les guerres pour la justice sociale : Quel est le rôle de l'armée ?",
    "75. Les solutions pour une santé publique accessible à tous : Une nécessité pour les mouvements de gauche.",
    "76. Le rôle des médias alternatifs dans les luttes sociales : Une voix pour le changement ?",
    "77. Les défis de la transition énergétique : Comment l'anarchisme peut-il contribuer ?",
    "78. La question de la dette : Comment les mouvements de gauche peuvent-ils y faire face ?",
    "79. Les luttes contre les multinationales : Quelles stratégies à adopter ?",
    "80. La solidarité intergénérationnelle dans les luttes sociales : Un enjeu clé ?",
    "81. Les implications de l'anticapitalisme dans la société moderne : Une analyse nécessaire.",
    "82. L'utopie et le réalisme : Comment marier idéaux et pratiques ?",
    "83. Les conséquences de la crise économique : Comment les mouvements de gauche peuvent-ils réagir ?",
    "84. La question de l'accès à la technologie : Un droit pour tous ?",
    "85. Les mouvements de jeunes : Quelle place pour l'anarchisme et le communisme ?",
    "86. Les manifestations et la répression : Comment lutter efficacement ?",
    "87. Les politiques de santé : Quelles alternatives pour une société plus juste ?",
    "88. L'individualisme vs le collectivisme : Quel modèle privilégier ?",
    "89. La création de réseaux alternatifs : Comment bâtir une résistance efficace ?",
    "90. La désobéissance civile comme stratégie de lutte : Quand et comment l'utiliser ?",
    "91. L'impact de la crise climatique sur les inégalités sociales : Quelles solutions ?",
    "92. Les luttes pour la justice raciale : Comment s'inscrivent-elles dans le cadre communiste ?",
    "93. La question des ressources naturelles : Comment les gérer dans une société sans classes ?",
    "94. L'art comme outil de résistance : Comment les artistes s'engagent-ils ?",
    "95. Les droits des travailleurs et la précarité : Comment lutter contre l'exploitation ?",
    "96. La question de l'asile : Comment les mouvements de gauche peuvent-ils soutenir les réfugiés ?",
    "97. La solidarité internationale face à la montée des extrêmes droites : Quelles stratégies ?",
    "98. Les expériences de coopératives : Un modèle à promouvoir ?",
    "99. Le rôle des mouvements de base dans les révolutions : Quels enseignements ?",
    "100. La question de la liberté d'expression dans une société communiste : Quels enjeux ?",
];

// Exemple de fichier pour stocker la configuration
const CONFIG_FILE = 'config.json';

// Chargement de la configuration si elle existe
let config = {};
if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
} else {
    config = { debateChannelId: null };
}

// Commandes pour le bot
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
    cron.schedule('0 */3 * * *', async () => {
        const guild = client.guilds.cache.first();
        if (!guild || !config.debateChannelId) return;

        const sujet = sujetsAutomatiques[Math.floor(Math.random() * sujetsAutomatiques.length)];
        const debatChannel = guild.channels.cache.get(config.debateChannelId);

        if (debatChannel) {
            const message = await debatChannel.send(`Nouveau débat créé automatiquement : **${sujet}**`);
            // Création d'un fil pour le débat sans archivage automatique
            const thread = await message.startThread({
                name: `Débat sur : ${sujet}`,
                autoArchiveDuration: 0, // Pas d'archivage automatique
            });
            console.log(`Débat automatique créé : ${sujet}`);
        }
    });
});

// Événement pour la réception des interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'creerdebat') {
        const sujet = options.getString('sujet');
        const canal = options.getChannel('canal') || interaction.channel;

        const message = await canal.send(`Nouveau débat : **${sujet}**`);
        // Création d'un fil pour le débat sans archivage automatique
        const thread = await message.startThread({
            name: `Débat sur : ${sujet}`,
            autoArchiveDuration: 0, // Pas d'archivage automatique
        });

        await interaction.reply({ content: 'Débat créé avec succès !', ephemeral: true });
    } else if (commandName === 'configurerdebats') {
        const canal = options.getChannel('canal');
        config.debateChannelId = canal.id;

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));
        await interaction.reply({ content: `Le canal pour les débats a été configuré : ${canal.name}`, ephemeral: true });
    }
});

// Middleware pour vérifier les informations d'identification
app.use((req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) return res.sendStatus(401);

    const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    if (user !== username || pass !== password) return res.sendStatus(403);

    next();
});

// Endpoint pour tester si le bot fonctionne
app.get('/status', (req, res) => {
    res.send('Le bot est en ligne !');
});

// Démarrage du serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});

// Connexion du bot à Discord
client.login(token);

