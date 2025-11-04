// https://developer.float.com/api_reference.html#!/Projects/getProjects

const { TOKEN } = require('./config');
const axios = require('axios');

// First, get all projects (including inactive ones with increased page size)
axios.get('https://api.float.com/v3/projects?per_page=1000', {
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'Project Fetcher Script (admin@example.com)'
    }
})
.then(response => {
    // console.log('All Projects:', response.data);
    
    // Extract project IDs from the response
    const projects = response.data.data || response.data;
    
    if (!projects || !Array.isArray(projects)) {
        console.log('No projects found or unexpected response format');
        return;
    }
    
    console.log(`Total projects retrieved: ${projects.length}`);
    
    // Find the specific project with ID 10766714
    const targetProjectId = 10766714;
    const targetProject = projects.find(project => {
        const projectId = project.project_id || project.id;
        return projectId == targetProjectId;
    });
    
    if (!targetProject) {
        console.log(`Project with ID ${targetProjectId} not found`);
        return null;
    }
    
    console.log(`Found target project: ${targetProject.name} (ID: ${targetProjectId})`);
    
    // Fetch phases only for the target project
    return axios.get(`https://api.float.com/v3/phases?project_id=${targetProjectId}`, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'User-Agent': 'Project Fetcher Script (admin@example.com)'
        }
    })
    .then(phaseResponse => {
        return [{
            projectId: targetProjectId,
            projectName: targetProject.name,
            phases: phaseResponse.data
        }];
    })
    .catch(phaseError => {
        console.log(`Error fetching phases for project ${targetProjectId}:`, phaseError.message);
        return [{
            projectId: targetProjectId,
            projectName: targetProject.name,
            phases: null,
            error: phaseError.message
        }];
    });
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
