const bcrypt = require("bcrypt");
const Admin = require("../models/adminSchema.js");

const adminRegister = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
    const existingSchool = await Admin.findOne({
      schoolName: req.body.schoolName,
    });

    if (existingAdminByEmail) {
      return res.send({ message: "Email already exists" });
    }
    if (existingSchool) {
      return res.send({ message: "School name already exists" });
    }

    const schoolBannerPath = req.files?.schoolBanner
      ? req.files.schoolBanner[0].path.replace(/\\/g, "/")
      : "";
    const schoolLogoPath = req.files?.schoolLogo
      ? req.files.schoolLogo[0].path.replace(/\\/g, "/")
      : "";
    const profilePicPath = req.files?.profilePic
      ? req.files.profilePic[0].path.replace(/\\/g, "/")
      : "";

    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: hashedPass,
      schoolName: req.body.schoolName,
      role: "Admin",
      phone: req.body.phone || "",
      address: req.body.address || "",
      qualification: req.body.qualification || "",
      joiningDate: req.body.joiningDate || new Date(),
      schoolBanner: schoolBannerPath,
      schoolLogo: schoolLogoPath,
      profilePic: profilePicPath,
    });

    let result = await admin.save();
    result.password = undefined;
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const adminLogIn = async (req, res) => {
  try {
    if (req.body.email && req.body.password) {
      let admin = await Admin.findOne({ email: req.body.email });
      if (admin) {
        const validated = await bcrypt.compare(
          req.body.password,
          admin.password
        );
        if (validated) {
          // Mongoose document ko plain object me convert karte hain
          // taaki hum properties modify kar sakein
          let tempAdmin = admin.toObject();

          tempAdmin.password = undefined;

          // --- SCHOOL LOGO FIX ---
          // Agar logo hai, to backslash ko forward slash me badal do
          if (tempAdmin.schoolLogo) {
            tempAdmin.schoolLogo = tempAdmin.schoolLogo.replace(/\\/g, "/");
          }
          if (tempAdmin.schoolBanner) {
            tempAdmin.schoolBanner = tempAdmin.schoolBanner.replace(/\\/g, "/");
          }

          res.send(tempAdmin);
        } else {
          res.send({ message: "Invalid password" });
        }
      } else {
        res.send({ message: "User not found" });
      }
    } else {
      res.send({ message: "Email and password are required" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAdminDetail = async (req, res) => {
  try {
    let admin = await Admin.findById(req.params.id);
    if (admin) {
      let tempAdmin = admin.toObject();
      tempAdmin.password = undefined;

      // --- SCHOOL LOGO FIX ---
      if (tempAdmin.schoolLogo) {
        tempAdmin.schoolLogo = tempAdmin.schoolLogo.replace(/\\/g, "/");
      }
      if (tempAdmin.schoolBanner) {
        tempAdmin.schoolBanner = tempAdmin.schoolBanner.replace(/\\/g, "/");
      }

      res.send(tempAdmin);
    } else {
      res.send({ message: "No admin found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      schoolName,
      phone,
      address,
      qualification,
      bio,
      password,
    } = req.body;

    let updateFields = {
      name,
      email,
      schoolName,
      phone,
      address,
      qualification,
      bio,
    };

    // 1. Password Update Logic
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // 2. Image Handling (Multer .fields() use hoga route me)
    // Check karein ki files upload hui hain ya nahi
    if (req.files) {
      if (req.files.schoolBanner && req.files.schoolBanner.length > 0) {
        updateFields.schoolBanner = req.files.schoolBanner[0].path.replace(
          /\\/g,
          "/"
        );
      }
      if (req.files.schoolLogo && req.files.schoolLogo.length > 0) {
        updateFields.schoolLogo = req.files.schoolLogo[0].path.replace(
          /\\/g,
          "/"
        );
      }
      if (req.files.profilePic && req.files.profilePic.length > 0) {
        updateFields.profilePic = req.files.profilePic[0].path.replace(
          /\\/g,
          "/"
        );
      }
    }

    // 3. Database Update
    const result = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true } // Return updated document
    );

    if (result) {
      let tempAdmin = result.toObject();
      tempAdmin.password = undefined;

      // --- SCHOOL LOGO & PATH FIX FOR RESPONSE ---
      if (tempAdmin.schoolLogo)
        tempAdmin.schoolLogo = tempAdmin.schoolLogo.replace(/\\/g, "/");
      if (tempAdmin.schoolBanner)
        tempAdmin.schoolBanner = tempAdmin.schoolBanner.replace(/\\/g, "/");
      if (tempAdmin.profilePic)
        tempAdmin.profilePic = tempAdmin.profilePic.replace(/\\/g, "/");

      res.send(tempAdmin);
    } else {
      res.send({ message: "Admin not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, updateAdmin };
