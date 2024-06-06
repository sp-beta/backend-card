import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import { sendMail } from "../controllers/mailer.js";
import PersonalFormModel from "../models/personalForm.model.js";
import BusinessFormModel from "../models/businessForm.model.js";

dotenv.config({
  path: "../.env",
});

/* middleware for user verify */
export async function verifyUser(req, res, next) {
  try {
    const email = req.method === "GET" ? req.query.email : req.body.email;

    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    req.user = user; // Attach the user to the request object for further use
    next();
  } catch (error) {
    console.error("Error in verifyUser middleware:", error); // Log the error for debugging
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

//register user
export async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new UserModel({
      email,
      password: hashedPassword,
    });

    // Save the user
    await user.save();

    // Send registration email
    console.log("Sending registration email");
    await sendMail(email, "Welcome to Our App", "Thank you for registering!");

    res.status(201).send({ msg: "User Registration Successful" });
  } catch (error) {
    console.error("Error in register function:", error); // Log the error for debugging
    res.status(500).send({ error: "Internal Server Error" });
  }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "email" : "example123@gmail.com",
  "password" : "admin123"
}
*/

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Check if the email exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "Email not found" });
    }

    // Compare the provided password with the stored hashed password
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(400).send({ error: "Password does not match" });
    }

    // Create a JWT token
    const token = Jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send login response with token
    return res.status(200).send({
      msg: "Login Successful!",
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).send({ error: "Internal Server Error" });
  }
}


/* Get : http://localhost:8000/api/user/example123@gmail.com */
export async function getUser(req, res) {
  const { userId } = req.user;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "Couldn't Find the User" });
    }

    const { password, ...rest } = Object.assign({}, user.toJSON());
    return res.status(200).send(rest);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

/* Put : http://localhost:8000/api/updateuser */

export async function updateUser(req, res) {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const body = req.body;
    const updatedUser = await UserModel.updateOne({ _id: userId }, body);

    if (updatedUser.nModified === 0) {
      return res
        .status(404)
        .send({ error: "User not found or no changes made" });
    }

    return res.status(200).send({ msg: "Record Updated!" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

/* Get : http://localhost:8000/api/genrateOTP */

export async function generateOTP(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    req.app.locals.OTP = otp;
    console.log("Sending OTP email to", email);
    await sendMail(email, "Your OTP Code", `Your OTP code is ${otp}`);

    res.status(201).send({ code: otp });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

/* GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { email, code } = req.query;
  if (!email || !code) {
    return res.status(400).send({ error: "Email and code are required" });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset otp value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successfully" });
  }
  return res.status(400).send({ error: "Invalid OTP" }); // Return an object with an error property
}

/* POST: http://localhost:8080/api/verifyOTPSignup */
export async function verifyOTPSignup(req, res) {
  const { email, code } = req.query;
  if (!email || !code) {
    return res.status(400).send({ error: "Email and code are required" });
  }

  // Check if the OTP matches the one sent during signup
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset otp value
    return res.status(201).send({ msg: "Verify Successfully" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).send({ msg: "access granted" });
  }
  return res.status(440).send({ error: "session expired" });
}

export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession) {
      return res.status(440).send({ error: "Session Expired" });
    }

    const { email, password } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "Email not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await UserModel.updateOne({ email: email }, { password: hashedPassword });
    req.app.locals.resetSession = false;
    return res.status(200).send({ msg: "Password Updated Successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

export const submitPersonalForm = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      jobTitle,
      socialMedia,
      personPhoto,
      services,
      website,
    } = req.body;
    const userEmail = req.user.email;

    // Update or create the personal form
    await PersonalFormModel.findOneAndUpdate(
      { userEmail },
      {
        firstName,
        lastName,
        phoneNumber,
        email,
        jobTitle,
        socialMedia,
        personPhoto,
        services,
        website,
        userEmail,
      },
      { upsert: true, new: true }
    );

    // Update the user's hasFilledForm field
    await UserModel.findOneAndUpdate(
      { email: userEmail },
      { 
        hasFilledPersonalForm: true }
    );

    return res.status(200).send({
      msg: "Personal form submitted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


export const getPersonalForm = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userData = await PersonalFormModel.findOne({ userEmail });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitBusinessForm = async (req, res) => {
  try {
    const {
      businessName,
      companyMessage,
      phoneNumber,
      email,
      address,
      website,
      socialMedia,
      businessLogo,
      services,
    } = req.body;
    const userEmail = req.user.email;

    // Update or create the business form
    await BusinessFormModel.findOneAndUpdate(
      { userEmail },
      {
        businessName,
        companyMessage,
        phoneNumber,
        email,
        address,
        website,
        socialMedia,
        businessLogo,
        services,
        userEmail,
      },
      { upsert: true, new: true }
    );

    // Set hasFilledForm to true in the user document
    await UserModel.findOneAndUpdate(
      { email: userEmail },
      { hasFilledBusinessForm: true },
      { new: true }
    );

    res.status(200).send({
      msg: "Business form submitted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


export const getBusinessForm = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userData = await BusinessFormModel.findOne({ userEmail });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getuserData = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userData = await UserModel.findOne({ email: userEmail });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    // Assuming you have a field called hasFilledPersonalForm in your user data
    // You can add any condition here based on your requirement
    const hideDiv = (userData.hasFilledPersonalForm && userData.hasFilledBusinessForm);

    res.status(200).json({ userData, hideDiv });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

