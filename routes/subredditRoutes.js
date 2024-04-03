const express = require("express");
const router = express.Router();
const subredditController = require("../controllers/subredditController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");

router.post(
  "/createCommunity",
  bodyParser.json(),
  authenticateToken,
  subredditController.createCommunity
);

router.get(
    "/sorting",
    bodyParser.json(),
    subredditController.sorting
  );
  router.post(
    "/addRule",
    bodyParser.json(),
    authenticateToken,
    subredditController.addRule
  );
  router.post(
    "/addTextWidget",
    bodyParser.json(),
    authenticateToken,
    subredditController.addTextWidget
  );


module.exports = router;
