import request from "supertest";
import app from "../../src/app.js";

describe("POST /api/courses", () => {
    let adminToken;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;
    });

    test("Debe crear un nuevo curso correctamente", async () => {
        const newCourse = {
            codigo: "MAT101",
            nombre: "Matemáticas Básicas",
            categoria: "Ciencia de Datos",
            descripcion: "6 semanas"
        };

        const response = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(newCourse)
            .expect(201);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Curso creado exitosamente.");
        expect(response.body.body.data).toHaveProperty("codigo", "MAT101");
    });

    test("Debe fallar si el código del curso ya está en uso (409 Conflict)", async () => {
        const newCourse = {
            codigo: "MAT101",  // Suponiendo que ya existe un curso con este código
            nombre: "Matemáticas Avanzadas",
            categoria: "Ciencia de Datos",
            descripcion: "8 semanas"
        };

        const response = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(newCourse)
            .expect(409);

        expect(response.body.error).toBe(true);
    });
});

describe("GET /api/courses", () => {
    let adminToken;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;
    });

    test("Debe listar todos los cursos correctamente", async () => {
        const response = await request(app)
            .get("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data).toBeInstanceOf(Array);
        expect(response.body.body.data.length).toBeGreaterThan(0);
    });

    test("Debe fallar si no se proporciona token (401 Unauthorized)", async () => {
        const response = await request(app).get("/api/courses").expect(401);
        expect(response.body.error).toBe(true);
    });
});

describe("GET /api/courses/:courseId", () => {
    let adminToken;
    let courseId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

        // Insertar un curso para obtener un ID válido
        const response = await request(app)
            .get("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        courseId = response.body.body.data[0].id; // Suponiendo que obtienes un curso para la prueba
    });

    test("Debe devolver el curso correctamente", async () => {
        const response = await request(app)
            .get(`/api/courses/${courseId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data).toHaveProperty("id", courseId);
    });

    test("Debe fallar si el curso no existe (404 Not Found)", async () => {
        const response = await request(app)
            .get("/api/courses/99999")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(404);

        expect(response.body.error).toBe(true);
    });
});

describe("PATCH /api/courses/:courseId", () => {
    let adminToken;
    let courseId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

        // Insertar un curso para obtener un ID válido
        const response = await request(app)
            .get("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        courseId = response.body.body.data[0].id; // Suponiendo que obtienes un curso para la prueba
    });

    test("Debe actualizar un curso correctamente", async () => {
        const updatedCourse = {
            nombre: "Matemáticas Intermedias",
            categoria: "Programacion",
            codigo: "MAT101"
        };

        const response = await request(app)
            .patch(`/api/courses/${courseId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(updatedCourse)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Curso modificado exitosamente.");
    });
});

describe("DELETE /api/courses/:courseId", () => {
    let adminToken;
    let courseId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

        // Insertar un curso para obtener un ID válido
        const response = await request(app)
            .get("/api/courses")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        courseId = response.body.body.data[0].id; // Suponiendo que obtienes un curso para la prueba
    });

    test("Debe eliminar un curso correctamente", async () => {
        const response = await request(app)
            .delete(`/api/courses/${courseId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Curso eliminado exitosamente.");
    });

    test("Debe fallar si el curso no existe (404 Not Found)", async () => {
        const response = await request(app)
            .delete("/api/courses/99999")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(404);

        expect(response.body.error).toBe(true);
    });
});

