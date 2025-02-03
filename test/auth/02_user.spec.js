import request from "supertest";
import app from "../../src/app.js";

describe("GET /api/users/current", () => {
    let accessToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NewPassword123*" })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;
    });

    test("Debe devolver los datos del usuario autenticado", async () => {
        const response = await request(app)
            .get("/api/users/current")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data).toHaveProperty("nombre");
        expect(response.body.body.data).toHaveProperty("email");
    });

    test("Debe fallar sin token (401 Unauthorized)", async () => {
        const response = await request(app).get("/api/users/current").expect(401);
        expect(response.body.error).toBe(true);
    });
});

describe("PATCH /api/users/current", () => {
    let accessToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NewPassword123*" })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;
    });

    test("Debe actualizar datos correctamente", async () => {
        const response = await request(app)
            .patch("/api/users/current")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ 
                nombre: "Daniel Alberto Modificado",
                apellido: 'Vetencourt Alvarez',
                email: 'dvetencourt23@gmail.com',
                cedula: "29517648",
                preguntaSeguridad: "¿Cual es tu color favorito?",
                respuestaSeguridad: "Amarillo" 
            })
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe("Actualización de datos exitosa.");
    });

    test("Debe fallar con datos inválidos (422 Unprocessable Entity)", async () => {
        const response = await request(app)
            .patch("/api/users/current")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ 
                nombre: "Daniel Alberto Modificado",
                apellido: 'Vetencourt Alvarez',
                email: 'correo',
                cedula: "29517648",
                preguntaSeguridad: "¿Cual es tu color favorito?",
                respuestaSeguridad: "Amarillo"  
            })
            .expect(422);

        expect(response.body.error).toBe(true);
    });

    test("Debe fallar si el correo ya está en uso (409 Conflict)", async () => {
        const response = await request(app)
            .patch("/api/users/current")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ 
                nombre: "Daniel Alberto Modificado",
                apellido: 'Vetencourt Alvarez',
                email: 'dvetencourt231001@gmail.com',
                cedula: "29517648",
                preguntaSeguridad: "¿Cual es tu color favorito?",
                respuestaSeguridad: "Amarillo"
            }) 
            .expect(409);

        expect(response.body.error).toBe(true);
    });
});

describe("PATCH /api/users/recover", () => {
    test("Debe enviar email correctamente", async () => {
        const response = await request(app)
            .patch("/api/users/recover")
            .send({ email: "dvetencourt23@gmail.com" })
            .expect(200);

        expect(response.body.error).toBe(false);
    });

    test("Debe fallar si el email no existe (404 Not Found)", async () => {
        const response = await request(app)
            .patch("/api/users/recover")
            .send({ email: "correo-inexistente@gmail.com" })
            .expect(404);

        expect(response.body.error).toBe(true);
    });
});

describe("GET /api/users/recover/:id", () => {
    test("Debe devolver la pregunta de seguridad", async () => {
        const response = await request(app)
            .get("/api/users/recover/1")
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.data.preguntaSeguridad).toBeDefined();
    });

    test("Debe fallar con ID inválido (422 Unprocessable Entity)", async () => {
        const response = await request(app)
            .get("/api/users/recover/abcd1234")
            .expect(400);

        expect(response.body.error).toBe(true);
    });
});

describe("PUT /api/users/recover", () => {
    test("Debe cambiar la contraseña correctamente", async () => {
        const response = await request(app)
            .put("/api/users/recover")
            .send({
                email: 'dvetencourt23@gmail.com',
                preguntaSeguridad: "¿Cual es tu color favorito?",
                respuestaSeguridad: "Amarillo",
                newPassword: "NuevaPassword123*",
                confirmPassword: "NuevaPassword123*",
            })
            .expect(200);

        expect(response.body.error).toBe(false);
    });

    test("Debe fallar con respuesta de seguridad incorrecta (401 Unauthorized)", async () => {
        const response = await request(app)
            .put("/api/users/recover")
            .send({
                email: 'dvetencourt23@gmail.com',
                preguntaSeguridad: "¿Cual es tu color favorito?",
                respuestaSeguridad: "Respuesta Incorrecta",
                newPassword: "NuevaPassword123*",
                confirmPassword: "NuevaPassword123*",
            })
            .expect(401);

        expect(response.body.error).toBe(true);
    });
});

describe("GET /api/users/", () => {
    let adminToken;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: "dvetencourt23@gmail.com", password: "NuevaPassword123*" })
            .expect(200);

        adminToken = adminLogin.body.body.data.accessToken;

    });

    test("Debe listar usuarios correctamente (solo admin)", async () => {
        const response = await request(app)
            .get("/api/users/")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
    });

});