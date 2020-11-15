const express    = require('express');
const router     = express.Router();
const bodyParser = require("body-parser");

router.use(express.urlencoded({extended: false}));
router.use(bodyParser.urlencoded({extended:true}));

router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
