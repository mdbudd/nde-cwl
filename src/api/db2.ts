import express, { Request, Response } from "express"

const router = express.Router()
import { createDatabase } from "../db2/sequelize"
import { createUser } from "../db2/controllers/userController"

router.get('/', async (req: Request, res: Response) => {
    await createDatabase();
    return res.status(200).send("created/synced!!")
})
router.get('/seed', async (req: Request, res: Response) => {
    createUser({
        username: "john_dodd",
        email: "john.dodd@example.com"
    });
    createUser({
        username: "jim_bob",
        email: "jim.bob@example.com"
    });
    return res.status(200).send("seeded!!")
})
export default router 