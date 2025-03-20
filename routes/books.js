const express = require('express')
const router = express.Router()

router.use(express.json())

// 전체 도서 조회
router.get('/', (req, res) => {
    res.json('전체 도서 조회')
})

// 개별 도서 조회
router.get('/:id', (req, res) => {
    res.json('개별 도서 조회')
})

// 카테고리별 도서 목록 조회
router.get('/', (req, res) => {
    const category = req.query.category // 요청에서 category 파라미터 추출

    if (category) {
        res.json(`카테고리별 도서 목록 조회 - 카테고리: ${category}`)
    } else {
        res.json('전체 도서 조회')
    }
})

module.exports = router
