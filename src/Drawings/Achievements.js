const Translator = require("../Translator/Translator");
const Discord = require("discord.js");
const Emojis = require("../Drawings/Emojis");


class Achievements {
    toString(data) {
        let rembed = new Discord.RichEmbed()
            .setColor([0, 255, 0])
            .setAuthor(Translator.getString(data.lang, "character", "achievement_title", [data.totalAchievementsEarned, data.totalAchievements, data.totalPoints]) + " | " + Translator.getString(data.lang, "general", "page_out_of_x", [data.page, data.maxPage]));

        for (let achievement of data.achievements) {
            rembed.addField(Translator.getString(data.lang, "character", "achievement_name", [achievement.nameAchievement, achievement.points]) + " - " + (achievement.earned == 1 ? Translator.getString(data.lang, "character", "achievement_earned_word") + " " + Emojis.getString("g_vmark") : Emojis.getString("g_xmark")), (achievement.descAchievement != null ? "```" + achievement.descAchievement + "```" : "```" + Translator.getString(data.lang, "character", "no_desc") + "```"));
        }
        return rembed;
    }

}

module.exports = new Achievements();