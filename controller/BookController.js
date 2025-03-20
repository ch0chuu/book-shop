const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes') 

const getBooks = (req, res) => {
    const { category_id } = req.query
    let sql = 'SELECT * FROM books'
    let values = []

    if (category_id) {
        sql += ' WHERE category_id = ?'
        values.push(category_id)
    }

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
        return res.status(StatusCodes.OK).json(results)
    })
}


const bookDetail = (req, res) => {
    const { id } = req.params
    let sql = 'SELECT * FROM books WHERE id = ?'
    
    conn.query(sql, id, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
        if (results.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
        res.status(StatusCodes.OK).json(results[0])
    })
}


module.exports = {
    getBooks,
    booksByCategory
}


