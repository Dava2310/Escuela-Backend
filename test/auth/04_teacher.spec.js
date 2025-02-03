import request from "supertest";
import app from "../../src/app.js";

describe("GET /api/teachers", () => {
    let adminToken;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;
    });

    test("Debe listar todos los profesores correctamente (solo admin)", async () => {
        const response = await request(app)
            .get("/api/teachers")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data).toBeInstanceOf(Array);
        expect(response.body.body.data.length).toBeGreaterThan(0);
    });

    test("Debe fallar si no se proporciona token (401 Unauthorized)", async () => {
        const response = await request(app).get("/api/teachers").expect(401);
        expect(response.body.error).toBe(true);
    });
});

describe("GET /api/teachers/:teacherId", () => {
    let adminToken;
    let teacherId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

        // Aquí, deberías insertar un profesor para obtener un ID válido de profesor
        const response = await request(app)
            .get("/api/teachers")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);
        
        teacherId = response.body.body.data[0].id; // Suponiendo que obtienes un profesor para la prueba
    });

    test("Debe devolver los datos del profesor correctamente", async () => {
        const response = await request(app)
            .get(`/api/teachers/${teacherId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data).toHaveProperty("id", teacherId);
        expect(response.body.body.data).toHaveProperty("nombre");
        expect(response.body.body.data).toHaveProperty("apellido");
    });

    test("Debe fallar si el ID del profesor no existe (404 Not Found)", async () => {
        const response = await request(app)
            .get("/api/teachers/99999")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(404);

        expect(response.body.error).toBe(true);
    });
});

describe("PATCH /api/teachers/:teacherId", () => {
    let adminToken;
    let teacherId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

        // Insertar un profesor para obtener un ID válido de profesor
        const response = await request(app)
            .get("/api/teachers")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        teacherId = response.body.body.data[0].id; // Suponiendo que obtienes un profesor para la prueba
    });

    test("Debe actualizar los datos del profesor correctamente", async () => {
        const response = await request(app)
            .patch(`/api/teachers/${teacherId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                nombre: "Nuevo Nombre",
                apellido: "Nuevo Apellido",
                email: "nuevoemail@gmail.com",
                cedula: "12345678",
                profesion: "Profesor de Matemáticas",
                direccion: "Calle Ficticia 123",
                numeroTelefono: "1234567890",
                fechaNacimiento: "01/01/1980"
            })
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Profesor actualizado correctamente.");
    });

    test("Debe fallar si los datos son inválidos (422 Unprocessable Entity)", async () => {
        const response = await request(app)
            .patch(`/api/teachers/${teacherId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                nombre: "",  // Nombre inválido
                apellido: "Nuevo Apellido",
                email: "noesunemail",  // Email inválido
                cedula: "12345678",
                profesion: "Profesor de Matemáticas",
                direccion: "Calle Ficticia 123",
                numeroTelefono: "1234567890",
                fechaNacimiento: "01/01/1980"
            })
            .expect(422);

        expect(response.body.error).toBe(true);
    });
});

describe("DELETE /api/teachers/:teacherId", () => {
    let adminToken;
    let teacherId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

        // Insertar un profesor para obtener un ID válido de profesor
        const response = await request(app)
            .get("/api/teachers")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        teacherId = response.body.body.data[0].id; // Suponiendo que obtienes un profesor para la prueba
    });

    test("Debe eliminar un profesor correctamente", async () => {
        const response = await request(app)
            .delete(`/api/teachers/${teacherId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Profesor eliminado correctamente.");
    });

    test("Debe fallar si el ID del profesor no existe (404 Not Found)", async () => {
        const response = await request(app)
            .delete("/api/teachers/99999")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(404);

        expect(response.body.error).toBe(true);
    });
});
