require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

const Arweave = require("arweave");
const Community = require("community-js").default;

let cachedLength = 0;
let community = new Community(
  new Arweave({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
  })
);

client.on("ready", async () => {
  const channel = client.channels.cache.find(
    (channel) => channel.name === process.env.CHANNEL
  );

  await community.setCommunityTx(process.env.COMMUNITY);

  setInterval(async () => await checkVotes(community, cachedLength, channel), 1000 * 60);
});

async function checkVotes(channel) {
  let votes = (await community.getState(false)).votes;

  if (votes.length > cachedLength) {
    for (let i = cachedLength; i < votes.length; i++) {
      const vote = votes[i];
      await channel.send(
        new Discord.MessageEmbed()
          .setTitle(":pencil:  New Vote!")
          .setDescription(vote.note)
      );
    }
    cachedLength = votes.length;
  }
}

client.login(process.env.BOT_TOKEN);
