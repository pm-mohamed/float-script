// https://developer.float.com/api_reference.html#!/Projects/getProjects

const { TOKEN } = require('./config');
const axios = require('axios');
const page = 1; // (1-8)

// First, get all projects (including inactive ones with increased page size)
axios.get(`https://api.float.com/v3/projects?per_page=100&page=${page}`, {
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'Project Fetcher Script (admin@example.com)'
    }
})
.then(response => {
    console.log('All Projects:', response.data);
    
    // Extract project IDs from the response
    const projects = response.data.data || response.data;
    
    if (!projects || !Array.isArray(projects)) {
        console.log('No projects found or unexpected response format');
        return;
    }
    
    console.log(`Total projects retrieved: ${projects.length}`);
    
    // Create promises to fetch phases for each project
    const phasePromises = projects.map(project => {
        const projectId = project.project_id || project.id;
        
        return axios.get(`https://api.float.com/v3/phases?project_id=${projectId}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'User-Agent': 'Project Fetcher Script (admin@example.com)'
            }
        })
        .then(phaseResponse => {
            return {
                projectId: projectId,
                projectName: project.name,
                phases: phaseResponse.data
            };
        })
        .catch(phaseError => {
            // console.log(`Error fetching phases for project ${projectId}:`, phaseError.message);
            return {
                projectId: projectId,
                projectName: project.name,
                phases: null,
                error: phaseError.message
            };
        });
    });
    
    // Wait for all phase requests to complete
    return Promise.all(phasePromises);
})
.then(allProjectPhases => {
    if (allProjectPhases) {
        console.log('\n=== PROJECT PHASES ===');
        allProjectPhases.forEach(projectData => {
            console.log(`\nProject: ${projectData.projectName} (ID: ${projectData.projectId})`);
            if (projectData.phases) {
                console.log('Phases:', projectData.phases);
            } else {
                console.log('No phases found or error occurred:', projectData.error);
            }
        });
    }
})
.catch(error => {
    console.log('Error fetching projects:', error.message);
});
