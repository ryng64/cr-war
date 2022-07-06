import fetch, { Headers } from "node-fetch";
import Discord from "discord.js";
import express from "express";
import "dotenv/config";
import { MessageEmbed } from "discord.js";

// const res = require("express/lib/response");
const app = express();
const port = 3000;

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = await client.channels
    .fetch("994093588445143164")
    .then((channel) => channel)
    .catch(console.error);

  const missed = await getMissedWar();
  // const missedDecksMessage = missed.missedDecks
  //   .map((md) => `${md.tag} ${md.name} missed ${4 - md.decksUsedToday}`)
  //   .toString();
  const missedEmbeds = makeEmbed(missed);

  channel.send({
    embeds: [missedEmbeds.missedDeckEmbed, missedEmbeds.missedDaysEmbed],
  });
  // console.log(missed);
  setInterval(() => {
    process.exit(1);
  }, 8000);
});

client.on("messageCreate", (message) => {
  if (message.content == "hi") {
    message.reply("Hello");
  }
});

client.login(process.env.DISCORDTOKEN);

// channel.send("message")
// console.log("channel", channel);

async function getMissedWar() {
  const data = await fetch(
    `https://api.clashroyale.com/v1/clans/%23QYJLG9P9/currentriverrace`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${process.env.CRTOKEN}`,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => error);

  // find all decks used
  const missedDecks = data.clan.participants.filter((participant) => {
    if (participant.decksUsedToday < 4 && participant.decksUsedToday > 0)
      return true;
  });

  const missedDays = data.clan.participants.filter((participant) => {
    if (participant.decksUsedToday == 0) return true;
  });

  return { missedDecks, missedDays };
}

function makeEmbed(missed) {
  const missedDecks = missed.missedDecks.map((md) => {
    return {
      name: `${md.tag} - ${md.name}`,
      value: `missed ${4 - md.decksUsedToday} deck(s)`,
      inline: false,
    };
  });
  const missedDeckEmbed = new MessageEmbed()
    .setColor("#ffeb3b")
    .setTitle("Decks Missed")
    .setDescription("less than 4 war decks were played")
    .addFields(missedDecks)
    .setTimestamp()
    .setFooter({ text: `please make all decks 🙏` });
  const missedDays = missed.missedDays.map((md) => {
    return {
      name: `${md.tag} - ${md.name}`,
      value: `missed ${4 - md.decksUsedToday} decks`,
      inline: false,
    };
  });
  const missedDaysEmbed = new MessageEmbed()
    .setColor("#d32f2f")
    .setTitle("Day Missed")
    .setDescription("Missed all 4 decks")
    .addFields(missedDays)
    .setTimestamp()
    .setFooter({ text: `please make all decks 🙏 Warnings may be issued ⚠` });

  return { missedDeckEmbed, missedDaysEmbed };
}

//Application for Clash Royal stuff
app.get("/", async (req, res) => {
  // res.send("Hello World");
  const data = await fetch(
    `https://api.clashroyale.com/v1/clans/%23QYJLG9P9/currentriverrace`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${process.env.CRTOKEN}`,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => error);

  // find all decks used
  const missedDecks = data.clan.participants.filter((participant) => {
    if (participant.decksUsedToday < 4 && participant.decksUsedToday > 0)
      return true;
  });

  const missedDays = data.clan.participants.filter((participant) => {
    if (participant.decksUsedToday == 0) return true;
  });
  const truant = { missedDecks, missedDays };
  res.json(truant);
  // console.log(data);
});

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
