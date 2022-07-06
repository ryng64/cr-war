import fetch, { Headers } from "node-fetch";
import express from "express";
// const res = require("express/lib/response");
const app = express();
const port = 3000;

const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjJkYzczY2MzLTU5OWEtNDg3Mi05MjJiLWQ4M2M4YThlZjA2NiIsImlhdCI6MTY1NjY1OTIxNywic3ViIjoiZGV2ZWxvcGVyLzE3ODc2MDBhLTBiNWYtMDZmNS0wMjQyLTFjZDg1NmI4ZDY2YSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI0Ny4xNDkuMzYuMjAxIl0sInR5cGUiOiJjbGllbnQifV19.VDMXQtd1OnYepiGI8SAmla-Jlafj_Tv6VKE6giJ-mqFpEkPJTkYU7KGZJ3KfAuwt0MPjYPxS2lxrPzQZiB2VNQ";

app.get("/", async (req, res) => {
  // res.send("Hello World");
  const data = await fetch(
    `https://api.clashroyale.com/v1/clans/%23QYJLG9P9/currentriverrace`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => error);
  res.json(data);
  // console.log(data);
});

app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
