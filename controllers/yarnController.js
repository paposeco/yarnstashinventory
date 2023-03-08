const Yarn = require("../models/yarn");
const YarnInstance = require("../models/yarninstance");
const Producer = require("../models/producer");
const Weight = require("../models/weight");
const Fiber = require("../models/fiber");
const async = require("async");
const fs = require("fs");
const path = require("path");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const editingforms = process.env.EDIT_FORMS_KEY;

exports.index = (req, res) => {
  async.parallel(
    {
      yarn_count(callback) {
        Yarn.countDocuments({}, callback);
      },
      yarn_instances_list(callback) {
        YarnInstance.find({}, null)
          .populate({ path: "yarn" })
          .sort({ yarn: 1 })
          .exec(callback);
      },
      yarn_info(callback) {
        Yarn.find({}, null, { sort: { producer: 1 } })
          .populate("producer")
          .sort({ name: 1 })
          .exec(callback);
      },
    },
    (err, results) => {
      const yarnmap = new Map();
      const producermap = new Map();
      for (let i = 0; i < results.yarn_info.length; i++) {
        const yarnid = results.yarn_info[i]._id.toString();
        const yarnproducer = results.yarn_info[i].producer._id.toString();
        if (producermap.has(yarnproducer)) {
          const currDic = producermap.get(yarnproducer);
          const yarnarray = currDic.yarn;
          yarnarray.push(yarnid);
          producermap.set(yarnproducer, {
            brandname: currDic.brandname,
            yarn: yarnarray,
          });
        } else {
          producermap.set(yarnproducer, {
            brandname: results.yarn_info[i].producer.brandname,
            yarn: [yarnid],
          });
        }
        for (let j = 0; j < results.yarn_instances_list.length; j++) {
          const yarnIdInInstance =
            results.yarn_instances_list[j].yarn._id.toString();
          if (yarnid === yarnIdInInstance) {
            if (yarnmap.has(yarnid)) {
              const dicContent = yarnmap.get(yarnid);
              const newstock =
                Number(dicContent.stock) +
                Number(results.yarn_instances_list[j].stock);
              const currColorways = dicContent.colorways;
              currColorways.includes(results.yarn_instances_list[j].colorwayid)
                ? null
                : currColorways.push(results.yarn_instances_list[j].colorwayid);
              yarnmap.set(yarnid, {
                name: dicContent.name,
                stock: newstock,
                colorways: currColorways,
                url: dicContent.url,
              });
            } else {
              const infoobj = {
                name:
                  results.yarn_info[i].producer.brandname +
                  " " +
                  results.yarn_info[i].name,
                stock: results.yarn_instances_list[j].stock,
                colorways: [results.yarn_instances_list[j].colorwayid],
                url: results.yarn_info[i].url,
              };
              yarnmap.set(yarnid, infoobj);
            }
          }
        }
      }
      for (let k = 0; k < results.yarn_info.length; k++) {
        if (!yarnmap.has(results.yarn_info[k]._id.toString())) {
          const infoobj = {
            name:
              results.yarn_info[k].producer.brandname +
              " " +
              results.yarn_info[k].name,
            stock: 0,
            colorways: [],
            url: results.yarn_info[k].url,
          };
          yarnmap.set(results.yarn_info[k]._id.toString(), infoobj);
        }
      }
      res.render("index", {
        title: "Yarn Inventory",
        error: err,
        producers: producermap,
        yarndic: yarnmap,
      });
    }
  );
};

exports.yarn_detail = (req, res, next) => {
  async.series(
    [
      function(callback) {
        Yarn.findById(req.params.id)
          .populate("producer")
          .populate("weight")
          .populate("fibercomposition.fibertype")
          .exec((err, queryresult) => {
            if (err) {
              next(err);
            }
            callback(null, queryresult);
          });
      },
      function(callback) {
        YarnInstance.find({ yarn: req.params.id })
          .sort({ colorwayid: 1 })
          .exec((err, yarninstancesquery) => {
            if (err) {
              return next(err);
            }
            callback(null, yarninstancesquery);
          });
      },
    ],
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render("yarn_detail", {
        title: "Yarn",
        yarn_info: results[0],
        yarncolorways: results[1],
      });
    }
  );
};

