const express = require('express');
const router = express.Router();
const employees = {};

// GET /employee/id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (employees[id]) res.json(employees[id]);
  res.status(404).end();
});

// PUT /employee/id
router.put('/:id', (req, res) => {
  const { id } = req.params;

  if (employees[id]) {
    employees[id] = req.body;
    res.end();
  }
  res.status(404).end();
});

// DELETE /employee/id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  delete employees[id];
  res.end();
});

// POST /employee/id
router.post('/:id', (req, res) => {
  const { id } = req.params;

  employees[id] = req.body;
  res.end();
});

module.exports = router;
