const Discord = require("discord.js");
require("dotenv").config();
const access = process.env.TOKEN;
const puppeteer = require('puppeteer');
var fs = require('fs');
var request = require('request');
const axios = require("axios");
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})


client.on("messageCreate", (message) => {

    function resolveAfter2Seconds() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, 2000);
        });
    }

    async function scrapeChannel(urlOG, urlState) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(urlOG, { waitUntil: 'networkidle2' });

        try {
            if (urlState == 1) {
                const results = await page.$$eval('article div[lang]', (tweets) => tweets.map((tweet) => tweet.textContent));
                var sss = results[0].toString();
                message.reply(sss);
                videoOutput(urlOG);

            }

            if (urlState == 2) {

                const [el] = await page.$x('//*[@id="overlay"]/ytd-reel-player-header-renderer/h2/yt-formatted-string')
                const text = await el.getProperty('textContent');
                var name = await text.jsonValue();
                message.reply(name);
                const result = await resolveAfter2Seconds();
                videoOutput(urlOG);

            }
            if (urlState == 3) {
                const [el] = await page.$x('//*[@id="app"]/div[2]/div[2]/div[1]/div[3]/div[1]/div[1]/div[2]/div/span[1]')
                const text = await el.getProperty('textContent');
                const name = await text.jsonValue();

                const [el2] = await page.$x('//*[@id="app"]/div[2]/div[2]/div[1]/div[3]/div[1]/div[2]/div/a[2]/span[1]')
                const text2 = await el2.getProperty('textContent');
                const name2 = await text2.jsonValue();

                browser.close();
                if (name === " ") {
                    message.reply("Untitled " + 'posted by ' + name2);
                    videoOutput2(urlOG);
                }
                else {
                    message.reply("'" + name + "'" + ' posted by ' + name2);
                    videoOutput2(urlOG);
                }
            }
            browser.close();

        }
        catch {
            message.reply("Invalid video sorry :(")
        }
    }

    async function videoOutput(urlOG) {
        console.log("this is video output functions")
        const options = {
            method: 'GET',
            url: 'https://socialdownloader.p.rapidapi.com/api/youtube/video',
            params: { video_link: urlOG },
            headers: {
                'X-RapidAPI-Key': process.env.API_TOKEN,
                'X-RapidAPI-Host': 'socialdownloader.p.rapidapi.com'
            }
        };
        const filePath = './tempStore/doodless.mp4';
        axios.request(options).then(function (response) {
            let x = response.data;
            let downloadURL = JSON.stringify(x['body']['url'][0]['url']);
            let downloadURL2 = downloadURL.replace('"', '');
            let downloadURL3 = downloadURL2.slice(0, downloadURL2.length - 1)

            try {
                var stream = request(downloadURL3).pipe(fs.createWriteStream('tempStore/doodless.mp4'));
                console.log(downloadURL3);
                stream.on('finish', function () {
                    console.log("done");
                    message.channel.send({
                        files: ['./tempStore/doodless.mp4']
                    });

                });

            } catch (err) {
                console.log("Download failed: " + err);
            }
        }).catch(function (error) {
            console.error(error);
        });
    }
    async function videoOutput2(urlOG) {
        const axios = require("axios");

        const options = {
            method: 'GET',
            url: 'https://socialdownloader.p.rapidapi.com/api/tik-tok/video',
            params: {
                video_link: urlOG
            },
            headers: {
                'X-RapidAPI-Key': process.env.API_TOKEN,
                'X-RapidAPI-Host': 'socialdownloader.p.rapidapi.com'
            }
        };

        axios.request(options).then(function (response) {
            let x = response.data;
            let downloadURL = JSON.stringify(x['body']['info']['itemInfo']['itemStruct']['video']['downloadAddr']);
            let downloadURL2 = downloadURL.replace('"', '');
            let downloadURL3 = downloadURL2.slice(0, downloadURL2.length - 1)
            console.log(downloadURL3);

            try {
                var stream = request(downloadURL3).pipe(fs.createWriteStream('tempStore/doodless.mp4'));
                console.log(downloadURL3);
                stream.on('finish', function () {
                    console.log("done");
                    message.channel.send({
                        files: ['./tempStore/doodless.mp4']
                    });

                });

            } catch (err) {
                console.log("Download failed: " + err);
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    if (message.author.bot) return false;
    if (message.content.includes("https://twitter.com")) {
        let urlOG = message.content;
        let urlState = 1;
        console.log(urlOG + " url state is " + urlState);
        scrapeChannel(urlOG, urlState);

    }
    else if (message.content.includes("https://www.youtube.com/shorts/")) {
        let urlOG = message.content;
        let urlState = 2;

        console.log(urlOG + " url state is " + urlState);
        scrapeChannel(urlOG, urlState);

    }
    else if (message.content.includes("https://www.tiktok.com/")) {
        let urlOG = message.content;
        let urlState = 3;

        console.log(urlOG + " url state is " + urlState);
        scrapeChannel(urlOG, urlState)

    }
})
client.login(access)