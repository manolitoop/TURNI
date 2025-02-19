const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Para permitir peticiones desde el frontend
const path = require('path');
const app = express();
const port = 3000;
const secretKey = "secreto_super_seguro"; // Clave secreta para JWT


const formatTime = (time) => {
    if (!time) return null; // Si es undefined o null, devuelve null
    
    // Intenta extraer solo la parte de la hora si es una cadena más larga
    const match = time.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/); 
    if (!match) return null; // Si no es un formato válido, devuelve null

    const [_, hh, mm, ss] = match;
    return `${hh}:${mm}:${ss || '00'}`; // Asegura que tenga segundos
};

app.use(express.json());
app.use(cors()); // Permitir peticiones desde otros dominios

// Configuración de conexión con SQL Server
const config = {
    user: 'sa',
    password: '1234',
    server: 'localhost',
    database: 'registro',
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};

// Conexión con SQL Server
sql.connect(config)
    .then(pool => console.log("Conexión exitosa a SQL Server"))
    .catch(err => console.log("Error de conexión: ", err));

// 🔹 **Ruta para registrar usuario**
app.post('/register', async (req, res) => {
    const { nombre, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await sql.connect(config);

        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('role', sql.NVarChar, role || 'user') // Si no manda rol, por defecto es usuario estándar
            .query(`
                INSERT INTO Usuarios (nombre, email, password, role)
                VALUES (@nombre, @email, @password, @role)
            `);

        res.json({ message: "Usuario registrado correctamente" });
    } catch (err) {
        console.error("Error al registrar usuario:", err);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});
app.post('/guardarTurno', async (req, res) => {
    const { responsable, horaInicio, cargo, observaciones, horaFin } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('responsable', sql.NVarChar, responsable)
            .input('horaInicio', sql.NVarChar, horaInicio)
            .input('cargo', sql.NVarChar, cargo)
            .input('observaciones', sql.NVarChar, JSON.stringify(observaciones))  // Convertir a JSON
            .input('horaFin', sql.NVarChar, horaFin)
            .query(`
                INSERT INTO Turnos (responsable, horaInicio, cargo, observaciones, horaFin)
                VALUES (@responsable, @horaInicio, @cargo, @observaciones, @horaFin)
            `);

        res.json({ message: 'Turno registrado correctamente' });
    } catch (err) {
        console.error('Error al guardar el turno:', err);
        res.status(500).json({ error: 'Error al registrar turno' });
    }
});



// 🔹 **Ruta para login**
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM Usuarios WHERE email = @email");

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, nombre: user.nombre },
            secretKey,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login exitoso", token, role: user.role });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

// 🔹 **Middleware para verificar JWT**
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "No autorizado" });

    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.user = decoded; // Guardar datos del usuario en la petición
        next();
    });
};

app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Redirigir a `login.html` cuando se acceda a la raíz (`/`)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 🔹 **Ruta protegida (Ejemplo)**
app.get('/perfil', verifyToken, (req, res) => {
    res.json({ message: "Acceso permitido", user: req.user });
});

// 🔹 **Iniciar servidor**
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}/login.html`);
});
