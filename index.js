import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import consultaRoutes from './routes/consultaRoutes.js'
import appRoutes from './routes/appRoutes.js'
import db from './config/db.js'

//crear la app 
const app = express()

//habilitar lectura de datos del formulario
app.use(express.urlencoded({extended: true}))

//habilitar cookie parser
app.use(cookieParser())

//habilitar csrf
app.use(csrf({cookie: true}))

//conexion a la base de datos
try {
    await db.authenticate()
    db.sync()
    console.log('conexion satisfactoria a la base de datos');
} catch (error) {
    console.log(error);
}

//habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

//carpeta publica
app.use(express.static('public'))

//rounting
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)
app.use('/', consultaRoutes)

//definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`);
})