import express from 'express';
import pg from 'pg';

const router = express.Router();
const client = new pg.Client();

// Classic SQL injection pattern using direct user input concatenation in pg.query
router.get('/inject', (req, res) => {
  const userId = req.query.id;
  client.query(`SELECT * FROM users WHERE id = '${userId}'`, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(result?.rows);
    }
  });
});

export default router;
