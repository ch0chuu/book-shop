const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes') 

const getBooks = (req, res) => {
    const { category_id, news, page, limit } = req.query

   
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const offset = (pageNumber - 1) * limitNumber

    let sql = `
        SELECT b.*, c.name AS category_name 
        FROM books b
        JOIN category c ON b.category_id = c.id
    `
    
    let values = []
    let conditions = []

   
    if (category_id) {
        conditions.push("b.category_id = ?")
        values.push(category_id)
    }

    
    if (news) {
        conditions.push("b.pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()")
    }

    
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ")
    }

    
    sql += " ORDER BY b.pub_date DESC LIMIT ? OFFSET ?"
    values.push(limitNumber, offset)

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Database error" })
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
    bookDetail
}


