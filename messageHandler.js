import fetch, { Headers } from "node-fetch";
import "dotenv/config";

export default function MessageHandler(message) {
  const definitions = {
    "!warseason": () => {
      message.reply("season results:... TODO");
    },
  };
  const content = message.content;
  if (definitions[content] === undefined) return;
  definitions[content]();
  console.log(definitions[content]);
}
