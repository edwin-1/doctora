import express from 'express'
import {body} from 'express-validator'
import { admin, crear, guardar, 
    agregarImagen, almacenarImagen, editar,
    guardarCambios, eliminar, mostrarConsulta,
    cambiarEstado
} from '../controllers/consultaController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'

const router = express.Router()

router.get('/mis-consultas', protegerRuta, admin)
router.get('/consultas/crear', protegerRuta, crear)
router.post('/consultas/crear', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El Titulo de la consulta es obligatoria'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion no puede ir vacia')
        .isLength({max: 250}).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    guardar
)

router.get('/consultas/agregar-imagen/:id', 
    protegerRuta,
    agregarImagen
)

router.post('/consultas/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/consultas/editar/:id',
    protegerRuta,
    editar
)

router.post('/consultas/editar/:id', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El Titulo de la consulta es obligatoria'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion no puede ir vacia')
        .isLength({max: 250}).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    guardarCambios
)

router.post('/consultas/eliminar/:id', protegerRuta, eliminar)

router.put('/consultas/:id', protegerRuta, cambiarEstado)

router.get('/consulta/:id', mostrarConsulta)

export default router