exports.yarn_delete_get = (req, res, next) => {
  async.parallel(
    {
      findyarn(callback) {
        Yarn.findById(req.params.id)
          .populate("producer")
          .populate("fibercomposition.fibertype")
          .populate("weight")
          .exec(callback);
      },
      findinstances(callback) {
        YarnInstance.find({ yarn: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.findyarn === null) {
        res.redirect("/inventory/null");
      }
      res.render("yarn_delete", {
        title:
          "Delete: " +
          results.findyarn.producer.brandname +
          " " +
          results.findyarn.name,
        yarn_info: results.findyarn,
        yarncolorways: results.findinstances,
      });
    }
  );
};

exports.yarn_delete_post = [
  body("editformpass")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password is required."),

  (req, res, next) => {
    const errors = validationResult(req);
    async.parallel(
      {
        findyarn(callback) {
          Yarn.findById(req.body.yarnid)
            .populate("producer")
            .populate("fibercomposition.fibertype")
            .populate("weight")
            .exec(callback);
        },
        findinstances(callback) {
          YarnInstance.find({ yarn: req.body.yarnid }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (!errors.isEmpty()) {
          res.render("yarn_delete", {
            title:
              "Delete: " +
              results.findyarn.producer.brandname +
              " " +
              results.findyarn.name,
            yarn_info: results.findyarn,
            yarncolorways: results.findinstances,
            errors: errors.array(),
          });
          return;
        }
        if (req.body.editformpass !== editingforms) {
          res.render("yarn_delete", {
            title:
              "Delete: " +
              results.findyarn.producer.brandname +
              " " +
              results.findyarn.name,
            yarn_info: results.findyarn,
            yarncolorways: results.findinstances,
            errors: "Wrong password",
          });
          return;
        }

        if (results.findinstances.length > 0) {
          res.render("yarn_delete", {
            title:
              "Delete: " +
              results.findyarn.producer.brandname +
              " " +
              results.findyarn.name,
            yarn_info: results.findyarn,
            yarncolorways: results.findinstances,
          });
          return;
        }
        if (
          results.findyarn.imagepath !== "" &&
          results.findyarn.imagepath !== undefined
        ) {
          const imagepath = yarn.imagepath;
          // delete image from folder on host
          // look for extension
          const imagepathonhost = imagepath.substring(
            0,
            imagepath.indexOf(".", 35)
          );

          fs.unlink(imagepathonhost, (err) => {
            if (err) throw err;
          });
        }
        Yarn.findByIdAndRemove(req.body.yarnid, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/inventory/yarn");
        });
      }
    );
  },
];

exports.yarn_create_fiber_input_get = (req, res, next) => {
  res.render("yarn_create_fiber", {
    title: "Add yarn",
  });
};

exports.yarn_create_fiber_input_post = (req, res, next) => {
  const numberfibers = req.body.numberFibers;
  res.redirect("/inventory/yarn/create/" + numberfibers);
};

exports.yarn_create_get = (req, res, next) => {
  async.parallel(
    {
      producers(callback) {
        Producer.find({}, null, { sort: { brandname: 1 } }).exec(callback);
      },
      weights(callback) {
        Weight.find().exec(callback);
      },
      fibers(callback) {
        Fiber.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("yarn_create", {
        title: "Add yarn",
        producers: results.producers,
        weights: results.weights,
        fibers: results.fibers,
        numberfibers: req.params.numberfibers,
        photo: false,
      });
    }
  );
};

exports.yarn_create_post = [
  // convert fibertype to array
  (req, res, next) => {
    req.body.price = Number(req.body.price);
    let fiberarray = [];
    const numberfibers = req.body.numberfibersinput;
    for (let i = 0; i < numberfibers; i++) {
      const bodynameperc = "fiberperc" + i;
      const bodynametype = "fibertype" + i;
      const fiberobj = {
        fibertype: req.body[bodynametype],
        percentage: Number(req.body[bodynameperc]),
      };
      fiberarray.push(fiberobj);
    }
    req.body.numberfibersinput = fiberarray;
    next();
  },

  body("yarnname", "Yarn name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("weight", "Weight must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("unitweight")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Unit weight must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("meterage")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Meterage must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Price  must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("producer", "Producer must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const yarn = new Yarn({
      name: req.body.yarnname,
      weight: req.body.weight,
      fibercomposition: req.body.numberfibersinput,
      unitweight: req.body.unitweight,
      meterage: req.body.meterage,
      price: req.body.price,
      producer: req.body.producer,
      imagepath: req.file.path,
    });
    // this stays so that I trust my gut in the future
    /* findfibers(callback) {
     *   // why do I get the feeling that this is unnecessary?
     *   let idsarray = [];
     *   req.body.numberfibersinput.forEach((obj) =>
     *     idsarray.push(obj.fibertype)
     *   );
     *   Fiber.find({ _id: { $in: idsarray } }).exec(callback);
     * }, */

    if (!errors.isEmpty()) {
      async.parallel(
        {
          producers(callback) {
            Producer.find({}, null, { sort: { brandname: 1 } }).exec(callback);
          },
          weights(callback) {
            Weight.find().exec(callback);
          },
          fibers(callback) {
            Fiber.find().exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          if (!errors.isEmpty()) {
            res.render("yarn_create", {
              title: "Add yarn",
              producers: results.producers,
              weights: results.weights,
              fibers: results.fibers,
              numberfibers: yarn.fibercomposition.length,
              yarn,
              photo: false,
              errors: errors.array(),
            });
          } else {
            res.render("yarn_create", {
              title: "Add yarn",
              producers: results.producers,
              weights: results.weights,
              fibers: results.fibers,
              numberfibers: yarn.fibercomposition.length,
              yarn,
              photo: false,
              errors: "Wrong password",
            });
          }
        }
      );
      return;
    }

    yarn.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(yarn.url);
    });
  },
];

exports.yarn_update_get = (req, res, next) => {
  async.parallel(
    {
      producers(callback) {
        Producer.find({}, null, { sort: { brandname: 1 } }).exec(callback);
      },
      weights(callback) {
        Weight.find().exec(callback);
      },
      fibers(callback) {
        Fiber.find().exec(callback);
      },
      yarn(callback) {
        Yarn.findById(req.params.id)
          .populate("producer")
          .populate("fibercomposition.fibertype")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      const photoexists =
        results.yarn.imagepath === "" || results.yarn.imagepath === undefined
          ? false
          : true;
      res.render("yarn_create", {
        title: "Edit yarn",
        producers: results.producers,
        weights: results.weights,
        fibers: results.fibers,
        yarn: results.yarn,
        numberfibers: results.yarn.fibercomposition.length,
        photo: photoexists,
      });
    }
  );
};

exports.yarn_update_post = [
  (req, res, next) => {
    req.body.price = Number(req.body.price);
    let fiberarray = [];
    const numberfibers = req.body.numberfibersinput;
    for (let i = 0; i < numberfibers; i++) {
      const bodynameperc = "fiberperc" + i;
      const bodynametype = "fibertype" + i;
      const fiberobj = {
        fibertype: req.body[bodynametype],
        percentage: Number(req.body[bodynameperc]),
      };
      fiberarray.push(fiberobj);
    }
    req.body.numberfibersinput = fiberarray;
    next();
  },

  body("yarnname", "Yarn name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("weight", "Weight must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("unitweight")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Unit weight must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("meterage")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Meterage must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Price  must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("producer", "Producer must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    let filePath = "";

    if (req.file) {
      filePath = req.file.path;
    }
    //in order to change the image, the user must delete the old one first

    const photoexists = filePath === "" ? false : true;

    const yarn = new Yarn({
      name: req.body.yarnname,
      weight: req.body.weight,
      fibercomposition: req.body.numberfibersinput,
      unitweight: req.body.unitweight,
      meterage: req.body.meterage,
      price: req.body.price,
      producer: req.body.producer,
      imagepath: filePath,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          producers(callback) {
            Producer.find({}, null, { sort: { brandname: 1 } }).exec(callback);
          },
          weights(callback) {
            Weight.find().exec(callback);
          },
          fibers(callback) {
            Fiber.find().exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          res.render("yarn_create", {
            title: "Add yarn",
            producers: results.producers,
            weights: results.weights,
            fibers: results.fibers,
            numberfibers: yarn.fibercomposition.length,
            yarn,
            photo: photoexists,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    Yarn.findByIdAndUpdate(req.params.id, yarn, {}, (err, theyarn) => {
      if (err) {
        return next(err);
      }
      res.redirect(yarn.url);
    });
  },
];

exports.delete_image_get = (req, res, next) => {
  Yarn.findById(req.params.id)
    .populate("producer")
    .exec((err, yarninfo) => {
      if (err) {
        return next(err);
      }
      res.render("yarn_delete_image", {
        title: "Delete image",
        yarninfo: yarninfo,
      });
    });
};

exports.delete_image_post = (req, res, next) => {
  Yarn.findById(req.body.yarnid).exec((err, yarn) => {
    if (err) {
      return next(err);
    }

    // delete image from folder on host
    const imagepath = yarn.imagepath;
    const pathonhost = "../public" + imagepath;
    fs.unlink(path.join(__dirname, pathonhost), (err) => {
      if (err) throw err;
    });

    // update db
    const updatedyarn = new Yarn({
      name: yarn.yarnname,
      weight: yarn.weight,
      fibercomposition: yarn.numberfibersinput,
      unitweight: yarn.unitweight,
      meterage: yarn.meterage,
      price: yarn.price,
      producer: yarn.producer,
      imagepath: "",
      _id: req.body.yarnid,
    });

    Yarn.findByIdAndUpdate(req.body.yarnid, updatedyarn, {}, (err, theyarn) => {
      if (err) {
        return next(err);
      }
      res.redirect(yarn.url);
    });
  });
};

// check what happens when we delete an image
