import { Router } from "express"
import ctrl from '../controllers/secciones.controller.js'
import auth from "../middleware/auth.js"
import validate from "../middleware/validate.js"

const router = Router();

// Ruta GET para conseguir las secciones de un profesor
router.get('/teacher/', auth.ensureAuthenticated, ctrl.getTeacherSections)

// Ruta POST para crear una seccion
router.post('/', auth.ensureAuthenticated, ctrl.createSeccion);

// Ruta GET para conseguir las secciones de un curso
router.get('/:cursoId', auth.ensureAuthenticated, validate.validateAndConvertId('cursoId'), ctrl.getSecciones)

// Ruta GET para conseguir los estudiantes de un curso
router.get('/:seccionId/students', auth.ensureAuthenticated, validate.validateAndConvertId('seccionId'), ctrl.getStudents);

// Ruta GET para aprobar a un estudiante
router.get('/:seccionId/student/:studentId/aprobar',
    auth.ensureAuthenticated,
    validate.validateAndConvertId('seccionId'),
    validate.validateAndConvertId('studentId'),
    ctrl.aprobarEstudiante
);

// Ruta GET para aprobar a un estudiante
router.get('/:seccionId/student/:studentId/reprobar',
    auth.ensureAuthenticated,
    validate.validateAndConvertId('seccionId'),
    validate.validateAndConvertId('studentId'),
    ctrl.reprobarEstudiante
);

export default router;