import Joi from "joi"

import responds from '../red/responds.js';
// --------------------
// Prisma Module
// --------------------
import prisma from '../../prisma/prismaClient.js'

import schema from '../validations/certificateValidation.js'

const getCertificadosData = async (req, res) => {
    try {
        // 1. Obtener los cursos
        const cursos = await prisma.cursos.findMany({
            select: {
                id: true,
                nombre: true,
                codigo: true,
            },
        });

        // 2. Obtener las secciones agrupadas por curso
        const secciones = await prisma.seccion.findMany({
            select: {
                id: true,
                codigo: true,
                cursoId: true,
            },
        });

        const seccionesPorCurso = cursos.reduce((acc, curso) => {
            acc[curso.id] = secciones.filter((seccion) => seccion.cursoId === curso.id);
            return acc;
        }, {});

        // 3. Obtener los estudiantes agrupados por sección
        const estudiantesSeccion = await prisma.estudiante_Seccion.findMany({
            select: {
                idEstudiante: true,
                idSeccion: true,
                aprobado: true,
                estudiante: {
                    select: {
                        id: true,
                        usuario: {
                            select: {
                                nombre: true,
                                apellido: true,
                                email: true,
                                cedula: true,
                            },
                        },
                    },
                },
            },
        });

        const estudiantesPorSeccion = secciones.reduce((acc, seccion) => {
            acc[seccion.id] = estudiantesSeccion
                .filter((es) => es.idSeccion === seccion.id)
                .map((es) => ({
                    id: es.estudiante.id,
                    nombre: es.estudiante.usuario.nombre,
                    apellido: es.estudiante.usuario.apellido,
                    correo: es.estudiante.usuario.email,
                    cedula: es.estudiante.usuario.cedula,
                    estado: es.aprobado ? "Aprobado" : "Reprobado", // Mapea aprobado a "Aprobado" o "Reprobado"
                }));
            return acc;
        }, {});

        // 4. Obtener los certificados existentes
        const certificados = await prisma.certificado.findMany({
            select: {
                id: true,
                titulo: true,
                fechaExpedicion: true,
                seccion: {
                    select: {
                        codigo: true,
                    },
                },
                estudiante: {
                    select: {
                        usuario: {
                            select: {
                                cedula: true,
                            },
                        },
                    },
                },
            },
        });

        const certificadosMapped = certificados.map((cert) => ({
            id: cert.id,
            titulo: cert.titulo,
            fechaExpedicion: cert.fechaExpedicion.toISOString(),
            codigoSeccion: cert.seccion.codigo,
            cedulaEstudiante: cert.estudiante.usuario.cedula,
        }));

        // Respuesta JSON
        return responds.success(req, res, {
            cursos,
            secciones: seccionesPorCurso,
            estudiantes: estudiantesPorSeccion,
            certificados: certificadosMapped,
        }, 200);
    } catch (error) {
        console.error("Error al obtener los datos de certificados:", error);
        return responds.error(req, res, { message: "Error al obtener los datos de certificados" }, 500);
    }
};


const getCertificadosByStudent = async (req, res) => {
    try {
        
        const userId = req.user.id;

        const student = await prisma.estudiante.findFirst({
            where: {
                usuarioId: userId
            }
        })

        if (!student) {
            return responds.error(req, res, { message: 'Ha sucedido un error. Intente de nuevo.'}, 500);
        }

        const certificates = await prisma.certificado.findMany({
            where: {
                estudianteId: student.id
            },
            include: {
                seccion: {
                    include: {
                        curso: true
                    }
                }
            }
        })

        for (let certificate of certificates) {
            certificate.nombreCurso = certificate.seccion.curso.nombre;
        }

        return responds.success(req, res, { data: certificates }, 200);

    } catch (error) {
       return responds.error(req, res, { message: error.message}, 500); 
    }
}

const createCertificado = async (req, res) => {
    try {

        const { studentId, seccionId } = req.params;

        const student = await prisma.estudiante.findFirst({
            where: {
                AND: [
                    { usuario: { deletedAt: null } },
                    { id: studentId }
                ]
            },
            include: {
                usuario: true
            }
        })

        if (!student) {
            return responds.error(req, res, { message: 'Estudiante no encontrado.' }, 404);
        }

        const seccion = await prisma.seccion.findFirst({
            where: {
                id: seccionId
            }
        })

        if (!seccion) {
            return responds.error(req, res, { message: 'Sección no encontrada.' }, 404);
        }

        const data = await schema.certificate.validateAsync(req.body);

        const newCertificate = await prisma.certificado.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                fechaExpedicion: new Date(data.fechaExpedicion),
                seccionId: seccion.id,
                estudianteId: student.id
            }
        })

        return responds.success(req, res, { message: 'Certificado generado exitosamente.', data: newCertificate}, 200);

    } catch (error) {

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.message }, 422)
        }

        return responds.error(req, res, { message: error.message }, 500);
    }
}

const deleteCertificado = async (req, res) => {
    try {
        const { certificadoId } = req.params;

        // Buscar el certificado por ID
        const certificado = await prisma.certificado.findFirst({
            where: {
                id: certificadoId,
            },
        });

        if (!certificado) {
            return responds.error(req, res, { message: 'Certificado no encontrado.' }, 404);
        }

        // Eliminar el certificado
        await prisma.certificado.delete({
            where: {
                id: certificadoId,
            },
        });

        return responds.success(req, res, { message: 'Certificado eliminado exitosamente.' }, 200);
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500);
    }
};

export default {
    getCertificadosData,
    createCertificado,
    deleteCertificado,
    getCertificadosByStudent
};