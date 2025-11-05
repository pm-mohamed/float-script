// /phases?project_id={project_id}
// Retrieve phases for a specific project.

const { TOKEN } = require('./config');
const { FELDHAUS_ID } = require('./projectIds');
const axios = require('axios');
const PROJECT_ID = FELDHAUS_ID;

// Fetch phases for the specific project
axios.get(`https://api.float.com/v3/phases?project_id=${PROJECT_ID}`, {
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'Project Fetcher Script (admin@example.com)'
    }
})
.then(response => {
    console.log(`Phases for Project ID ${PROJECT_ID}:`);
    console.log(JSON.stringify(response.data, null, 2));
})
.catch(error => {
    console.log(`Error fetching phases for project ${PROJECT_ID}:`, error.message);
});
