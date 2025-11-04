// https://developer.float.com/api_reference.html#!/Projects/getProjects

const { TOKEN } = require('./config');
const axios = require('axios');

axios.get('https://api.float.com/v3/projects', {
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'Project Fetcher Script (admin@example.com)'
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.log(error);
});
