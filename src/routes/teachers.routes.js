import { Router } from "express";
import ctrl from "../controllers/teachers.controller.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// Ruta GET para todos los Profesores
router.get("/", auth.ensureAuthenticated, ctrl.getTeachers);

// Ruta GET para un profesor por su ID
router.get("/:teacherId", auth.ensureAuthenticated, validate.validateAndConvertId('teacherId'), ctrl.getOneTeacher);

// Ruta PATCH para modificar a un profesor
router.patch("/:teacherId", auth.ensureAuthenticated, validate.validateAndConvertId('teacherId'), ctrl.updateTeacher);

// Ruta DELETE para eliminar a un profesor
router.delete("/:teacherId", auth.ensureAuthenticated, validate.validateAndConvertId('teacherId'), ctrl.deleteTeacher);

export default router;