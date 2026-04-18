const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/auth");
const userController = require("../controllers/userController");

router.get("/stats", authenticate, requireAdmin, userController.getStats);
router.get("/", authenticate, requireAdmin, userController.getAll);
router.post("/", authenticate, requireAdmin, userController.create);
router.get("/:id", authenticate, userController.getById);
router.put("/:id", authenticate, userController.update);
router.delete("/:id", authenticate, requireAdmin, userController.remove);

module.exports = router;
