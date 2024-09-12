import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// 회원 가입
router.post("/sign-up", async (req, res, next) => {
  const { user_id, password, passwordck, user_name } = req.body;
  const isExisUserId = await prisma.User_info.findFirst({
    where: {
      user_id,
    },
  });
  if (isExisUserId) {
    return res.status(409).json({ message: "이미 사용 중인 아이디 입니다." });
  } else if (password !== passwordck) {
    return res
      .status(409)
      .json({ message: "확인 비밀번호가 일치 하지 않습니다." });
  } else if (password.length < 6) {
    return res
      .status(409)
      .json({ message: "비밀번호는 최소 6자리 이상이어야 합니다." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userInfo = await prisma.User_info.create({
    data: {
      user_id,
      password: hashedPassword,
      user_name,
    },
  });
  return res
    .status(201)
    .json({ message: "성공적으로 계정이 생성됐습니다.", 아이디: `${user_id}` });
});

//로그인
router.post("/login", async (req, res, next) => {
  const { user_id, password } = req.body;
  const user = await prisma.User_info.findFirst({
    where: {
      user_id,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "아이디가 존재하지 않습니다." });
  } else if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "비밀 번호가 일치 하지 않습니다." });
  }

  const token = jwt.sign({ user_id: user.user_id }, "custom-secret-key", {
    expiresIn: "1h",
  });

  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인에 성공했습니다." });
});

router.get("/get", (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  return res.status(200).json({ cookie });
});

export default router;
