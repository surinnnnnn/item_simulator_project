import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. 아이템 구입

router.post("/inventory", authMiddleware, async (req, res, next) => {
  const { user_id } = req.user;
  const { item_Code, count, character_id } = req.body;

  const isExisCharacterId = await prisma.Character.findFirst({
    where: { character_id: +character_id },
  });

  if (!isExisCharacterId) {
    return res
      .status(404)
      .json({ message: "해당 id의 캐릭터를 찾을 수 없습니다." });
  }

  // 아이템 코드 존재 여부 확인
  const isExistItem = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
  });
  if (!isExistItem) {
    return res
      .status(401)
      .json({ message: "존재하지 않는 아이템 코드입니다." });
  }

  // 아이템 가격 및 스탯 정보 가져오기
  const itemData = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
    select: { price: true, item_Name: true, health: true, power: true },
  });
  const price = itemData.price;

  // 캐릭터의 소지금 확인
  const player = await prisma.Character.findFirst({
    where: { character_id: +character_id },
    select: { money: true, character_id: true },
  });

  if (count * price > player.money) {
    return res.status(401).json({ message: "잔액이 부족합니다." });
  }

  const existingInventory = await prisma.Item_inventory.findFirst({
    where: {
      character_id: +character_id,
      item_Code: +item_Code,
    },
    select: {
      character_id: true,
      item_Code: true,
      inventory_No: true,
    },
  });

  if (existingInventory) {
    // 이미 존재하면 count만 업데이트
    const updatedInventory = await prisma.Item_inventory.update({
      where: {
        character_id: +character_id,
        item_Code: +item_Code,
      },
      data: {
        count: { increment: count },
      },
    });
    // 캐릭터 소지금 update
    const updatedMoney = await prisma.Character.update({
      where: { character_id: +character_id },
      data: {
        money: { decrement: count * price },
      },
    });
    return res.status(200).json({
      message: "구매가 완료됐습니다.",
      item: updatedInventory,
    });
  } else {
    //인벤토리내에 해당 아이템 없으면 생성
    const newInventory = await prisma.Item_inventory.create({
      data: {
        character_id: +character_id,
        item_Code,
        item_Name: itemData.item_Name,
        count,
        health: itemData.health,
        power: itemData.power,
        price,
      },
    });
    // 캐릭터 소지금 update
    const updatedMoney = await prisma.Character.update({
      where: { character_id: +character_id },
      data: {
        money: { decrement: count * price },
      },
    });
    return res.status(201).json({
      message: "아이템이 추가되었습니다!",
      item: newInventory,
    });
  }
});

// 2. 아이템 판매
router.delete("/inventory", authMiddleware, async (req, res, next) => {
  const { user_id } = req.user;
  const { item_Code, count, character_id } = req.body;

  // 아이템 코드 존재하는 지 확인
  const isExistItem = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
  });
  if (!isExistItem) {
    return res
      .status(401)
      .json({ message: "존재하지 않는 아이템 코드입니다." });
  }

  //인벤토리에 해당 아이템 코드 존재하는 지 확인
  const isInInventory = await prisma.Item_inventory.findFirst({
    where: { character_id: +character_id, item_Code: +item_Code },
  });
  if (!isInInventory) {
    return res
      .status(401)
      .json({ message: "인벤토리에 해당 코드의 아이템이 없습니다." });
  }
  // 아이템의 가격 정보 가져오기
  const itemData = await prisma.Item.findFirst({
    where: { item_Code: +item_Code },
    select: { price: true },
  });
  const price = itemData.price;

  // 인벤토리 내 아이템의 수량 감소
  let updatedInventory;
  if (isInInventory.count > count) {
    updatedInventory = await prisma.Item_inventory.update({
      where: {
        character_id: +character_id,
        item_Code: +item_Code,
      },
      data: {
        count: { decrement: count }, // 수량 감소
      },
    });
  } else {
    // 수량이 0이면 삭제
    await prisma.Item_inventory.delete({
      where: {
        character_id: +character_id,
        item_Code: +item_Code,
      },
    });
    updatedInventory = null;
  }

  // 캐릭터 소지금 업데이트
  const updatedMoney = await prisma.Character.update({
    where: { character_id: +character_id },
    data: {
      money: { increment: count * price * 0.6 }, //60퍼센트만 회수
    },
  });
  return res.status(200).json({
    message: "아이템이 판매되었습니다.",
    remainCount: updatedInventory.count,
    money: updatedMoney.money,
  });
});

//3.인벤토리 목록 조회
router.get(
  "/inventory/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { user_id } = req.user;
    const { character_id } = req.params;

    const isExistChracter = await prisma.Character.findFirst({
      where: { character_id: +character_id },
    });
    if (!isExistChracter) {
      return res.status(400).json({ message: "해당 캐릭터가 없습니다." });
    }

    const items = await prisma.Item_inventory.findMany({
      where: { character_id: +character_id },
      select: {
        item_Code: true,
        item_Name: true,
        price: true,
        count: true,
      },
    });

    if (items.length === 0) {
      return res.status(200).json({ message: "인벤토리가 비어 있습니다." });
    }

    return res.status(200).json({ data: items });
  },
);

export default router;
