// bot.js - Bot Telegram untuk Tetris Rewards

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// === CONFIG ===
const token = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'https://sirait.gamer.gd/api.php';

// === INIT ===
const app = express();
app.use(express.json());

// === BOT ===
const bot = new TelegramBot(token, { polling: true });

// === ROUTES ===
app.get('/', (req, res) => {
    res.send('🎮 Tetris Bot is running on Render!');
});

app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// ==================== COMMANDS ====================

// /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    try {
        const response = await axios.get(`${API_URL}`, {
            params: {
                action: 'register',
                telegram_id: chatId,
                username: user.username || '',
                first_name: user.first_name || '',
                last_name: user.last_name || ''
            }
        });
        
        if (response.data.success) {
            const u = response.data.user;
            const text = `🎮 <b>Selamat datang di Tetris Rewards!</b>\n\n` +
                        `💰 Balance: <b>${u.balance}</b> coins\n` +
                        `🏆 High Score: <b>${u.high_score}</b>\n` +
                        `🎮 Games: <b>${u.total_games}</b>\n\n` +
                        `📌 <b>Perintah:</b>\n` +
                        `/play - Main Tetris 🎮\n` +
                        `/balance - Cek balance 💰\n` +
                        `/watchad - Tonton iklan 📺\n` +
                        `/referral - Ajak teman 👥\n` +
                        `/leaderboard - Top player 🏆\n` +
                        `/withdraw [jumlah] - Tarik saldo 💳\n` +
                        `/help - Bantuan ℹ️`;
            
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error: ' + error.message);
    }
});

// /balance
bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get(`${API_URL}`, {
            params: {
                action: 'get_user',
                telegram_id: chatId
            }
        });
        
        if (response.data.success) {
            const u = response.data.user;
            const text = `💰 <b>Balance Anda</b>\n\n` +
                        `💎 Coins: <b>${u.balance}</b>\n` +
                        `🏆 High Score: <b>${u.high_score}</b>\n` +
                        `🎮 Games: <b>${u.total_games}</b>\n` +
                        `📺 Iklan: <b>${u.ads_watched}</b>`;
            
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error: ' + error.message);
    }
});

// /watchad
bot.onText(/\/watchad/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get(`${API_URL}`, {
            params: {
                action: 'watch_ad',
                telegram_id: chatId
            }
        });
        
        if (response.data.success) {
            const text = `📺 <b>Iklan Ditonton!</b>\n\n` +
                        `🎁 Reward: <b>+${response.data.reward}</b> coins\n` +
                        `💰 Balance: <b>${response.data.balance}</b> coins`;
            
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } else {
            bot.sendMessage(chatId, '❌ ' + (response.data.error || 'Gagal menonton iklan'));
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error: ' + error.message);
    }
});

// /leaderboard
bot.onText(/\/leaderboard/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get(`${API_URL}`, {
            params: {
                action: 'leaderboard',
                limit: 10
            }
        });
        
        if (response.data.success && response.data.players.length > 0) {
            let text = `🏆 <b>TOP 10 PLAYER</b>\n\n`;
            response.data.players.forEach((player, index) => {
                const name = player.username || player.first_name || 'Anonymous';
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank + '.';
                text += `${medal} ${name} - <b>${player.high_score}</b>\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } else {
            bot.sendMessage(chatId, '🏆 Belum ada player!');
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error: ' + error.message);
    }
});

// /referral
bot.onText(/\/referral/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get(`${API_URL}`, {
            params: {
                action: 'get_referral',
                telegram_id: chatId
            }
        });
        
        if (response.data.success) {
            const code = response.data.referral_code;
            const text = `👥 <b>Program Referral</b>\n\n` +
                        `🔗 Kode Referral Anda:\n` +
                        `<code>${code}</code>\n\n` +
                        `🎁 Bagikan link ini:\n` +
                        `<code>https://t.me/YourBot?start=ref_${code}</code>\n\n` +
                        `💡 Dapat 50 coins setiap teman join!`;
            
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error: ' + error.message);
    }
});

// /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const text = `ℹ️ <b>Bantuan & Perintah</b>\n\n` +
                `🎮 /play - Main Tetris\n` +
                `💰 /balance - Cek balance\n` +
                `📺 /watchad - Tonton iklan\n` +
                `👥 /referral - Ajak teman\n` +
                `🏆 /leaderboard - Top player\n` +
                `💳 /withdraw [jumlah] - Tarik saldo\n` +
                `❓ /help - Bantuan`;
    
    bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
});

// ==================== DEFAULT ====================

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    
    if (!text.startsWith('/')) {
        bot.sendMessage(chatId, '❓ Perintah tidak dikenal. Ketik /help untuk bantuan.');
    }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Bot running on port ${PORT}`);
});

console.log('🤖 Tetris Bot started!');
