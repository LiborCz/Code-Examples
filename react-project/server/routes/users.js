const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const auth = require("../middleware/auth");
const User = require("../modules/db").User;

router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    // Validate

    if (!email || !password || !passwordCheck)
      return res.json({ ok:false, msg: "Not all fields have been entered." });

    if (password !== passwordCheck)
      return res.json({ ok:false, msg: "Enter the same password twice for verification." });

    if (password.length < 4)
      return res.json({ ok:false, msg: "The password needs to be at least 5 characters long." });

    displayName = displayName || email;

    let user = await User.findOne({ email });
    if (user) return res.json({ ok:false, msg: "An account with this email already exists.", ...user });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Save the new user
    const newUser = new User({ source: 'Keeper', email, displayName, password: passwordHash });
    user = await newUser.save();

    // create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Send the newly created user as a response
    res.json({ 
      ok:true, 
      token,
      user:{ id: user._id, email: user.email, displayName: user.displayName },
      msg: "User " + user.displayName + " has been registered and logged in..."
    });
  }
  
  catch (err) { res.status(500).json({ error: err.message }) }

});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Missing field values
    if (!email || !password) return res.json({ ok:false, msg: "Not all fields have been entered." });

    const user = await User.findOne({ email });

    // User does not exist
    if (user===null) return res.json({ ok:false, msg: "No account with this email has been registered." });

    // Wrong password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ ok:false, msg: "Invalid credentials." });

    // All OK ->  Continue to Log in...

    // create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Send the newly created user as a response
    res.json({ ok:true, token, user:{ id: user._id, email: user.email, displayName: user.displayName } });
  }
  
  catch (err) { res.status(500).json({ error: err.message }) }

});

router.post("/validateToken", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json({
      token, 
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
      }});

  } catch (err) { res.json(false); }
});


// DELETE

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/delete", (req, res) => {
    return res.status(401).json({ error: "Unauthorized" });
});


// TEST

router.get("/test", (req, res) => {
  return res.json({ ok: true, msg: "Tested ok - super!!" });
});

router.post("/test", (req, res) => {

  console.log(req.body.msg);

  return res.json({ ok: true, msg: "Tested ok: " + req.body.msg });
});

module.exports = router;
