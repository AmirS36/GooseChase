import { Router, Request, Response } from "express";

const router = Router();

// Mock user for example purposes
const mockUser = {
  username: "123",
  password: "123", // Don't store plaintext passwords in real apps!
};

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req.body);

  if (username === mockUser.username && password === mockUser.password) {
    console.log("Correct user name and password");
    console.log(res);
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

export default router;