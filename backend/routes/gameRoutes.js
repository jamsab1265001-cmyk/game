
const router = require("express").Router();
const auth = require("../middleware/auth");

const {
    getGames,
    getAdminGames,
    createGame,
    updateGame,
    deleteGame
} = require("../controllers/gameController");

router.get("/", getGames);
router.get("/admin", auth, getAdminGames);
router.post("/", auth, createGame);
router.put("/:id", auth, updateGame);
router.delete("/:id", auth, deleteGame);

module.exports = router;
