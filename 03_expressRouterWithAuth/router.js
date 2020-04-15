const express = require('express');
const projectRouter = require('./routes/project');
const employeeRouter = require('./routes/employee');
const router = express.Router();

router.use('/project', projectRouter);
router.use('/employee', employeeRouter);
router.get('*', (req, res) => res.sendFile(__dirname + '/pages/404.html'));

module.exports = router;
