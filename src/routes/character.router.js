import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";

const router = express.Router();

// 캐릭터 생성
router.post("/characters", authMiddleware, async (req, res, next) => {
  const { user_id } = req.user;
  const { character_name } = req.body;

  const isExistName = await prisma.Character.findFirst({
    where: { character_name },
  });

  const count = await prisma.User_info.findFirst({
    where: { user_id },
    select: { character_count: true },
  });

  if (isExistName) {
    return res.status(400).json({ message: "이미 존재하는 닉네임입니다." });
  } else if (count.character_count >= 2) {
    return res.status(400).json({
      message: "캐릭터 생성 횟수 초과입니다.",
      "캐릭터 생성 횟수": `${count.character_count}`,
    });
  } else if (character_name.length > 6) {
    return res
      .status(400)
      .json({ message: "6글자 이내 닉네임만 사용 가능합니다." });
  }

  const [character, countUp] = await prisma.$transaction([
    prisma.Character.create({
      data: {
        character_name,
        user_id,
      },
    }),
    prisma.User_info.update({
      where: { user_id },
      data: {
        character_count: { increment: 1 },
      },
    }),
  ]);

  return res.status(201).json({
    message: "성공적으로 캐릭터가 생성됐습니다.",
    닉네임: character_name,
    "캐릭터 생성 횟수": `${count.character_count + 1}`,
  });
});

//캐릭터 삭제

router.delete(
  "/characters/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { character_id } = req.params;
    const { user_id } = req.user;
    const { character_name, password } = req.body;

    const usersCharacterId = await prisma.Character.findFirst({
      where: { character_id: +character_id },
      select: { user_id: true, character_name: true },
    });

    const user = await prisma.User_info.findFirst({
      where: { user_id },
      select: { password: true },
    });

    if (!usersCharacterId) {
      return res.status(400).json({ message: "해당 id의 캐릭터가 없습니다." });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    } else if (usersCharacterId.character_name !== character_name) {
      return res.status(400).json({ message: "닉네임이 일치하지 않습니다." });
    }

    await prisma.Character.delete({
      where: { character_id: +character_id },
    });

    const countUpdate = await prisma.User_info.update({
      where: { user_id },
      data: {
        character_count: { decrement: 1 },
      },
    });

    return res.status(200).json({ data: "캐릭터가 삭제됐습니다." });
  },
);

//자가 캐릭터일 경우 jwt 토근 받아서 상세 조회 내 캐릭터 아닐 경우 단순 조회

router.get(
  "/characters/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { character_id } = req.params;
    const { user_id } = req.user;

    const isMe = await prisma.Character.findFirst({
      where: { user_id, character_id: +character_id },
      select: { user_id: true, character_id: true },
    });

    const isExisCharacterId = await prisma.Character.findFirst({
      where: { character_id: +character_id },
    });

    if (!isExisCharacterId) {
      return res
        .status(404)
        .json({ message: "해당 id의 캐릭터를 찾을 수 없습니다." });
    }

    if (isMe) {
      const character = await prisma.Character.findMany({
        where: { character_id: +character_id },
        select: {
          character_name: true,
          character_id: true,
          user_id: true,
          health: true,
          power: true,
          money: true,
          createdAt: true,
        },
      });
      return res.status(200).json({ data: character });
    } else {
      const character = await prisma.Character.findMany({
        where: { character_id: +character_id },
        select: {
          character_name: true,
          character_id: true,
          health: true,
          power: true,
          createdAt: true,
        },
      });
      return res.status(200).json({ data: character });
    }
  },
);

export default router;
