import {unlink} from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Precio, Categoria, Consulta } from '../models/index.js'

const admin = async (req, res) => {

    //leer querystring
    const {pagina: paginaActual} = req.query

    const expresion = /^[1-8]$/

    if(!expresion.test(paginaActual)){
        return res.redirect('mis-consultas?pagina=1')
    }

    try {
        const { id } = req.usuario

        //limites y offset para el paginador
        const limit = 8
        const offset = ((paginaActual * limit) - limit)

        const [consultas, total] = await Promise.all([
            Consulta.findAll({
                limit,
                offset,
                where: {
                    usuarioId: id
                },
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio' }
                ],
            }),
            Consulta.count({
                where: {
                    usuarioId: id
                }
            })
        ])
    
        res.render('consultas/admin', {
            pagina: 'Mis Consultas',
            consultas,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })
    } catch (error) {
        console.log(error);
    }
}

//formulario para crear una consulta
const crear = async (req, res) => {

    //consultar modelo de precio y categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('consultas/crear', {
        pagina: 'Crear Consultas',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {

    //validacion 
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {

        //consultar modelo de precio y categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('consultas/crear', {
            pagina: 'Crear Consulta',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    //crear un registro
    const { titulo, descripcion, precio: precioId, categoria: categoriaId } = req.body

    const { id: usuarioId } = req.usuario

    try {
        const consultaGuardada = await Consulta.create({
            titulo,
            descripcion,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const { id } = consultaGuardada

        res.redirect(`/consultas/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error);
    }
}

const agregarImagen = async (req, res) => {

    const { id } = req.params

    //validar que la consulta exista
    const consulta = await Consulta.findByPk(id)

    if (!consulta) {
        return res.redirect('/mis-consultas')
    }

    //validar que la consulta no este publicado
    if (consulta.publicado) {
        return res.redirect('/mis-consultas')
    }

    //validar que la consulta pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== consulta.usuarioId.toString()) {
        return res.redirect('/mis-consultas')
    }

    res.render('consultas/agregar-imagen', {
        pagina: `Agregar Imagen: ${consulta.titulo}`,
        csrfToken: req.csrfToken(),
        consulta
    })
}

const almacenarImagen = async (req, res, next) => {

    const { id } = req.params

    //validar que la consulta exista
    const consulta = await Consulta.findByPk(id)

    if (!consulta) {
        return res.redirect('/mis-consultas')
    }

    //validar que la consulta no este publicado
    if (consulta.publicado) {
        return res.redirect('/mis-consultas')
    }

    //validar que la consulta pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== consulta.usuarioId.toString()) {
        return res.redirect('/mis-consultas')
    }

    try {
        //console.log(req.file);

        //almacenar la imagen y publicar propiedad
        consulta.imagen = req.file.filename
        consulta.publicado = 1

        await consulta.save()

        next()

    } catch (error) {
        console.log(error);
    }
}

const editar = async (req, res) => {

    const { id } = req.params

    //validar que la propiedad exista
    const consulta = await Consulta.findByPk(id)

    if (!consulta) {
        return res.redirect('/mis-consultas')
    }

    //revisar que quien visita la url, es quien crea la consulta
    if (consulta.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-consultas')
    }

    //consultar modelo de precio y categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('consultas/editar', {
        pagina: 'Editar Consultas',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: consulta
    })
}

const guardarCambios = async (req, res) => {

    //verificar la validacion
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {

        //consultar modelo de precio y categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('consultas/editar', {
            pagina: 'Editar Consultas',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params

    //validar que la propiedad exista
    const consulta = await Consulta.findByPk(id)

    if (!consulta) {
        return res.redirect('/mis-consultas')
    }

    //revisar que quien visita la url, es quien crea la consulta
    if(consulta.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-consultas')
    }

    //reescribir el objeto y actualizarlo
    try {

        const { titulo, descripcion, precio: precioId, categoria: categoriaId } = req.body
        
        consulta.set({
            titulo,
            descripcion,
            precioId,
            categoriaId
        })

        await consulta.save()

        res.redirect('/mis-consultas')

    } catch (error) {
        console.log(error);
    }

}

const eliminar = async(req, res) => {
    const { id } = req.params

    //validar que la propiedad exista
    const consulta = await Consulta.findByPk(id)

    if (!consulta) {
        return res.redirect('/mis-consultas')
    }

    //revisar que quien visita la url, es quien crea la consulta
    if (consulta.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-consultas')
    }

    //eliminar la imagen
    await unlink(`public/uploads/${consulta.imagen}`)

    console.log(`se elimino la imagen ${consulta.imagen}`);

    //eliminar la consulta
    await consulta.destroy()
    res.redirect('/mis-consultas')
}

//modifica el estado de la consulta
const cambiarEstado = async(req, res) => {
    
    const { id } = req.params

    //validar que la propiedad exista
    const consulta = await Consulta.findByPk(id)

    if (!consulta) {
        return res.redirect('/mis-consultas')
    }

    //revisar que quien visita la url, es quien crea la consulta
    if (consulta.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-consultas')
    }

    //actualizar
    consulta.publicado = !consulta.publicado

    await consulta.save()

    res.json({
        resultado: 'ok'
    })
}

//mostrar consultas
const mostrarConsulta = async(req, res) => {
    const {id} = req.params

    //comprobar que la propiedad exista
    const consulta = await Consulta.findByPk(id, {
        include : [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'}
        ]
    })

    if(!consulta || !consulta.publicado){
        return res.redirect('/404')
    }

    res.render('consultas/mostrar', {
        consulta,
        pagina: consulta.titulo,
        csrfToken: req.csrfToken()
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarConsulta
}