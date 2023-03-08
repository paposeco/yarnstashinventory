var express = require("express");
var router = express.Router();

const multer = require("multer");

// put it storage on host
const upload = multer({ dest: "public/images/uploads/" });

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

// create
// if this goes after details, the controller chooses the /:id functions
router.get("/fiber/create", fiber_controller.fiber_create_get);
router.post("/fiber/create", fiber_controller.fiber_create_post);
router.get("/weight/create", weight_controller.weight_create_get);
router.post("/weight/create", weight_controller.weight_create_post);
router.get("/producers/create", producer_controller.producer_create_get);
router.post("/producers/create", producer_controller.producer_create_post);
router.get(
  "/yarncolorway/create/:yarnid",
  yarn_instance_controller.create_instance_get
);

router.post(
  "/yarncolorway/create/:yarnid",
  yarn_instance_controller.create_instance_post
);
router.get("/yarn/create/:numberfibers", yarn_controller.yarn_create_get);
router.post(
  "/yarn/create/:numberfibers",
  upload.single("yarnphoto"),
  yarn_controller.yarn_create_post
);

router.get("/yarn/selectfibers", yarn_controller.yarn_create_fiber_input_get);
router.post("/yarn/selectfibers", yarn_controller.yarn_create_fiber_input_post);

// delete

router.get("/fiber/:id/delete", fiber_controller.fiber_delete_get);
router.post("/fiber/:id/delete", fiber_controller.fiber_delete_post);
router.get("/weight/:id/delete", weight_controller.weight_delete_get);
router.post("/weight/:id/delete", weight_controller.weight_delete_post);
router.get("/producers/:id/delete", producer_controller.producer_delete_get);
router.post("/producers/:id/delete", producer_controller.producer_delete_post);
router.get("/yarncolorway/:id/delete", yarn_instance_controller.delete_get);
router.post("/yarncolorway/:id/delete", yarn_instance_controller.delete_post);
router.get("/yarn/:id/delete", yarn_controller.yarn_delete_get);
router.post("/yarn/:id/delete", yarn_controller.yarn_delete_post);

// update

router.get("/producers/:id/update", producer_controller.producer_update_get);
router.post("/producers/:id/update", producer_controller.producer_update_post);
router.get("/yarncolorway/:yarnid/update", yarn_instance_controller.update_get);
router.post(
  "/yarncolorway/:yarnid/update",
  yarn_instance_controller.update_post
);
router.get("/yarn/:id/update", yarn_controller.yarn_update_get);
router.post(
  "/yarn/:id/update",
  upload.single("yarnphoto"),
  yarn_controller.yarn_update_post
);

// delete image from yarn
router.get("/yarn/:id/deleteimage", yarn_controller.delete_image_get);
router.post("/yarn/:id/deleteimage", yarn_controller.delete_image_post);

// details
router.get("/fiber/:id", fiber_controller.fiber_detail);
router.get("/weight/:id", weight_controller.weight_detail);
router.get("/producers/:id", producer_controller.producer_detail);
router.get("/yarncolorway/:id", yarn_instance_controller.instance_detail);
router.get("/yarn/:id", yarn_controller.yarn_detail);

module.exports = router;
