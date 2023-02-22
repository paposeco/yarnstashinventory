const Producers = require("../models/producer");

exports.producers_list = (req, res, next) => {
  Producers.find().exec(function(err, list_producers) {
    if (err) {
      return next(err);
    }
    res.render("producers_list", {
      title: "Producers",
      producers_list: list_producers,
    });
  });
};

exports.producer_detail = (req, res, next) => {
  Producers.findById(req.params.id).exec((err, producerdetail) => {
    if (err) {
      return next(err);
    }
    res.render("producer_detail", {
      title: "Producer",
      producer_info: producerdetail,
    });
  });
};
