import fetch, { Headers } from "node-fetch";
import Discord, { MessageEmbed } from "discord.js";
import "dotenv/config";
import crapi from "./crapi.js";

const clanTag = "QYJLG9P9";
const botChannelID = "994007661290987540";
const testChannel = "994093588445143164";

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const channel = await client.channels
    //fetch different channel id for appropriate channel.
    .fetch(botChannelID)
    .then((channel) => channel)
    .catch(console.error);
  if (message.content == "!top6") {
    console.log("top6 running");
    const top6 = await getTop6();
    const top6Message = makeTop6Embed(top6);
    channel.send({
      embeds: [top6Message],
    });
  } else if (message.content == "!riverrace") {
    console.log("riverrace running");
    const riverRaceLog = await getLatestRiverRaceLog();
    const riverMessage = makeRiverLogEmbed(riverRaceLog);
    channel.send({
      embeds: [riverMessage],
    });
    // message.reply("River Race Season Score: Todo");
  } else if (message.content == "!misseddecks") {
    console.log("Missed Wars ran");
    const missed = await getMissedWar();
    const missedEmbeds = makeMissedEmbed(missed);
    channel.send({
      embeds: [missedEmbeds.missedDeckEmbed, missedEmbeds.missedDaysEmbed],
    });
  }
  // MessageHandler(message);
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

  //get active members
  const activeMembers = await fetch(
    `https://api.clashroyale.com/v1/clans/%23${clanTag}`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${process.env.CRTOKEN}`,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => data.memberList.map((member) => member.tag))
    .catch((error) => error);

  // find all decks used
  const missedDecks = data.clan.participants.filter((participant) => {
    if (
      participant.decksUsedToday < 4 &&
      participant.decksUsedToday > 0 &&
      activeMembers.includes(participant.tag)
    )
      return true;
  });

  const missedDays = data.clan.participants.filter((participant) => {
    if (
      participant.decksUsedToday == 0 &&
      activeMembers.includes(participant.tag)
    )
      return true;
  });

  return { missedDecks, missedDays };
}

//creates an discord embed message for both missed Decks and missed Days
function makeMissedEmbed(missed) {
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
    .setThumbnail(
      "https://static.wikia.nocookie.net/clashroyale/images/9/9f/War_Shield.png/revision/latest/scale-to-width-down/250?cb=20180425130200"
    )
    .setDescription("less than 4 war decks were played")
    .addFields(missedDecks)
    .setTimestamp()
    .setFooter({
      text: `please make all decks ????. Other commands : !top6 !riverrace !misseddecks`,
    });
  const missedDays = missed.missedDays.map((md) => {
    return {
      name: `${md.tag} - ${md.name}`,
      value: `missed 4 decks`,
      inline: false,
    };
  });
  const missedDaysEmbed = new MessageEmbed()
    .setColor("#d32f2f")
    .setTitle("Day Missed")
    .setThumbnail(
      "https://static.wikia.nocookie.net/clashroyale/images/9/9f/War_Shield.png/revision/latest/scale-to-width-down/250?cb=20180425130200"
    )
    .setDescription("Missed all 4 decks")
    .addFields(missedDays)
    .setTimestamp()
    .setFooter({
      text: `please make all decks ???? Warnings may be issued ???. Other commands : !top6 !riverrace !misseddecks`,
    });

  return { missedDeckEmbed, missedDaysEmbed };
}

function makeRiverLogEmbed(riverLog) {
  const scores = riverLog.playerTotal.map((log) => {
    return {
      name: `${log.name}`,
      value: `fame: ${log.total}`,
      inline: false,
    };
  });
  const scoresEmbed = new MessageEmbed()
    .setColor("#43a047")
    .setTitle(`River Race Scores Season ${riverLog.latestSeasonID}`)
    .setThumbnail(
      "https://static.wikia.nocookie.net/clashroyale/images/c/cd/Trophy.png/revision/latest?cb=20160107164159"
    )
    .setDescription("Clan Scores of top 25*")
    .addFields(scores)
    .setTimestamp()
    .setFooter({
      text: `Keep it up! ???? *discord limited to 25 per message. Other commands : !top6 !riverrace !misseddecks`,
    });

  return scoresEmbed;
}

function makeTop6Embed(top6) {
  // console.log(top6);
  const scores = top6.top6.map((log) => {
    return {
      name: `${log.name}`,
      value: `fame: ${log.total}`,
      inline: false,
    };
  });
  const scoresEmbed = new MessageEmbed()
    .setColor("#6a1b9a")
    .setTitle(`Top 6 Season ${top6.seasonID}`)
    .setThumbnail(
      "https://static.wikia.nocookie.net/clashroyale/images/c/cd/Trophy.png/revision/latest?cb=20160107164159"
    )
    .setDescription("Top 6 in Clan Wars this season")
    .addFields(scores)
    .setTimestamp()
    .setFooter({
      text: `Great Job! ????. Other commands : !top6 !riverrace !misseddecks`,
    });

  return scoresEmbed;
}

async function getLatestRiverRaceLog() {
  //View the json from a web browser at root
  const riverracelog = await crapi.getRiverRaceLog();
  // console.log("getRiverRace", riverracelog);
  //get season ID
  const uniqueSeasonIDs = [
    ...new Set(riverracelog.items.map((rrl) => rrl.seasonId)),
  ];
  // console.log(uniqueSeasonIDs);
  //sum up rankings
  //get latest season ID if multiple
  let latestSeasonID = Math.max(...uniqueSeasonIDs);

  //get just the lastest season logs
  const latestSeasons = riverracelog.items.filter(
    (rrl) => rrl.seasonId === latestSeasonID
  );

  //find the standings for the latest season
  const latestStandings = latestSeasons.map((ls) => ls.standings).flat();

  //filter down to just my clan
  const myClanStandings = latestStandings.filter(
    (ls) => ls.clan.tag == `#${clanTag}`
  );

  //get all the partcipants in the logs for the season.
  const myClanParticipants = myClanStandings
    .map((mcs) => mcs.clan.participants)
    .flat();

  //group the tags together to organize players to make summing up scores easier
  let uniquePlayerTags = [...new Set(myClanParticipants.map((mcp) => mcp.tag))];
  const playerGrouping = uniquePlayerTags.map((playerTag) => {
    const group = myClanParticipants.filter((mcp) => mcp.tag == playerTag);
    return group;
  });

  //Sum up all scores and sort by highest score to lowest.
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

  return { latestSeasonID, playerTotal };
}

async function getTop6() {
  const riverRaceLog = await getLatestRiverRaceLog();
  const seasonID = riverRaceLog.latestSeasonID;
  const top6 = riverRaceLog.playerTotal.splice(0, 6);
  return { seasonID, top6 };
}
