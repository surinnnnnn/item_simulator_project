import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 아이템 생성
router.post("/items", authMiddleware, async (req, res, next) => {
  const { user_id } = req.user;
  const { item_Code, item_Name, health, power, price } = req.body;

  const isDuplicatedCode = await prisma.Item.findFirst({
    where: { item_Code },
  });

  const isDuplicatedName = await prisma.Item.findFirst({
    where: { item_Name },
  });

  if (isDuplicatedCode) {
    return res.status(401).json({ message: "중복된 아이템 코드 입니다" });
  } else if (isDuplicatedName) {
    return res.status(401).json({ message: "중복된 아이템 명입니다." });
  } else if (!item_Code) {
    return res.status(401).json({ message: "아이템 코드를 입력해 주세요." });
  } else if (!item_Name) {
    return res.status(401).json({ message: "아이템명을 입력해 주세요." });
  }

  const item = await prisma.Item.create({
    data: {
      item_Code,
      item_Name,
      health,
      power,
      price,
    },
  });
  return res
    .status(201)
    .json({ message: "성공적으로 아이템이 생성됐습니다.", item });
});

//아이템 삭제
router.delete("/items/:item_Code", authMiddleware, async (req, res, next) => {
  const { item_Code } = req.params;
  const { user_id } = req.user;
  const { password } = req.body;

  const isExistItem = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
  });
  const user = await prisma.User_info.findFirst({
    where: { user_id },
    select: { password: true },
  });

  if (!isExistItem) {
    return res.status(400).json({ message: "해당 코드의 아이템이 없습니다." });
  } else if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  await prisma.Item.delete({ where: { item_Code: +item_Code } });

  return res.status(200).json({ data: "아이템이 삭제됐습니다." });
});

// 아이템 목록 조회
router.get("/items", async (req, res, next) => {
  const items = await prisma.Item.findMany({
    select: {
      item_Code: true,
      item_Name: true,
      price: true,
      createdAt: true,
    },
  });

  return res.status(200).json({ data: items });
});

//아이템 상세 조회

router.get("/items/:item_Code", async (req, res, next) => {
  const { item_Code } = req.params;

  const isExistItem = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
  });
  if (!isExistItem) {
    return res.status(400).json({ message: "해당 코드의 아이템이 없습니다." });
  }

  const item = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
    select: {
      item_Code: true,
      item_Name: true,
      health: true,
      power: true,
      price: true,
      createdAt: true,
    },
  });

  return res.status(200).json({ data: item });
});

// 아이템 수정

router.patch("/items/:item_code", async (req, res, next) => {
  const { item_code } = req.params;
  const { item_Code, item_Name, health, power } = req.body;

  const isExistItem = await prisma.Item.findFirst({
    where: { item_Code: +item_code },
  });
  const isDuplicatedCode = await prisma.Item.findFirst({
    where: {
      AND: [{ item_Code: +item_Code }, { NOT: { item_Code: +item_code } }],
    },
  });

  if (!isExistItem) {
    return res.status(400).json({ message: "해당 코드의 아이템이 없습니다." });
  } else if (!item_Name) {
    return res.status(400).json({ message: "아이템 명을 입력해주세요" });
  } else if (!item_Code) {
    return res.status(400).json({ message: "아이템코드를 입력해주세요" });
  } else if (isDuplicatedCode) {
    return res.status(400).json({ message: "중복된 아이템 코드 입니다." });
  }

  const item = await prisma.Item.update({
    where: { item_Code: +item_code },
    data: {
      item_Code: +item_Code,
      item_Name: item_Name,
      health: +health,
      power: +power,
    },
  });
  return res.status(201).json({ message: "아이템 정보가 수정됐습니다.", item });
});

export default router;
