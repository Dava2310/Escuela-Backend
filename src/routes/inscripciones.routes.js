import { Router } from "express"
import ctrl from "../controllers/inscripciones.controller.js"
import auth from "../middleware/auth.js"
import validate from "../middleware/validate.js"

const { validateAndConvertId } = validate

const router = Router();

// Ruta GET para conseguir todas las inscripciones
router.get('/', auth.ensureAuthenticated, ctrl.getInscripciones);

// Ruta GET para conseguir todas las inscripciones por el estudiante
router.get('/student/', auth.ensureAuthenticated, ctrl.getInscripcionesByStudent)

// Ruta GET para conseguir una inscripcion
router.get('/:inscripcionId', auth.ensureAuthenticated, validateAndConvertId('inscripcionId'), ctrl.getOneInscripcion);

// Ruta POST para que un estudiante se inscriba
router.post('/', auth.ensureAuthenticated, ctrl.createInscripcion);

// Ruta PATCH para modificar una inscripcion
// router.patch('/:inscripcionId', auth.ensureAuthenticated, validateAndConvertId('inscripcionId'), ctrl.updateInscripcion)

// Ruta DELETE para eliminar una inscripcion
router.delete('/:inscripcionId', auth.ensureAuthenticated, validateAndConvertId('inscripcionId'), ctrl.deleteInscripcion);

// Ruta GET para aprobar una inscripcion
router.get('/:inscripcionId/aprobar', auth.ensureAuthenticated, validateAndConvertId('inscripcionId'), ctrl.aprobarInscripcion)

// Ruta GET para no aprobar una inscripcion
router.get('/:inscripcionId/no_aprobar', auth.ensureAuthenticated, validateAndConvertId('inscripcionId'), ctrl.noAprobarInscripcion)

export default router;
