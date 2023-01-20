const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      const { title, description, price, brand, size, condition, color, city } =
        req.body;

      if (price > 100000) {
        return res.status(400).json({ message: "Maximum price is 100000 " });
      } else if (title.length > 50) {
        return res
          .status(400)
          .json({ message: "Title length must be 50 characters max" });
      } else if (description.length > 500) {
        return res
          .status(400)
          .json({ message: "Description length must be 500 characters max" });
      }

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
      });
      //const result = await cloudinary.uploader.upload(
      //convertToBase64(req.files.picture),
      //{
      //folder: `/vinted/offers/`,
      //public_id: newOffer._id,
      //}
      //);

      //newOffer.product_image = result.secure_url;
      await newOffer.save();
      console.log(newOffer);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: "This route doesn't exists" });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort } = req.query;
    let filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: priceMin };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: priceMax };
      }
    }

    const sortObject = {};
    if (sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (sort === "price-asc") {
      sortObject.product_price = "asc";
    }

    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const skipPage = (page - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortObject)
      .skip(skipPage)
      .limit(limit)
      .select("product_name product_price");

    const count = await Offer.countDocuments(filters);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
