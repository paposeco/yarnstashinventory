var express = require("express");
var router = express.Router();

const yarn_controller = require("../controllers/yarnController");
const fiber_controller = require("../controllers/fiberController");
const weight_controller = require("../controllers/weightController");
const producer_controller = require("../controllers/producerController");
const yarn_instance_controller = require("../controllers/yarnInstanceController");

// lists
router.get("/", yarn_controller.index);
router.get("/fiber", fiber_controller.fiber_list);
router.get("/weight", weight_controller.weight_list);
router.get("/producers", producer_controller.producers_list);
router.get("/yarn", yarn_controller.yarn_list);

// create
// if this goes after details, the controller chooses the /:id functions
router.get("/fiber/create", fiber_controller.fiber_create_get);
router.post("/fiber/create", fiber_controller.fiber_create_post);

// details

router.get("/fiber/:id", fiber_controller.fiber_detail);
router.get("/weight/:id", weight_controller.weight_detail);
router.get("/producers/:id", producer_controller.producer_detail);
router.get("/yarncolorway/:id", yarn_instance_controller.instance_detail);
router.get("/yarn/:id", yarn_controller.yarn_detail);

// delete

router.get("/fiber/:id/delete", fiber_controller.fiber_delete_get);
router.post("fiber/:id/delete", fiber_controller.fiber_delete_post);

module.exports = router;
