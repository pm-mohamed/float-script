// https://developer.float.com/api_reference.html#!/Projects/getProjects

const { TOKEN } = require('./config');
const axios = require('axios');

axios.get('https://api.float.com/v1/projects', {
    headers: {
        'Authorization': `Bearer ${TOKEN}`
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.log(error);
});
