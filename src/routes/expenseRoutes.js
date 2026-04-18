const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/auth");
const expenseController = require("../controllers/expenseController");

router.post("/", authenticate, expenseController.create);
router.get("/stats", authenticate, requireAdmin, expenseController.getStats);
router.get("/", authenticate, expenseController.getAll);
router.delete("/:id", authenticate, expenseController.remove);

module.exports = router;
