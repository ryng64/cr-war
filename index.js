import fetch, { Headers } from "node-fetch";
import Discord, { MessageEmbed } from "discord.js";
import express from "express";
import "dotenv/config";
import cron from "node-cron";
import crapi from "./crapi.js";
import MessageHandler from "./messageHandler.js";

// const res = require("express/lib/response");
const app = express();
const port = 3000;
const clanTag = "QYJLG9P9";

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = await client.channels
    //fetch different channel id for appropriate channel.
    .fetch("994093588445143164")
    .then((channel) => channel)
    .catch(console.error);

  const missed = await getMissedWar();
  const missedEmbeds = makeEmbed(missed);

  cron.schedule(
    "45 2 * * 5,6,7,1",
    () => {
      channel.send({
        embeds: [missedEmbeds.missedDeckEmbed, missedEmbeds.missedDaysEmbed],
      });
    },
    {
      scheduled: true,
      timezone: "America/Los_Angeles",
    }
  );

  // console.log(missed);
  // setInterval(() => {
  //   process.exit(1);
  // }, 8000);
});

client.on("messageCreate", (message) => {
  // if (message.content == "hi") {
  //   message.reply("Hello");
  // }
  MessageHandler(message);
});

client.login(process.env.DISCORDTOKEN);

// channel.send("message")
// console.log("channel", channel);

async function getMissedWar() {
  const data = await fetch(
    `https://api.clashroyale.com/v1/clans/%23${clanTag}/currentriverrace`,
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

//creates an discord embed message for both missed Decks and missed Days
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
  //View the json from a web browser at root
  const riverracelog = await crapi.getRiverRaceLog();

  //get season ID
  const uniqueSeasonIDs = [
    ...new Set(riverracelog.items.map((rrl) => rrl.seasonId)),
  ];
  // console.log(uniqueSeasonIDs);
  //sum up rankings
  let latestSeasonID = Math.max(...uniqueSeasonIDs);
  const latestSeasons = riverracelog.items.filter(
    (rrl) => rrl.seasonId === latestSeasonID
  );
  const latestStandings = latestSeasons.map((ls) => ls.standings).flat();
  const myClanStandings = latestStandings.filter(
    (ls) => ls.clan.tag == `#${clanTag}`
  );
  const myClanParticipants = myClanStandings
    .map((mcs) => mcs.clan.participants)
    .flat();

  let uniquePlayerTags = [...new Set(myClanParticipants.map((mcp) => mcp.tag))];
  const playerGrouping = uniquePlayerTags.map((playerTag) => {
    const group = myClanParticipants.filter((mcp) => mcp.tag == playerTag);
    return group;
  });
  const playerTotal = playerGrouping
    .map((pg) => {
      let initialValue = 0;
      const name = pg[0].name;
      const total = pg.reduce((prev, curr) => {
        return prev + curr.fame;
      }, initialValue);
      return { name, total };
    })
    .sort((a, b) => {
      if (a.total > b.total) return -1;
      else if (a.total < b.total) return 1;
      else return 0;
    });
  //
  res.json({ playerTotal });
  // res.json({ playerTotal, playerGrouping, myClanParticipants });
});

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
