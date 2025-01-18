import { Router } from "express";
import ctrl from "../controllers/students.controller.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// Ruta GET para todos los Estudiantes
router.get("/", auth.ensureAuthenticated, ctrl.getStudents);

// Ruta GET para un estudiante por su ID
router.get("/:studentId", auth.ensureAuthenticated, validate.validateAndConvertId('studentId'), ctrl.getOneStudent);

// Ruta PATCH para modificar a un estudiante
router.patch("/:studentId", auth.ensureAuthenticated, validate.validateAndConvertId('studentId'), ctrl.updateStudent);

// Ruta DELETE para eliminar a un estudiante
router.delete("/:studentId", auth.ensureAuthenticated, validate.validateAndConvertId('studentId'), ctrl.deleteStudent);

export default router;