import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = 3000;
export const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};
app.use(cors(corsOptions));

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
