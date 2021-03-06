const GModule = require("../GModule");
const Globals = require("../../Globals");
const Translator = require("../../Translator/Translator");
const Emojis = require("../../Drawings/Emojis");
const TextDrawing = require("../../Drawings/TextDrawings");
const Achievements = require("../../Drawings/Achievements");
const LeaderboardPvP = require("../../Drawings/Leaderboard/LeaderboardPvP");
const LeaderboardLevel = require("../../Drawings/Leaderboard/LeaderboardLevel");
const LeaderboardGold = require("../../Drawings/Leaderboard/LeaderboardGold");
const LeaderboardCraftLevel = require("../../Drawings/Leaderboard/LeaderboardCraftLevel");
const Discord = require("discord.js");

class CharacterModule extends GModule {
    constructor() {
        super();
        this.commands = ["reset", "leaderboard", "info", "up", "achievements"];
        this.startLoading("Character");
        this.init();
        this.endLoading("Character");

        this.authorizedAttributes = ["str", "int", "con", "dex", "cha", "will", "luck", "wis", "per"];
    }

    async run(message, command, args) {
        let msg = "";
        let axios = Globals.connectedUsers[message.author.id].getAxios();
        let data;
        let tempMsg;

        switch (command) {

            case "reset":
                if (args[0] === "confirm") {
                    data = await axios.get("/game/character/reset");
                    data = data.data;
                    if (data.error != null) {
                        msg = data.error;
                    } else {
                        msg = data.success;
                    }
                    break;
                } else {
                    data = await axios.get("/game/character/info");
                    data = data.data;
                    if (data.error != null) {
                        msg = data.error;
                    } else {
                        let lang = data.lang;
                        let embedMessage = new Discord.RichEmbed()
                            .setColor([0, 255, 0])
                            .setAuthor(Emojis.getString("scroll") + " " + Translator.getString(data.lang, "character", "reset_price_title"))
                            .addField(Emojis.getString("money_bag") + " " + Translator.getString(data.lang, "travel", "gold_price_title"), Translator.getString(data.lang, "travel", "gold_price_body", [data.resetValue]), true)
                            .addField(Emojis.getString("q_mark") + " " + Translator.getString(data.lang, "character", "sure_to_reset_title"), Translator.getString(data.lang, "travel", "sure_to_travel_body", [Emojis.getString("vmark"), Emojis.getString("xmark")]));

                        let checkEmoji = Emojis.getID("vmark");
                        let xmarkEmoji = Emojis.getID("xmark");

                        tempMsg = await message.channel.send(embedMessage).catch(() => null);

                        Promise.all([
                            tempMsg.react(checkEmoji),
                            tempMsg.react(xmarkEmoji)
                        ]).catch(() => null);

                        const filter = (reaction, user) => {
                            return [checkEmoji, xmarkEmoji].includes(reaction.emoji.id) && user.id === message.author.id;
                        };


                        const collected = await tempMsg.awaitReactions(filter, {
                            max: 1,
                            time: 25000
                        });
                        const reaction = collected.first();
                        if (reaction != null) {
                            switch (reaction.emoji.id) {
                                case checkEmoji:
                                    data = await axios.get("/game/character/reset");
                                    data = data.data;
                                    if (data.error != null) {
                                        msg = data.error;
                                    } else {
                                        msg = data.success;
                                    }
                                    break;

                                case xmarkEmoji:
                                    msg = Translator.getString(data.lang, "character", "reset_cancel");
                                    break;
                            }
                        }
                        tempMsg.delete().catch(() => null);
                    }
                }


                break;

            case "leaderboard":
                switch (args[0]) {
                    case "level":
                        data = await axios.get("/game/character/leaderboard/level");
                        break;
                    case "gold":
                        data = await axios.get("/game/character/leaderboard/gold");
                        break;
                    case "craftlevel":
                        data = await axios.get("/game/character/leaderboard/craft/level");
                        break;
                    default:
                    case "arena":
                        data = await axios.get("/game/character/leaderboard/arena");
                        break;
                }
                data = data.data;
                let leaderboard;
                if (data.error == null) {
                    switch (args[0]) {
                        case "level":
                            leaderboard = new LeaderboardLevel(data);
                            break;
                        case "gold":
                            leaderboard = new LeaderboardGold(data);
                            break;
                        case "craftlevel":
                            leaderboard = new LeaderboardCraftLevel(data);
                            break;
                        default:
                        case "arena":
                            leaderboard = new LeaderboardPvP(data);
                            break;
                    }
                    msg = leaderboard.draw();
                } else {
                    msg = data.error;
                }
                break;

            case "info":
                data = await axios.get("/game/character/info");
                data = data.data;
                if (data.error != null) {
                    msg = data.error;
                } else {
                    msg = TextDrawing.userInfoPanel(data);
                }
                break;

            case "up":
                data = await axios.post("/game/character/up", {
                    attr: args[0],
                    number: args[1],
                });
                data = data.data;
                if (data.error == null) {
                    msg = Translator.getString(data.lang, "character", "attribute_up_to", [this.getToStrShort(args[0]), data.value]) +
                        ". " + (data.pointsLeft > 1 ?
                            Translator.getString(data.lang, "character", "attribute_x_points_available_plural", [data.pointsLeft]) :
                            Translator.getString(data.lang, "character", "attribute_x_points_available", [data.pointsLeft]));
                } else {
                    msg = data.error;
                }
                break;
            case "achievements":
                data = await axios.get("/game/character/achievements/" + args[0]);
                data = data.data;

                if (data.error == null) {
                    msg = Achievements.toString(data);
                } else {
                    msg = data.error;
                }
        }

        this.sendMessage(message, msg);
    }


}

module.exports = CharacterModule;