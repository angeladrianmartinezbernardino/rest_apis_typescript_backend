// Importamos dependencias.
import express from 'express'; // Importa el framework Express.
import colors from 'colors'; // Colores para logs en consola.
import cors, { CorsOptions } from 'cors'; // Middleware para habilitar CORS.
import morgan from 'morgan'; // Middleware para logs HTTP.
import swaggerUI from 'swagger-ui-express'; // Middleware para servir documentación Swagger.
import swaggerSpec, { swaggerUiOptions } from './config/swagger'; // Configuración de Swagger.
import router from './router'; // Importamos las rutas desde router.ts.
import db from './config/db'; // Base de datos configurada con Sequelize.

// Función asíncrona para conectar a la base de datos.
export async function connectDB() {
    try {
        await db.authenticate(); // Autentica la conexión a la BD.
        await db.sync(); // Sincroniza modelos con la BD.
        console.log(colors.blue.bold('Conectado a la BD.'));
    } catch (error) {
        console.log(colors.red.bold('Hubo un error al conectar a la BD.'), error); // Mensaje de error en consola.
    }
}

// Llamamos a la función de conexión a la base de datos.
connectDB();

// Creamos la instancia del servidor Express.
const servidor = express(); // Este será nuestro servidor.

// Obtenemos la URL permitida del entorno.
const url_permitida = process.env.FRONTED_URL; // Variable de entorno FRONTED_URL.

// Opciones de configuración para CORS.
const opciones_cors: CorsOptions = {
    origin: function (origin, callback) {
        // Permitimos peticiones desde el front-end en Vercel o sin origin (Postman/DevTools).
        if (!origin || origin === url_permitida) {
            callback(null, true); // Permitimos la petición.
        } else {
            callback(new Error('Error de CORS')); // Rechazamos otros orígenes.
        }
    },
    credentials: true, // Permitir envío de cookies y credenciales (opcional).
};

// Aplicamos el middleware CORS con las opciones definidas.
servidor.use(cors(opciones_cors));

// Middleware para poder leer el body en formato JSON.
servidor.use(express.json()); // Permite recibir datos en formato JSON desde el front-end.

// Middleware para log de peticiones HTTP.
servidor.use(morgan('dev')); // Registra las peticiones en la consola para debug.

// Rutas principales de la API.
// Nota: Las rutas se sirven en /api/products.
servidor.use('/api/products', router);

// Rutas para la documentación Swagger.
servidor.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, swaggerUiOptions));

// Exportamos el servidor para poder iniciarlo en index.ts.
export default servidor;
