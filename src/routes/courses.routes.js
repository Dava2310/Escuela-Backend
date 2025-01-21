import { Router } from "express"
import ctrl from "../controllers/courses.controller.js"
import auth from "../middleware/auth.js"
import validate from "../middleware/validate.js"

const router = Router();

// Ruta GET para conseguir todos los cursos
router.get('/', auth.ensureAuthenticated, ctrl.getCourses)

// Ruta GET para conseguir todos los cursos y sus horarios
router.get('/schedules/', auth.ensureAuthenticated, ctrl.getCourses_Schedule)

// Ruta GET para conseguir información de un unico curso
router.get('/:courseId', auth.ensureAuthenticated, validate.validateAndConvertId('courseId'), ctrl.getOneCourse)

// Ruta POST para crear un curso
router.post('/', auth.ensureAuthenticated, ctrl.createCourse);

// Ruta PATCH para modificar a un curso
router.patch('/:courseId', auth.ensureAuthenticated, validate.validateAndConvertId('courseId'), ctrl.updateCourse);

// Ruta DELETE para eliminar a un curso
router.delete('/:courseId', auth.ensureAuthenticated, validate.validateAndConvertId('courseId'), ctrl.deleteCourse)

export default router;