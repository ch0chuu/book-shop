const express = require('express')
const router = express.Router()
const {
    getBooks,
    bookDetail
} = require('../controller/BookController')

router.use(express.json())



// 전체 도서 조회 및 카테고리별 도서 목록 조회회
router.get('/', getBooks)

// 개별 도서 조회
router.get('/:id', bookDetail)



module.exports = router
