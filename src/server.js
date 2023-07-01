const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const router = require("./router");
const errorHandler = require("./endwares/errorHandler");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*" }));

router(app);

app.use(errorHandler);

module.exports = app;