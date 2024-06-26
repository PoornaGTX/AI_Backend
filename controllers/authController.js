import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("please provide all values");
  }

  const userAlreadyExsisits = await User.findOne({ email });

  if (userAlreadyExsisits) {
    throw new BadRequestError("Email already in use");
  }

  const user = await User.create({
    firstName,
    email,
    password,
    lastName,
  });

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
    },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new UnAuthenticatedError("invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError("invalid Credentials");
  }

  const token = user.createJWT();
  user.password = undefined;

  res.status(StatusCodes.OK).json({ user, token, location: user.location });
};

//froget pasword from login

const frogetPassword = async (req, res) => {
  const { email } = req.body;

  //get the user data
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnAuthenticatedError("invalid Credentials");
  }

  //create one time link unique
  const secret = process.env.JWT_SECRET + user.password;

  const payload = {
    email: user.email,
    id: user.id,
  };

  //token
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });

  //email link
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;

  //email

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Dream Career Password Reset",
    text: link,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

//create new password

const newPassword = async (req, res) => {
  const { id, token } = req.params;
  const { newPassword } = req.body;

  //get user data
  const user = await User.findOne({ _id: id });

  //check the user is exsisit
  if (!user) {
    throw new UnAuthenticatedError("invalid Credentials");
  }

  try {
    //verify token
    const secret = process.env.JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);

    //check the user email with payload email
    if (user.email !== payload.email) {
      throw new UnAuthenticatedError("invalid token");
    }
  } catch (error) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }

  user.password = newPassword;
  await user.save();

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "password has been reset please re-login" });
};

const updateUser = async (req, res) => {
  const { email, firstName, lastName } = req.body;
  if (!email || !firstName || !lastName) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;

  await user.save();

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user, token });
};

export { register, login, updateUser, frogetPassword, newPassword };
