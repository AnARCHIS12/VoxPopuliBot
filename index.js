require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, InteractionType } = require('discord.js');
const cron = require('node-cron'); // Importation de node-cron pour la planification
const express = require('express');
const https = require('https');
const fs = require('fs');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID; // Gardez le Client ID pour l'enregistrement des commandes
const domainName = process.env.DOMAIN_NAME; // Nom de domaine dans .env

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

// Liste de sujets automatiques pour les débats
const sujetsAutomatiques = [
    "1. L'avenir du travail à l'ère de l'automatisation : Quel impact l'automatisation a-t-elle sur l'emploi et le marché du travail ?",
    "2. Le revenu de base universel : Est-ce une solution viable pour réduire la pauvreté ?",
    "3. Le rôle des entreprises dans la lutte contre le changement climatique : Les entreprises ont-elles une responsabilité sociale envers l'environnement ?",
    "4. La démocratie directe vs la démocratie représentative : Quelle forme de gouvernement est plus efficace ?",
    "5. Les mouvements sociaux et leur impact sur les politiques publiques : Les mouvements sociaux peuvent-ils changer la loi ?",
    "6. L'impact des réseaux sociaux sur la politique : Les réseaux sociaux renforcent-ils ou affaiblissent-ils la démocratie ?",
    "7. La liberté d'expression vs le discours de haine : Où doit-on tracer la ligne entre la liberté d'expression et la protection contre le discours de haine ?",
    "8. Les droits des minorités dans la société moderne : Comment garantir que les droits des minorités soient respectés ?",
    "9. La transition énergétique vers les énergies renouvelables : Quels sont les défis et les opportunités ?",
    "10. L'impact des déchets plastiques sur les océans : Quelles mesures peuvent être prises pour réduire la pollution plastique ?",
    "11. L'impact de l'intelligence artificielle sur la société : L'IA améliore-t-elle ou nuit-elle à nos vies ?",
    "12. La vie privée à l'ère numérique : Quelles sont les implications de la surveillance en ligne ?",
    "13. L'avenir de la démocratie : Comment les pays peuvent-ils garantir une démocratie véritablement participative ?",
    "14. Le féminisme dans le contexte moderne : Comment le mouvement féministe évolue-t-il face aux défis contemporains ?",
    "15. L'éducation comme outil de changement social : Quel rôle l'éducation peut-elle jouer dans la transformation de la société ?",
    "16. La santé publique et le bien-être : Quels sont les défis actuels en matière de santé publique et comment y répondre ?",
    "17. Les droits des travailleurs à l'ère numérique : Comment protéger les droits des travailleurs dans une économie de plus en plus numérique ?",
    "18. L'éthique des nouvelles technologies : Quelles sont les implications éthiques des avancées technologiques, comme l'IA et la biotechnologie ?",
    "19. L'impact du tourisme sur l'environnement et les cultures locales : Comment concilier développement touristique et protection de l'environnement ?",
    "20. Les inégalités économiques mondiales : Comment aborder les inégalités économiques entre les pays développés et les pays en développement ?",
    "21. Les droits des réfugiés et des migrants : Quelles politiques doivent être mises en place pour protéger les droits des réfugiés et des migrants ?",
    "22. La place des jeunes dans la société : Comment les jeunes peuvent-ils influencer les décisions politiques et sociales aujourd'hui ?"
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
        await rest.put(
            Routes.applicationCommands(clientId),
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

        const sujet = sujetsAutomatiques[Math.floor(Math.random() * sujetsAutomatiques.length)];

        let category = guild.channels.cache.find(c => c.name === 'Débats' && c.type === 4); // Type 4 pour Catégorie
        if (!category) {
            category = await guild.channels.create({
                name: 'Débats',
                type: 4, // Catégorie
            });
        }

        const debatChannel = await guild.channels.create({
            name: `débat-${sujet.split(':')[0]}`, // Utiliser juste le numéro pour le nom du channel
            type: 0, // Salon textuel
            parent: category.id,
        });

        await debatChannel.send(`Nouveau débat créé automatiquement : **${sujet}**`);
        console.log(`Débat automatique créé : ${sujet}`);
    });
});

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    if (interaction.commandName === 'creerdebat') {
        const sujet = interaction.options.getString('sujet');
        const guild = interaction.guild;

        let category = guild.channels.cache.find(c => c.name === 'Débats' && c.type === 4); // Type 4 pour Catégorie
        if (!category) {
            category = await guild.channels.create({
                name: 'Débats',
                type: 4, // Catégorie
            });
        }

        const debatChannel = await guild.channels.create({
            name: `débat-${sujet.split(':')[0]}`, // Utiliser juste le numéro pour le nom du channel
            type: 0, // Salon textuel
            parent: category.id,
        });

        await interaction.reply(`Débat créé : ${debatChannel}`);
    }
});

client.login(token);

