const axios = require('axios');

const KESTRA_BASE_URL = 'http://localhost:8080/api/v1';
const KESTRA_NAMESPACE = 'ai-content';

async function triggerWorkflow(workflowId, inputs) {
    try {
        const triggerUrl = `${KESTRA_BASE_URL}/namespaces/${KESTRA_NAMESPACE}/flows/${workflowId}/trigger`;
        console.log('Triggering workflow at URL:', triggerUrl);

        const response = await axios.post(triggerUrl, { inputs });

        const executionId = response.data.id;
        if (!executionId) {
            throw new Error('No execution ID received from Kestra');
        }

        console.log('Workflow triggered successfully. Execution ID:', executionId);

        const result = await pollExecutionResult(executionId);
        return result;
    } catch (error) {
        console.error('Error triggering workflow:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function pollExecutionResult(executionId, maxAttempts = 20, intervalMs = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            console.log(`Polling execution ${executionId}, attempt ${attempt + 1}`);
            const response = await axios.get(`${KESTRA_BASE_URL}/executions/${executionId}`);

            const executionState = response.data.state;
            if (!executionState) {
                console.error('No state found in execution response:', response.data);
                throw new Error('Invalid execution state');
            }

            if (executionState.failed) {
                console.error('Execution failed:', response.data);
                throw new Error('Workflow execution failed');
            }

            if (executionState.terminated) {
                console.log('Execution terminated successfully.');
                return response.data.outputs || response.data;
            }

            await new Promise(resolve => setTimeout(resolve, intervalMs));
        } catch (error) {
            console.error(`Polling attempt ${attempt + 1} failed:`, error.message);

            if (attempt === maxAttempts - 1) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    }

    throw new Error('Max polling attempts reached');
}

module.exports = { triggerWorkflow };
