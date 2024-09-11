import express from "express";
import UsersRouter from "./src/routes/users.router.js";
import ChractersRouter from "./src/routes/character.router.js";
import ItemRouter from "./src/routes/item.router.js";
import ItemInventoryRouter from "./src/routes/item.inventory.router.js";
import ItemEquippedRouter from "./src/routes/item.equipped.router.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3306;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [UsersRouter]);
app.use("/api", [ChractersRouter]);
app.use("/api", [ItemRouter]);
app.use("/api", [ItemInventoryRouter]);
app.use("/api", [ItemEquippedRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
