var express = require("express");
var router = express.Router();

const yarn_controller = require("../controllers/yarnController");
const fiber_controller = require("../controllers/fiberController");

router.get("/", yarn_controller.index);
router.get("/fiber", fiber_controller.fiber_list);

module.exports = router;
