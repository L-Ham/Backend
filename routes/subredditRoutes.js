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
    "/addRuleWidget",
    bodyParser.json(),
    authenticateToken,
    subredditController.addRuleWidget
  );
  router.post(
    "/addTextWidget",
    bodyParser.json(),
    authenticateToken,
    subredditController.addTextWidget
  );
  router.patch(
    "/editTextWidget",
    bodyParser.json(),
    authenticateToken,
    subredditController.editTextWidget
  );
  router.delete(
    "/deleteTextWidget",
    bodyParser.json(),
    authenticateToken,
    subredditController.deleteTextWidget
  );
 

module.exports = router;
