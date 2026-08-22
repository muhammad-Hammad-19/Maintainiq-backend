import loginServices from "../services/loginServices.js";
import registerService from "../services/registerService..js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const { error } = registerSchema.validate(req.body);

    if (error) return res.status(400).json({ message: error.message });

    const result = await registerService(name, email, password, role);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const result = await loginServices(email, password);

    if (result.message == "Login successfull") {
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        success: result.success,
        message: result.message,
        data: result,
      });
    } else {
      res.status(400).json({
        success: result.success,
        message: result.message,
        data: result,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // same as login
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
