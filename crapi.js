import fetch, { Headers } from "node-fetch";
import "dotenv/config";

async function getCurrentRiverRace() {
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

  return data;
}

const crapi = {
  getCurrentRiverRace: async () => {
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

    return data;
  },
  getRiverRaceLog: async () => {
    const data = await fetch(
      `https://api.clashroyale.com/v1/clans/%23QYJLG9P9/riverracelog?limit=5`,
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

    return data;
  },
};
export default crapi;
