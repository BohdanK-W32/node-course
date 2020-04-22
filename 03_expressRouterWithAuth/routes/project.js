const express = require('express');
const router = express.Router();
const projects = {};

// GET /project/id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (projects[id]) res.json(projects[id]);
  res.status(404).end();
});

// PUT /project/id
router.put('/:id', (req, res) => {
  const { id } = req.params;

  if (projects[id]) {
    projects[id] = req.body;
    res.end();
  }
  res.status(404).end();
});

// DELETE /project/id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  delete projects[id];
  res.end();
});

// POST /project/id
router.post('/:id', (req, res) => {
  const { id } = req.params;

  projects[id] = req.body;
  res.end();
});

module.exports = router;
