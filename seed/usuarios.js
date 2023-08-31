import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'martin',
        email: 'martin@martin.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios