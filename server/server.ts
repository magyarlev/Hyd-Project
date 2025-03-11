import cors from "cors";
import express from "express";
import api from "./api/api";

const app = express();
const port = 3000;
const db = "mongodb://localhost:27017/how-is-your-day";

const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", api);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
