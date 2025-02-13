import { Router } from "express";
import ctrl from "../controllers/certificates.controller.js";
import auth from "../middleware/auth.js";
import validate from '../middleware/validate.js'

const router = Router();

// Ruta GET para conseguir la información completa de certificados, cursos, estudiantes, secciones
router.get('/',
    auth.ensureAuthenticated,
    ctrl.getCertificadosData
)

// Ruta GET para que el estudiante consulte sus certificados
router.get('/student/',
    auth.ensureAuthenticated,
    ctrl.getCertificadosByStudent
)

// Ruta POST para crear un certificado
router.post('/student/:studentId/seccion/:seccionId',
    auth.ensureAuthenticated,
    validate.validateAndConvertId('studentId'),
    validate.validateAndConvertId('seccionId'),
    ctrl.createCertificado
)

// Ruta DELETE para eliminar un certificado
router.delete('/:certificadoId',
    auth.ensureAuthenticated,
    validate.validateAndConvertId('certificadoId'),
    ctrl.deleteCertificado
)

export default router;