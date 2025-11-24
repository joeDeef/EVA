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

router.get("/voting", async (req, res) => {
  const candidatosController = require("../controllers/candidatosController");
  const candidatos = await candidatosController.getCandidatos();
  res.render("voting", { candidatos });
});

router.get("/vote-success", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "views", "vote-sucess.html")
  );
});

module.exports = router;
