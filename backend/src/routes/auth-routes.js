import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { loginUser } from "../services/auth-service.js";
import { authenticate } from "../middleware/auth.js";
import { required } from "../utils/validators.js";

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    required(req.body.email, "email");
    required(req.body.password, "password");
    const result = await loginUser(req.body);
    res.json(result);
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
