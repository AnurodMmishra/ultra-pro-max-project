const express = require("express");
const router = express.router();

const{
    getProperties, 
    addProperty
} = require("../controllers/propertyController");

router.get("/", getProperties);
router.post("/", addProperty);

module.exports = router;