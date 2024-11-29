const express = require("express");
const router = express.Router();
const { triggerWorkflow } = require('../services/kestra');

router.post('/generate', async (req, res) => {
    const { topic, tone, style } = req.body;
    try {
        const response = await triggerWorkflow('content-generation', { topic, tone, style });
        res.status(200).json({ content: response });
    } catch (error) {
        console.error("Workflow error:",error);
        res.status(500).json({ error: 'Workflow execution failed', details: error.message });
    }
});


module.exports = router;