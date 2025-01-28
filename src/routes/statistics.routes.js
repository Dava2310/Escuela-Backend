import { Router } from "express";
import ctrl from "../controllers/statistics.controller.js";
import auth from "../middleware/auth.js";
// import validate from "../middleware/validate.js";

const router = Router();

// Ruta GET para conseguir las estadísticas
router.get('/',
    // auth.ensureAuthenticated,
    ctrl.getStatistics
)

export default router;