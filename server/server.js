const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const path = require("path");


const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(express.static(path.join(__dirname, "..", "client")));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect("mongodb+srv://umair:umair%40123@cluster0.1aodund.mongodb.net/tournaments", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Cloudinary config
cloudinary.config({
  cloud_name: "dq5ybbdqx",
  api_key: "155253999655652",
  api_secret: "6zhsXevE9bBgaALkt3R2pXD2R4w",
});

// Models
const Tournament = mongoose.model("Tournament", new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }
}));

const registrationSchema = new mongoose.Schema({
  tournamentName: String,
  name: String,
  age: Number,
  category: String,
  email: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});
const Registration = mongoose.model("Registration", registrationSchema);

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  buttonText: { type: String }, // optional
  buttonLink: { type: String }, // optional
  createdAt: { type: Date, default: Date.now }
});
const Content = mongoose.model("Content", contentSchema);

// Add content card
app.post("/api/contents", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "content_cards"
    });

    const content = new Content({
      title: req.body.title,
      description: req.body.description,
      imageUrl: result.secure_url,
      buttonText: req.body.buttonText,
      buttonLink: req.body.buttonLink
    });

    await content.save();
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to add content", details: err.message });
  }
});
app.delete('/api/contents/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted from contents' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/contents", async (req, res) => {
  try {
    const contents = await Content.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});


// Add new tournament with image upload
app.post("/api/tournaments", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "tournaments"
    });

    const tournament = new Tournament({
      name: req.body.name,
      imageUrl: result.secure_url
    });

    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ error: "Failed to add tournament", details: err.message });
  }
});

app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    await Tournament.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted from tournaments' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all tournaments
app.get("/api/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

// Save registration data
app.post("/api/register", async (req, res) => {
  try {
    const { tournamentName, name, age, category, email, phone } = req.body;
    const registration = new Registration({ tournamentName, name, age, category, email, phone });
    await registration.save();
    res.status(201).json({ message: "Registration successful", registration });
  } catch (err) {
    res.status(400).json({ error: "Failed to register", details: err.message });
  }
});

// Get all registrations
app.get("/api/registrations", async (req, res) => {
  try {
    const regs = await Registration.find().sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});



// Serve admin.html by default at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "admin.html"));
});
//profiles
const Profile = mongoose.model("Profile", new mongoose.Schema({
  imageUrl: String,
  role: String,
  name: String
}));

// Upload Profile (POST)
app.post("/api/profiles", async (req, res) => {
  try {
    const { imageBase64, role, name } = req.body;

    if (!imageBase64 || !role || !name) {
      return res.status(400).send("Missing required fields.");
    }

    const uploadRes = await cloudinary.uploader.upload(imageBase64, {
      folder: "profiles"
    });

    const profile = new Profile({
      imageUrl: uploadRes.secure_url,
      role,
      name
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error("Error uploading profile:", err);
    res.status(500).send("Server error");
  }
});
// Update profile (PUT)

app.delete('/api/profiles/:id', async (req, res) => {
  try {
    await Profile.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted from profiles' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Profiles (GET)
app.get("/api/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ _id: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).send("Server error");
  }
});
// edit/delete
app.put("/api/contents/update/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
    };

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "content_cards"
      });
      updateData.imageUrl = result.secure_url;
    }

    const updated = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Content not found" });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update content" });
  }
});


// Tournament update
app.put("/api/tournaments/update/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = {
      ...(name && { name })
    };

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "tournaments"
      });
      updateData.imageUrl = result.secure_url;
    }

    const updated = await Tournament.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Tournament not found" });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update tournament" });
  }
});

// Profile update
app.put("/api/profiles/update/:id", async (req, res) => {
  try {
    const { role, name } = req.body;
    const updateData = {
      ...(role && { role }),
      ...(name && { name })
    };

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "profiles"
      });
      updateData.imageUrl = result.secure_url;
    }

    const updated = await Profile.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Profile not found" });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
const joiningSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  interest: String,
}, { timestamps: true });

const Joining = mongoose.model("Joining", joiningSchema); // ✅ Corrected here

// POST: Save Joining Form
app.post("/api/joining", async (req, res) => {
  try {
    const join = new Joining(req.body);
    await join.save();
    res.status(201).json({ message: "Successfully joined!" });
  } catch (error) {
    console.error("Join Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

// GET: Show Joinings in Admin Page
app.get("/api/joining", async (req, res) => {
  try {
    const all = await Joining.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: "Error fetching joining data" });
  }
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));