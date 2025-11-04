// Get all projects from Float API
// https://developer.float.com/api_reference.html#!/Projects/getProjects

const { TOKEN } = require('./config');
const axios = require('axios');
const page = 1; // (1-8)

// First, get all projects (including inactive ones with increased page size)
axios.get(`https://api.float.com/v3/projects?per_page=1000&page=${page}`, {
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'Project Fetcher Script (admin@example.com)'
    }
})
.then(response => {
    console.log('All Projects:', response.data);
    
    // Extract project data from the response
    const projects = response.data.data || response.data;
    
    if (!projects || !Array.isArray(projects)) {
        console.log('No projects found or unexpected response format');
        return;
    }
    
    console.log(`Total projects retrieved: ${projects.length}`);
    
    // Display project information
    projects.forEach((project, index) => {
        const projectId = project.project_id || project.id;
        console.log(`${index + 1}. Project: ${project.name} (ID: ${projectId})`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Active: ${project.active}`);
        console.log(`   Created: ${project.created}`);
        if (project.tags && project.tags.length > 0) {
            console.log(`   Tags: ${project.tags.join(', ')}`);
        }
        console.log('');
    });
})
.catch(error => {
    console.log('Error fetching projects:', error.message);
    if (error.response && error.response.data) {
        console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
});
