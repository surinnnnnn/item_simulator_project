import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
// 아이템 착용
router.post(
  "/equipped/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { user_id } = req.user;
    const { item_Code } = req.body;
    const { character_id } = req.params;

    //파라미터로 받은 캐릭터 id 유효성 확인
    const isExistChracter = await prisma.Character.findFirst({
      where: { character_id: +character_id },
    });
    if (!isExistChracter) {
      return res.status(400).json({ message: "해당 캐릭터가 없습니다." });
    }

    const isInInventory = await prisma.Item_inventory.findFirst({
      where: { character_id: +character_id, item_Code: +item_Code },
      select: { count: true },
    });

    //인벤토리에 해당 아이템 코드 존재하는 지 확인
    if (!item_Code) {
      return res.status(401).json({ message: "아이템 코드를 입력해 주세요." });
    } else if (!isInInventory) {
      return res
        .status(401)
        .json({ message: "인벤토리에 해당 코드의 아이템이 없습니다." });
    }

    //착용하면서 인벤토리 내 아이템 카운트 -1
    let updatedInventory;
    if (isInInventory.count >= 1) {
      updatedInventory = await prisma.Item_inventory.update({
        where: {
          character_id: +character_id,
          item_Code: +item_Code,
        },
        data: {
          count: { decrement: 1 }, // 수량 1 감소
        },
      });
    } else {
      return res.status(400).json({ message: "수량이 충분하지 않습니다." });
    }

    // 아이템 스탯 가져오기
    const itemData = await prisma.Item.findFirst({
      where: { item_Code: +item_Code },
      select: { health: true, power: true, item_Name: true },
    });

    // 착용 후 캐릭터 스탯 업데이트
    const postEquip = await prisma.Character.update({
      where: { character_id: +character_id },
      data: {
        item_Code,
        item_Name: itemData.item_Name,
        health: { increment: itemData.health },
        power: { increment: itemData.power },
      },
    });
    return res
      .status(201)
      .json({ message: "아이템이 장착되었습니다", postEquip });
  },
);

// 아이템 탈착
router.delete(
  "/equipped/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { user_id } = req.user;
    const { item_Code } = req.body;
    const { character_id } = req.params;

    //파라미터로 받은 캐릭터 id 유효성 확인
    const isExistChracter = await prisma.Character.findFirst({
      where: { character_id: +character_id },
    });
    if (!isExistChracter) {
      return res.status(400).json({ message: "해당 캐릭터가 없습니다." });
    }

    const isBeEquipped = await prisma.Item_equipped.findFirst({
      where: { character_id: +character_id, item_Code: +item_Code },
    });

    //착용 중 인 아이템 중에 해당 코드 아이템 있는 지 확인
    if (!item_Code) {
      return res.status(401).json({ message: "아이템 코드를 입력해 주세요." });
    } else if (!isBeEquipped) {
      return res
        .status(401)
        .json({ message: "해당 아이템을 착용하고 있지 않습니다." });
    }
    //탈착하면서 인벤토리 내 아이템 카운트 +1
    let updatedInventory = await prisma.Item_inventory.update({
      where: {
        character_id_item_Code: {
          character_id: +character_id,
          item_Code: +item_Code,
        },
      },
      data: {
        count: { increment: 1 }, // 수량 1 증가
      },
    });

    // 아이템 스탯 가져오기
    const itemData = await prisma.Item.findFirst({
      where: { item_Code: +item_Code },
      select: { health: true, power: true, item_Name: true },
    });

    // 탈착 후 캐릭터 스탯 업데이트
    const postDetach = await prisma.Character.update({
      where: { character_id: +character_id },
      data: {
        item_Code,
        item_Name: itemData.item_Name,
        health: { decrement: itemData.health },
        power: { decrement: itemData.power },
      },
    });
    return res
      .status(201)
      .json({ message: "아이템을 탈착했습니다", postDetach });
  },
);

// 장착한 아이템 목록 조회(jwt 필요 없음)
router.get("/equipped/:character_id", async (req, res, next) => {
  const { character_id } = req.params;

  const isExistChracter = await prisma.Character.findFirst({
    where: { character_id: +character_id },
  });
  if (!isExistChracter) {
    return res.status(400).json({ message: "해당 캐릭터가 없습니다." });
  }

  const equippedItems = await prisma.Item_equipped.findMany({
    where: { character_id: +character_id },
    select: {
      item_Code: true,
      item_Name: true,
    },
  });

  if (items.length === 0) {
    return res.status(200).json({ message: "착용한 아이템이 없습니다." });
  }

  return res.status(200).json({ items: equippedItems });
});

export default router;
