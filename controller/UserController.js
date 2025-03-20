const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes') 
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const dotenv = require('dotenv')
dotenv.config()


const join = (req, res) => {
    const { email, password } = req.body

    // 비밀번호 암호화
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');


    let sql = 'INSERT INTO users (email, password, salt) VALUES (?, ?, ?)'
    let values = [email, hashPassword,salt]

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end() // BAD REQUEST
        }

        res.status(StatusCodes.CREATED).json(results)
    })    
}

const login = (req, res) => {
    const { email, password } = req.body

    let sql = 'SELECT * FROM users WHERE email = ?'
    let values = [email]

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        if (results.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        const loginUser = results[0]
        const salt = loginUser.salt
        const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64')

        if (loginUser.password === hashPassword) {
            const token = jwt.sign(
                { email: loginUser.email }, 
                process.env.PRIVATE_KEY,   
                { expiresIn: '5m', issuer: 'sujeong' }
            )

            res.cookie('token', token, {
                httpOnly: true
            })

            return res.status(StatusCodes.OK).end()
        } else {
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
    })
}


const passwordResetRequest = (req, res) => {
    const { email } = req.body

    let sql = 'SELECT * FROM users WHERE email = ?'
    conn.query(sql, email, 
        (err, result) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const user = result [0]
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email: email
                })
                
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end()
            }
        }
    )
}

const passwordReset = (req, res) => {
    const { email, password } = req.body

    let sql = 'SELECT * FROM users WHERE email = ?'
    conn.query(sql, [email], (err, result) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        if (result.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        // 새로운 salt 생성 후 비밀번호 해싱
        const salt = crypto.randomBytes(10).toString('base64')
        const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64')

        let updateSql = 'UPDATE users SET password = ?, salt = ? WHERE email = ?'
        let values = [hashPassword, salt, email]

        conn.query(updateSql, values, (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            if (results.affectedRows == 0) {
                return res.status(StatusCodes.BAD_REQUEST).end()
            } else {
                return res.status(StatusCodes.OK).end()
            }
        })
    })
}


module.exports = {
    join,
    login,
    passwordReset,
    passwordResetRequest
}