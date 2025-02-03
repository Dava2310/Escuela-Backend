import request from "supertest";
import app from "../../src/app.js";

describe("GET /api/students", () => {
    let accessToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;
    });

    test("Debe devolver todos los estudiantes", async () => {
        const response = await request(app)
            .get("/api/students")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(Array.isArray(response.body.body.data)).toBe(true);
        expect(response.body.body.data[0]).toHaveProperty("id");
        expect(response.body.body.data[0]).toHaveProperty("nombre");
        expect(response.body.body.data[0]).toHaveProperty("email");
    });

    test("Debe fallar sin token (401 Unauthorized)", async () => {
        const response = await request(app)
            .get("/api/students")
            .expect(401);
        expect(response.body.error).toBe(true);
    });
});

describe("GET /api/students/:studentId", () => {
    let accessToken;
    let studentId;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;

        // Asumimos que ya tenemos un estudiante en la base de datos
        const studentResponse = await request(app)
            .get("/api/students")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        studentId = studentResponse.body.body.data[0].id; // Tomamos el primer estudiante
    });

    test("Debe devolver los detalles del estudiante", async () => {
        const response = await request(app)
            .get(`/api/students/${studentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data).toHaveProperty("id");
        expect(response.body.body.data).toHaveProperty("nombre");
        expect(response.body.body.data).toHaveProperty("email");
    });

    test("Debe fallar si el estudiante no existe (404 Not Found)", async () => {
        const response = await request(app)
            .get("/api/students/200")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(404);

        expect(response.body.error).toBe(true);
    });

    test("Debe fallar sin token (401 Unauthorized)", async () => {
        const response = await request(app)
            .get(`/api/students/${studentId}`)
            .expect(401);
        expect(response.body.error).toBe(true);
    });
});

describe("PATCH /api/students/:studentId", () => {
    let accessToken;
    let studentId;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;

        // Obtener un estudiante para actualizar
        const studentResponse = await request(app)
            .get("/api/students")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        studentId = studentResponse.body.body.data[0].id; // Tomamos el primer estudiante
    });

    test("Debe actualizar los datos del estudiante", async () => {
        const response = await request(app)
            .patch(`/api/students/${studentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                nombre: 'Juan Antonio Modificado',
                apellido: 'Gonzales Sanchez',
                email: 'juan@gmail.com',
                cedula: "21222333",
                direccion: "Direccion",
                numeroTelefono: "04249334420",
                fechaNacimiento: "07/01/1967",
            })
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Estudiante actualizado exitosamente.");
    });

    test("Debe fallar con datos inválidos (422 Unprocessable Entity)", async () => {
        const response = await request(app)
            .patch(`/api/students/${studentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                nombre: 'Juan Antonio Modificado',
                apellido: 'Gonzales Sanchez',
                email: 'juangmailcom',
                cedula: "21222333",
                direccion: "Direccion",
                numeroTelefono: "04249334420",
                fechaNacimiento: "07/01/1967",
            })
            .expect(422);

        expect(response.body.error).toBe(true);
    });

    test("Debe fallar si el estudiante no existe (404 Not Found)", async () => {
        const response = await request(app)
            .patch("/api/students/200")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                nombre: "Nuevo Estudiante",
                apellido: "Apellido",
                email: "nuevo@gmail.com",
                cedula: "29517648",
                direccion: "Nueva dirección",
                numeroTelefono: "1234567890",
                fechaNacimiento: "07/01/1967"
            })
            .expect(404);

        expect(response.body.error).toBe(true);
    });

    test("Debe fallar sin token (401 Unauthorized)", async () => {
        const response = await request(app)
            .patch(`/api/students/${studentId}`)
            .send({
                nombre: 'Juan Antonio Modificado',
                apellido: 'Gonzales Sanchez',
                email: 'juan23@gmail.com',
                cedula: "21222333",
                direccion: "Direccion",
                numeroTelefono: "04249334420",
                fechaNacimiento: "07/01/1967",
            })
            .expect(401);

        expect(response.body.error).toBe(true);
    });
});

