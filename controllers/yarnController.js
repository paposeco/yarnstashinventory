const Yarn = require("../models/yarn");
const YarnInstance = require("../models/yarninstance");
const async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      yarn_count(callback) {
        Yarn.countDocuments({}, callback);
      },
      yarn_instances_list(callback) {
        YarnInstance.find({}, callback);
      },
    },
    (err, results) => {
      /* if(err){
       *   return next(err)
       * } */ //if there's an error, it will be rendered on the page
      res.render("index", {
        title: "Yarn Inventory",
        error: err,
        data: results,
      });
    }
  );
};
