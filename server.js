const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const app = express();
const port = 8080;
const API_URL = "https://ntool.online/data/train_all.json";

// GitHub Actionsで設定した環境変数からボットトークンを取得
const BOT_TOKEN = process.env.BOT_TOKEN;

// Discordクライアントのセットアップ
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
  console.log(`${client.user.tag} が起動しました！`);
});

// スラッシュコマンド処理
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "traininfo") {
    try {
      const response = await axios.get(API_URL);
      const data = response.data.data;

      let message = "🚆 **現在の列車運行情報**:\n";
      data.forEach((train) => {
        message += `**路線名**: ${train.railName}\n**状況**: ${train.status}\n**詳細**: ${train.info || "なし"}\n\n`;
      });

      await interaction.reply(message);
    } catch (error) {
      console.error(error);
      await interaction.reply("⚠️ 運行情報の取得に失敗しました。");
    }
  }
});

// Expressでサーバーを起動
app.get("/", (req, res) => {
  res.send("列車運行情報 Discord Bot 稼働中");
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で稼働中`);
});

// Discord Botの起動
client.login(BOT_TOKEN);
