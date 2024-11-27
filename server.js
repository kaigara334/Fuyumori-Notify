const { Client, Intents } = require('discord.js');
const axios = require('axios');
require('dotenv').config();  // .envファイルを読み込む

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = process.env.DISCORD_BOT_TOKEN;  // .envからBotトークンを取得
const channelId = process.env.CHANNEL_ID;    // .envからチャンネルIDを取得

// ntool APIのURL
const trainInfoUrl = 'https://ntool.online/data/train_all.json';

// 運行情報を取得する関数
async function fetchRailwayInfo() {
    try {
        // ntool APIにリクエストを送信
        const response = await axios.get(trainInfoUrl);

        const data = response.data.data;  // data配列を格納

        // 鉄道運行情報がある場合
        if (data && Array.isArray(data)) {
            // 各路線の情報を取り出して送信
            for (const line of data) {
                const railName = line.railName || '不明';
                const railCode = line.railCode || '不明';
                const companyName = line.companyName || '不明';
                const status = line.status || '不明';
                const info = line.info || '詳細情報なし';
                const lastUpdated = line.lastUpdated || '不明';

                // Embedメッセージを作成
                const embed = {
                    color: 0x0099ff,
                    title: '鉄道運行情報（自動更新）',
                    fields: [
                        { name: '路線名', value: railName, inline: true },
                        { name: '路線コード', value: railCode, inline: true },
                        { name: '運営会社', value: companyName, inline: true },
                        { name: '運行状況', value: status, inline: true },
                        { name: '運行情報', value: info, inline: false },
                        { name: '最終更新', value: lastUpdated, inline: false },
                    ],
                    footer: { text: '提供元: ntool.online' },
                };

                // チャンネルに送信
                const channel = await client.channels.fetch(channelId);
                if (channel) await channel.send({ embeds: [embed] });
            }
        } else {
            console.error('運行情報が見つかりませんでした');
        }
    } catch (error) {
        console.error('運行情報取得エラー:', error);
    }
}

// Bot準備完了時
client.once('ready', () => {
    console.log('Bot is ready!');

    // 1分ごとに運行情報を取得
    setInterval(fetchRailwayInfo, 60000);  // 60000ms = 1分
});

client.login(token);
