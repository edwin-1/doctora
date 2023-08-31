import {Sequelize} from 'sequelize'
import {Precio, Categoria, Consulta} from '../models/index.js'

const inicio = async(req, res) => {

    const [categorias, AMIAD, ADSSAD] = await Promise.all([
        Categoria.findAll({raw: true}),
        Consulta.findAll({
            limit: 3,
            where: {
                categoriaId: 1
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Consulta.findAll({
            limit: 3,
            where: {
                categoriaId: 2
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
    ])

    res.render('inicio', {
        pagina: 'Inicio',
        categorias,
        AMIAD,
        ADSSAD,
        csrfToken: req.csrfToken()
    })
}

const categoria = async(req, res) => {
    const {id} = req.params

    //comprobar que la categoria exista
    const categoria = await Categoria.findByPk(id)
    if(!categoria){
        return res.redirect('/404')
    }

    //obtener las consultas de la categoria
    const consultas = await Consulta.findAll({
        where: {
            categoriaId: id
        }
    })

    res.render('categoria', {
        pagina: `${categoria.nombre}`,
        consultas,
        csrfToken: req.csrfToken()
    })
}

const noEncontrado = (req, res) => {
    res.render('404', {
        pagina: 'No Encontrada',
        csrfToken: req.csrfToken()
    })
}

const buscador = async(req, res) => {

    const {termino} = req.body

    //validar que termino no este vacio
    if(!termino.trim()){
        return res.redirect('back')
    }

    //consultar las consultas
    const consultas = await Consulta.findAll({
        where: {
            titulo: {
                [Sequelize.Op.like]: '%' + termino + '%'
            }
        }
    })

    res.render('busqueda', {
        pagina: 'Resultado de la busqueda',
        consultas,
        csrfToken: req.csrfToken()        
    })
}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}