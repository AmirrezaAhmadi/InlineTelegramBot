const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require("config");
const path = require('path');
const Gif = require("./models/db");
const app = express();
const token = config.get("token");
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async(msg) => {
  let welcome = `سلام برای افزودن گیف یا ویدئو روی دکمه"افزودن گیف یا ویدئو" کلیک کنید`+"\n";
  bot.sendMessage(msg.chat.id, welcome, {
  "reply_markup": {
    "resize_keyboard": true,
      "keyboard": [["افزودن گیف یا ویدئو"]]
      }
  });
  const userId = msg.from.id;
  let userFirstName = msg.from.first_name;
  let userLastName = msg.from.last_name;
  let userUsername = msg.from.username;
  // console.log("آیدی: " + userId);
  // console.log("نام: " + userFirstName);
  // console.log("نام خانوادگی: " + userLastName);
  // console.log("یوزرنیم: " + userUsername);

  //Your Telegram Number Id
  let yourId = ""; 
  let message = " این کاربر ربات را استارت زد"+"\n" +
                "آیدی: " + userId + "\n" +
                "نام: " + userFirstName + "\n" +
                "نام خانوادگی: " + userLastName + "\n" +
                "یوزرنیم: @" + userUsername;
  bot.sendMessage(yourId, message);
  });
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if(messageText === "/start") {
    return;
  }
  else if (messageText === "افزودن گیف یا ویدئو") {
    const allowedUserIds = config.get("telegramId");
    const userId = msg.from.id;
    if (!allowedUserIds.includes(userId)) {
      bot.sendMessage(chatId, "شما اجازه‌ی اضافه کردن گیف را ندارید.");
      return;
    }
    bot.sendMessage(chatId, "لطفا گیف را ارسال کنید.", {
      "reply_markup": {
        "resize_keyboard": true,
        "keyboard": [["کنسل"]]
      }});
      
    bot.once('message',(titleMsg) => {
      const gif = titleMsg.video || titleMsg.document;
      if (gif) {
        const gifFileId = gif.file_id;
        bot.sendMessage(chatId, "لطفا تایتل مورد نظر را وارد کنید.",{
          "reply_markup": {
            "resize_keyboard": true,
            "keyboard": [["کنسل"]]
          }});
        bot.once('message', async(titleMsg) => {
          const title = titleMsg.text;
          if (title !== 'کنسل') {
          // ذخیره گیف و تایتل در آرایه یا پایگاه داده
          const newData = { gif: gifFileId, title: title };
          bot.sendMessage(chatId, "اطلاعات با موفقیت ذخیره شد.",{
            "reply_markup": {
              "resize_keyboard": true,
              "keyboard": [["افزودن گیف یا ویدئو"]]
            }});
          await saveData(newData);
          }
      });
      }
      async function saveData(newData) {
        try {
            const dataInfo = new Gif({
                url: newData.gif,
                title: newData.title,
            });
            const result = await dataInfo.save();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    }
    });
  }
  else if (messageText === "کنسل") {
    const mainKeyboard = {
      "resize_keyboard": true,
      "keyboard": [["افزودن گیف یا ویدئو"]]
    };
    bot.sendMessage(chatId, "عملیات لغو شد.", {
      "reply_markup": {
        ...mainKeyboard // بازگشت به کیبورد اصلی
      }
    });
  }
  else if (!messageText){
    // bot.sendMessage(chatId, "این فایل گیف یا ویدیو هست");
    return;
  }
});

//Download Gif And Video
// const DOWNLOAD_DIR = __dirname + '/DataBase/gif/';
// console.log(DOWNLOAD_DIR);
// bot.on('animation', async (msg) => {
//   try {
//       const fileId = msg.animation.file_id;
//       const fileInfo = await bot.getFile(fileId);
//       const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
//       // const fileName = msg.video.file_name;
//       // const fileName = `${fileId}.gif`;
//       const fileName = `${msg.animation.file_name}.gif`;
      // دانلود فایل و ذخیره در دایرکتوری مورد نظر
//       const response = await axios.get(fileUrl, { responseType: 'stream' });
//       const filePath = `${DOWNLOAD_DIR}${fileName}`;
//       const fileStream = fs.createWriteStream(filePath);
//       response.data.pipe(fileStream);

//       response.data.on('end', () => {
//           bot.sendMessage(msg.chat.id, `فایل ${fileName} با موفقیت دانلود شد و در ${DOWNLOAD_DIR} ذخیره شد.`);
//       });
//   } catch (error) {
//       bot.sendMessage(msg.chat.id, `خطا در دانلود فایل: ${error.message}`);
//   }
// });


bot.on('inline_query', async (msg) => {
  // const dataInfo = await Gif.findOne({});
  // const arrayInfo = [dataInfo]
  // const results = [];
  
  // arrayInfo.forEach(arrayInfo => {
  //   const result = {
  //     id: arrayInfo.id,
  //     type: 'video',
  //     mime_type: "video/mp4",
  //     video_url: arrayInfo.url,
  //     thumb_url: arrayInfo.url,
  //     title: arrayInfo.title
  //   };

  //   results.push(result);
  // });
  // bot.answerInlineQuery(msg.id, results);


  // try {
  //   const gifItems = await Gif.find({});
  //   const results = gifItems.map(item => ({
  //     id: item._id.toString(),
  //     type: 'video',
  //     mime_type: "video/mp4",
  //     video_url: item.url,
  //     thumb_url: item.url,
  //     title: item.title
  //   }));

  //   bot.answerInlineQuery(msg.id, results);
  // } catch (error) {
  //   console.error("Error fetching gifs:", error);
  // }


  try {
    const searchQuery = msg.query.trim(); // کلمه‌ی جستجوی کاربر
    let gifItems;

    if (searchQuery) {
      //اگر کلمه‌ی جستجو وجود داشته باشد، فیلتر کن
      gifItems = await Gif.find({ title: { $regex: searchQuery, $options: 'i' } }); // $options: 'i' برای جستجوی حساس به کوچک و بزرگی نبودن حروف
    } else {
      // اگر کلمه‌ی جستجو وجود نداشته باشد، تمام موارد را بیاور
      gifItems = await Gif.find({});
    }

    const results = gifItems.map(item => ({
      id: item._id.toString(),
      type: 'video',
      mime_type: "video/mp4",
      video_url: item.url,
      thumb_url: item.url,
      title: item.title
    }));

    bot.answerInlineQuery(msg.id, results);
  } catch (error) {
    console.error("Error fetching gifs:", error);
  }
});

app.listen(config.get("port"), () => {
  console.log(`Listen on PORT: ${config.get("port")}`);
});
