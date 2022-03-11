const router = require("express").Router();

const auth = require("../middleware/auth");
const Item = require("../modules/db").Item;

router.post("/add", auth, async (req, res) => {
  try {

    // console.log(req.body);

    const { title, text, location } = req.body;

    // Validation
    if (!title) return res.json({ ok:false, msg: "Not all fields have been entered." });

    // Save the item
    const newItem = new Item({
      title,
      text,
      location,
      c_user: req.user
    });

    let item = await newItem.save();

    // Send the newly created item as a response
    res.json({ ok:true, msg: "New Item was saved.", item });    
  }
  
  catch (err) { res.status(500).json({ error: err.message }) }

});

// List by user / all

router.get("/listall", (req, res) => {

  Item.find().sort({ date: -1 }).then(items => res.json(items));

});


router.get("/list/:user", auth, (req, res) => {

  Item.find({c_user:req.user}).sort({ date: -1 }).then(items => res.json(items));

});


// Delete

router.delete("/delete/:id", auth, async (req, res) => {

  console.log("Deleting id:" + req.params.id);

  try {
    const delItem = await Item.findByIdAndDelete(req.params.id);
    res.json(delItem);
  }
  
  catch (err) { res.status(500).json({ error: err.message }) }

});

router.get("/delete", (req, res) => {
    return res.status(401).json({ error: "Unauthorized" });
});



router.get("/test", (req, res) => {
  return res.json({ ok: true, msg: "Tested ok !!" });
});

router.post("/test", (req, res) => {

  console.log(req.body.msg);

  return res.json({ ok: true, msg: "Tested ok: " + req.body.msg });
});

module.exports = router;
