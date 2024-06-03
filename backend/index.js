require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { v4 } = require("uuid");
const { createClient } = require("redis");
const dbConfig = require("./src/config/dbConfig");
const AppError = require("./src/utils/appError");
const globalErrorHandlers = require("./src/controllers/errorControllers");
const userRoutes = require("./src/routes/userRoutes");
const app = express();
app.use(express.json());

async function startServer() {
  const oneDay = 24 * 60 * 60 * 1000;
  app.use(cors());
  try {
    const pool = await dbConfig.connect();

    const redis_client = createClient();
    redis_client.connect();
    redis_client.on("connect", () => console.log("Connected to redis"));
    const redis_store = new RedisStore({ client: redis_client, prefix: "" });
    app.use((req, res, next) => {
      req.pool = pool;
      next();
    });
    app.use(
      session({
        store: redis_store,
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        genid: () => v4(),
        resave: false,
        rolling: true,
        unset: "destroy",
        cookie: {
          httpOnly: true,
          secure: false,
          maxAge: oneDay,
          domain: "localhost",
        },
      })
    );

    app.use("/", userRoutes);
    app.all("*", (req, res, next) => {
      next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });
    app.use(globalErrorHandlers);
    const port = process.env.PORT || 3003;
    app.listen(port, () => console.log(`app running on port ${port}`));
  } catch (error) {
    console.log(error);
  }
}

startServer();
