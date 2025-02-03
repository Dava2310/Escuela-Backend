import request from "supertest";
import app from '../../src/app.js'

describe('POST /register', () => {

    describe('Datos Validos', () => {

        // Datos de prueba para el registro
        const newAdmin = {
            nombre: 'Daniel Alberto',
            apellido: 'Vetencourt Alvarez',
            email: 'dvetencourt23@gmail.com',
            password: 'Daniel231001*',
            tipoUsuario: "administrador",
            cedula: "29517648"
        };

        const newTeacher = {
            nombre: 'Armando Antonio',
            apellido: 'Chirivella Colmenares',
            email: 'dvetencourt231001@gmail.com',
            cedula: "29517649",
            tipoUsuario: "profesor",
            profesion: "Ingeniero en Sistemas",
            direccion: "Direccion",
            numeroTelefono: "04249334420",
            fechaNacimiento: "1967-01-07",
        };

        const newStudent = {
            nombre: 'Juan Antonio',
            apellido: 'Gonzales Sanchez',
            email: 'juan@gmail.com',
            password: 'Juan1234*',
            cedula: "21222333",
            tipoUsuario: "estudiante",
            direccion: "Direccion",
            numeroTelefono: "04249334420",
            fechaNacimiento: "1967-01-07",
        }

        test('Registra un administrador exitosamente.', async () => {

            // Haciendo la solicitud POST a /register
            const response = await request(app)
                .post('/api/auth/register')
                .send(newAdmin)
                .expect(201);

            // Verificar que la respuesta sea como se espera
            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(201);
            expect(response.body.body.message).toBe('Usuario registrado exitosamente.');
        });
        
        test('Registra un profesor exitosamente', async() => {
            // Haciendo la solicitud POST a /register
            const response = await request(app)
                .post('/api/auth/register')
                .send(newTeacher)
                .expect(201);

            // Verificar que la respuesta sea como se espera
            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(201);
            expect(response.body.body.message).toBe('Usuario registrado exitosamente.');
        })

        test('Registra un estudiante exitosamente', async() => {
            // Haciendo la solicitud POST a /register
            const response = await request(app)
                .post('/api/auth/register')
                .send(newStudent)
                .expect(201);

            // Verificar que la respuesta sea como se espera
            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(201);
            expect(response.body.body.message).toBe('Usuario registrado exitosamente.');
        })
    })



});

describe('POST /login', () => {

    describe('Dando correctas credenciales', () => {
        test('Se logea exitosamente', async () => {
            const loginData = {
                email: 'dvetencourt23@gmail.com',
                password: 'Daniel231001*'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(200);
            expect(response.body.body.data).toHaveProperty('accessToken');
            expect(response.body.body.data).toHaveProperty('refreshToken');
        });
    })

    describe('Dando incorrectas credenciales', () => {
        test('No se puede logear', async () => {
            const loginData = {
                email: 'testuser@example.com',
                password: 'WrongPassword!'
            };
    
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
    
            expect(response.body.error).toBe(true);
            expect(response.body.statusCode).toBe(401);
            expect(response.body.body.message).toBe('El correo o la contraseña es inválida.');
        });
    })
});

describe('POST /refresh-token', () => {
    let refreshToken; // Guardaremos el refresh token para pruebas

    beforeAll(async () => {
        // Primero iniciamos sesión para obtener un refresh token válido
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'dvetencourt23@gmail.com',
                password: 'Daniel231001*'
            })
            .expect(200);

        refreshToken = loginResponse.body.body.data.refreshToken;
    });

    test('Refresca el token de acceso exitosamente', async () => {
        const response = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken })
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.status).toBe(200);
        expect(response.body.body.accessToken).toBeDefined();
        expect(response.body.body.newRefreshToken).toBeDefined();
    });

    test('Falla cuando no se proporciona un refresh token', async () => {
        const response = await request(app)
            .post('/api/auth/refresh-token')
            .send({})
            .expect(401);

        expect(response.body.error).toBe(true);
        expect(response.body.body.message).toBe('Refresh token not found');
    });
});

describe('GET /logout', () => {
    let accessToken; 

    beforeAll(async () => {
        // Primero iniciamos sesión para obtener un token de acceso
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'dvetencourt23@gmail.com',
                password: 'Daniel231001*'
            })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;
    });

    test('Cierra sesión exitosamente', async () => {
        const response = await request(app)
            .get('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(204);

        expect(response.body).toEqual({});
    });

    test('Falla si se intenta cerrar sesión sin un token', async () => {
        const response = await request(app)
            .get('/api/auth/logout')
            .expect(401);

        expect(response.body.error).toBe(true);
    });
});

describe('PATCH /changePassword', () => {
    let accessToken; 

    beforeAll(async () => {
        // Obtener token de acceso iniciando sesión
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'dvetencourt23@gmail.com',
                password: 'Daniel231001*'
            })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;
    });

    test('Cambia la contraseña exitosamente', async () => {
        const response = await request(app)
            .patch('/api/auth/changePassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                currentPassword: 'Daniel231001*',
                newPassword: 'NewPassword123*',
                confirmPassword: 'NewPassword123*'
            })
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe('Contraseña actualizada correctamente.');
    });

    test('Falla cuando la contraseña actual es incorrecta', async () => {
        const response = await request(app)
            .patch('/api/auth/changePassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                currentPassword: 'WrongPassword123!',
                newPassword: 'NewPassword123*',
                confirmPassword: 'NewPassword123*'
            })
            .expect(409);

        expect(response.body.error).toBe(true);
        expect(response.body.body.message).toBe('La contraseña actual no es correcta.');
    });

    test('Falla cuando las contraseñas nuevas no coinciden', async () => {
        const response = await request(app)
            .patch('/api/auth/changePassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                currentPassword: 'Daniel231001*',
                newPassword: 'NewPassword123*',
                confirmPassword: 'DifferentPassword456*'
            })
            .expect(422);

        expect(response.body.error).toBe(true);
        expect(response.body.body.message).toBe('\"confirmPassword\" must be [ref:newPassword]');
    });
});

describe('GET /verify-token', () => {
    let accessToken;

    beforeAll(async () => {
        // Obtener token de acceso iniciando sesión
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'dvetencourt23@gmail.com',
                password: 'NewPassword123*'
            })
            .expect(200);

        accessToken = loginResponse.body.body.data.accessToken;

    });

    test('Verifica la validez del token exitosamente', async () => {
        const response = await request(app)
            .get('/api/auth/verify-token')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.body.message).toBe('Token is valid');
    });

    test('Falla cuando el token no es proporcionado', async () => {
        const response = await request(app)
            .get('/api/auth/verify-token')
            .expect(401);

        expect(response.body.error).toBe(true);
    });

    test('Falla cuando el token es inválido', async () => {
        const response = await request(app)
            .get('/api/auth/verify-token')
            .set('Authorization', 'Bearer InvalidToken123')
            .expect(401);

        expect(response.body.error).toBe(true);
    });
});
