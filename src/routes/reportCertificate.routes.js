import { Router } from "express";
import ctrl from "../controllers/certificates.controller.js";
import auth from "../middleware/auth.js";
import validate from '../middleware/validate.js'

const router = Router();

router.get('/:certificadoId',
    auth.ensureAuthenticated,
    validate.validateAndConvertId('certificadoId'),
    ctrl.reportCertificado
)

export default router;