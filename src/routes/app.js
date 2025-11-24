const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/voter-login", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "voter-login.html")
  );
});

router.get("/voting-instructions", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "..",
      "..",
      "public",
      "views",
      "voting-instructions.html"
    )
  );
});

router.get("/voting", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "voting.html")
  );
});

router.get("/vote-confirmation", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "..",
      "..",
      "public",
      "views",
      "vote-confirmation.html"
    )
  );
});

router.get("/vote-success", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "vote-success.html")
  );
});

module.exports = router;
