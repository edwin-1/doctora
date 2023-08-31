import path from 'path'

export default {
    mode: 'development',
    entry: {
        agregarImagen: './src/js/agregarImagen.js',
        cambiarEstado: './src/js/cambiarEstado.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve('public/js')
    }
}