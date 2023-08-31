import Consulta from './Consulta.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'

//Precio.hasOne(Consulta)

Consulta.belongsTo(Precio, {foreignKey: 'precioId'})
Consulta.belongsTo(Categoria, {foreignKey: 'categoriaId'})
Consulta.belongsTo(Usuario, {foreignKey: 'usuarioId'})

export{
    Consulta,
    Precio,
    Categoria,
    Usuario
}