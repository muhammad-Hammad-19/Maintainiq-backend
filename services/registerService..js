import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const registerService = async (name, email, password, role) => {
  
  // 2. Check if email already exists
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    throw new Error("Email already exists");
  }

  // 3. Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // 4. Create user

  const user = await User.create({
    name,
    email,
    password: hashPassword,
    role,
  });

  // 5. Return user (without password)
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

export default registerService;
