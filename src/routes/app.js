const express = require("express");
const router = express.Router();
const path = require("path");
const candidatosController = require("../controllers/candidatosController");
const resultsController = require("../controllers/resultsController");

router.get("/results", resultsController.viewResults);

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

router.get("/voting", async (req, res) => {
  const candidatos = await candidatosController.getCandidatos();
  res.render("voting", { candidatos });
});

router.get("/vote-success", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "vote-sucess.html")
  );
});

router.get("/support-chat", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "support-chat.html")
  );
});

router.get("/admin-chat", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "admin-chat.html")
  );
});

module.exports = router;
