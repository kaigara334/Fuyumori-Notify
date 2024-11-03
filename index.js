const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// サーバーを起動してスリープを防ぐ
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);

// Botのセットアップ
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // ステータスメッセージを「Fuyumori Railwayをプレイ中」に設定
  client.user.setActivity("Fuyumori Railwayをプレイ中", { type: "PLAYING" });

  // コマンドの登録
  const commands = [
    new SlashCommandBuilder()
      .setName("notify_1")
      .setDescription("運行情報を通知します")
      .addStringOption((option) =>
        option
          .setName("date")
          .setDescription("日付を入力してください（例: 1/1）")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("starttime")
          .setDescription("運行開始時間を入力してください（例: 0:00 JST）")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("endtime")
          .setDescription("運行終了時間を入力してください（例: 0:00 JST）")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("remarks")
          .setDescription("備考があれば入力してください（任意）")
          .setRequired(false)
      )
      .toJSON(),
    new SlashCommandBuilder()
      .setName("notify_2")
      .setDescription("運行開始のお知らせをします")
      .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN
  );
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
});

// コマンドの実装
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const roleId = "1296042733991104573"; // 指定されたロールID
  const hasRole = interaction.member.roles.cache.some(
    (role) => role.id === roleId
  );

  if (interaction.commandName === "notify_1") {
    if (!hasRole) {
      // ロールがない場合エラーメッセージを表示
      return await interaction.reply({
        content: `このコマンドを実行するには、指定されたロールが必要です。`,
        ephemeral: true,
      });
    }

    // オプションからデータを取得
    const date = interaction.options.getString("date");
    const startTime = interaction.options.getString("starttime");
    const endTime = interaction.options.getString("endtime");
    const remarks = interaction.options.getString("remarks") || "なし";

    // 埋め込みメッセージを作成
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("冬森鉄道運行情報｜Fuyumori Operation Information")
      .addFields(
        { name: "**日付｜Date**", value: `\`${date}\`` },
        { name: "**運行開始時間（JST）｜Time of starting (JST)**", value: `\`${startTime}\`` },
        { name: "**運行終了時間（JST）｜Time of ending (JST)**", value: `\`${endTime}\`` },
        { name: "**ホスト｜Host**", value: `${interaction.user}` },
        { name: "**備考｜Remarks**", value: `\`${remarks}\`` },
      )
      .addFields({
        name: "**注意点**",
        value: "```運行開始前もマップに入ることはできますが運行は開始されていませんのでご注意ください。\nグループに入っていないと運行には参加できませんのでご注意ください。\n尚、社員への暴言は忠告を三度まで行い、四回目以降は全て審議に掛けさせていただきます。```",
      });

    // メッセージを送信
    await interaction.channel.send({
      content: `<@&1296050288733585478>`, // ロールメンションを指定
      embeds: [embed],
    });

    // コマンドを実行したユーザーに確認メッセージを返信
    await interaction.reply({
      content: "運行情報が送信されました！",
      ephemeral: true,
    });
  }

  if (interaction.commandName === "notify_2") {
    if (!hasRole) {
      // ロールがない場合エラーメッセージを表示
      return await interaction.reply({
        content: `このコマンドを実行するには、指定されたロールが必要です。`,
        ephemeral: true,
      });
    }

    // 埋め込みメッセージを作成
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("冬森鉄道運行情報｜Fuyumori Operation Information")
      .setDescription("運行を開始します")
      .addField("ホスト｜Host", `${interaction.user}`)
      .setURL("https://www.roblox.com/games/18673496983/new-huyumori-map");

    // メッセージを送信
    await interaction.channel.send({
      content: `<@&1296050288733585478>`, // ロールメンションを指定
      embeds: [embed],
    });

    // コマンドを実行したユーザーに確認メッセージを返信
    await interaction.reply({
      content: "運行開始のお知らせが送信されました！",
      ephemeral: true,
    });
  }
});

// Botトークンでログイン
client.login(process.env.DISCORD_BOT_TOKEN);
