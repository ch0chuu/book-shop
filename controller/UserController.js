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
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '서버 오류' })
        }

        if (results.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: '이메일이 존재하지 않습니다.' })
        }

        const loginUser = results[0] 
        if (loginUser && loginUser.password === password) {
          
            const token = jwt.sign(
                { email: loginUser.email }, 
                process.env.PRIVATE_KEY,   
                { expiresIn: '5m', issuer: 'sujeong' }
            )

            
            res.cookie('token', token, {
                httpOnly: true
            })

            console.log(token)

            return res.status(StatusCodes.OK).json(results)
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end()
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

    let sql = 'UPDATE users SET password = ? WHERE email = ?'
    let values = [password, email]

    conn.query(sql, values, 
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            if (results.affectedRows == 0) 
                return res.status(StatusCodes.BAD_REQUEST).end()
            else
                return res.status(StatusCodes.OK).json(results)
        }
    )
}

module.exports = {
    join,
    login,
    passwordReset,
    passwordResetRequest
}