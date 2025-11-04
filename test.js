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
    .then(async phaseResponse => {
        const phases = phaseResponse.data.data || phaseResponse.data;
        
        if (!phases || !Array.isArray(phases)) {
            console.log('No phases found or unexpected response format');
            return [{
                projectId: targetProjectId,
                projectName: targetProject.name,
                phases: null
            }];
        }

        console.log(`Found ${phases.length} phases for project ${targetProjectId}`);
        
        // Store original end dates and update phases
        const phaseUpdates = [];
        const pastDate = '2023-12-31'; // Use a past date, but ensure it's reasonable
        
        for (const phase of phases) {
            const phaseId = phase.phase_id || phase.id;
            const originalEndDate = phase.end_date;
            
            console.log(`\nProcessing Phase ID: ${phaseId}`);
            console.log(`Original end date: ${originalEndDate}`);
            
            try {
                // First update: set end_date to past date
                console.log(`Updating phase ${phaseId} end date to past date: ${pastDate}`);
                console.log(`Current start date: ${phase.start_date}`);
                
                // Ensure start_date is before end_date
                const adjustedStartDate = new Date(phase.start_date) > new Date(pastDate) ? '2023-01-01' : phase.start_date;
                
                const updatePayload = {
                    name: phase.name,
                    project_id: phase.project_id,
                    start_date: adjustedStartDate,
                    end_date: pastDate,
                    notes: phase.notes || '',
                    color: phase.color,
                    budget_total: phase.budget_total,
                    default_hourly_rate: phase.default_hourly_rate,
                    non_billable: phase.non_billable,
                    tentative: phase.tentative,
                    status: phase.status,
                    active: phase.active
                };
                
                console.log(`Using start_date: ${adjustedStartDate}, end_date: ${pastDate}`);
                
                await axios.put(`https://api.float.com/v3/phases/${phaseId}`, updatePayload, {
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`,
                        'User-Agent': 'Project Fetcher Script (admin@example.com)',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`✓ Phase ${phaseId} updated with past date`);
                
                // Wait a moment between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Second update: restore original end_date
                console.log(`Restoring phase ${phaseId} end date to original: ${originalEndDate}`);
                
                const restorePayload = {
                    name: phase.name,
                    project_id: phase.project_id,
                    start_date: phase.start_date,
                    end_date: originalEndDate,
                    notes: phase.notes || '',
                    color: phase.color,
                    budget_total: phase.budget_total,
                    default_hourly_rate: phase.default_hourly_rate,
                    non_billable: phase.non_billable,
                    tentative: phase.tentative,
                    status: phase.status,
                    active: phase.active
                };
                
                await axios.put(`https://api.float.com/v3/phases/${phaseId}`, restorePayload, {
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`,
                        'User-Agent': 'Project Fetcher Script (admin@example.com)',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`✓ Phase ${phaseId} restored to original end date`);
                
                phaseUpdates.push({
                    phaseId: phaseId,
                    originalEndDate: originalEndDate,
                    status: 'success'
                });
                
            } catch (error) {
                console.log(`✗ Error updating phase ${phaseId}:`, error.message);
                if (error.response && error.response.data) {
                    console.log('Error details:', JSON.stringify(error.response.data, null, 2));
                }
                console.log('Failed payload:', JSON.stringify(updatePayload, null, 2));
                phaseUpdates.push({
                    phaseId: phaseId,
                    originalEndDate: originalEndDate,
                    status: 'error',
                    error: error.message
                });
            }
            
            // Wait between phase processing to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return [{
            projectId: targetProjectId,
            projectName: targetProject.name,
            phases: phases,
            phaseUpdates: phaseUpdates
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
        console.log('\n=== PROJECT PHASES PROCESSING COMPLETE ===');
        allProjectPhases.forEach(projectData => {
            console.log(`\nProject: ${projectData.projectName} (ID: ${projectData.projectId})`);
            
            if (projectData.phases) {
                console.log(`Total phases processed: ${projectData.phases.length}`);
                
                if (projectData.phaseUpdates) {
                    console.log('\n=== PHASE UPDATE SUMMARY ===');
                    const successful = projectData.phaseUpdates.filter(update => update.status === 'success');
                    const failed = projectData.phaseUpdates.filter(update => update.status === 'error');
                    
                    console.log(`✓ Successfully updated: ${successful.length} phases`);
                    console.log(`✗ Failed to update: ${failed.length} phases`);
                    
                    if (failed.length > 0) {
                        console.log('\nFailed updates:');
                        failed.forEach(update => {
                            console.log(`  - Phase ${update.phaseId}: ${update.error}`);
                        });
                    }
                    
                    console.log('\nAll phase updates (set to past date then restored):');
                    projectData.phaseUpdates.forEach(update => {
                        console.log(`  - Phase ${update.phaseId}: ${update.status} (original end date: ${update.originalEndDate})`);
                    });
                }
                
                // Fetch and log the current state of all phases after updates
                console.log('\n=== FETCHING UPDATED PHASES ===');
                return axios.get(`https://api.float.com/v3/phases?project_id=${projectData.projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`,
                        'User-Agent': 'Project Fetcher Script (admin@example.com)'
                    }
                })
                .then(updatedPhaseResponse => {
                    const updatedPhases = updatedPhaseResponse.data.data || updatedPhaseResponse.data;
                    
                    if (updatedPhases && Array.isArray(updatedPhases)) {
                        console.log('\n=== CURRENT PHASE DATA AFTER ALL UPDATES ===');
                        updatedPhases.forEach((phase, index) => {
                            const phaseId = phase.phase_id || phase.id;
                            console.log(`\n${index + 1}. Phase: ${phase.name} (ID: ${phaseId})`);
                            console.log(`   Start Date: ${phase.start_date}`);
                            console.log(`   End Date: ${phase.end_date}`);
                            console.log(`   Status: ${phase.status}`);
                            console.log(`   Active: ${phase.active}`);
                            console.log(`   Budget Total: ${phase.budget_total}`);
                            console.log(`   Default Hourly Rate: ${phase.default_hourly_rate}`);
                            console.log(`   Non-billable: ${phase.non_billable}`);
                            console.log(`   Tentative: ${phase.tentative}`);
                            if (phase.notes) {
                                console.log(`   Notes: ${phase.notes}`);
                            }
                        });
                        
                        console.log(`\n=== TOTAL UPDATED PHASES: ${updatedPhases.length} ===`);
                    } else {
                        console.log('Unable to fetch updated phases or unexpected response format');
                    }
                })
                .catch(fetchError => {
                    console.log('Error fetching updated phases:', fetchError.message);
                });
            } else {
                console.log('No phases found or error occurred:', projectData.error);
            }
        });
    }
})
.catch(error => {
    console.log('Error fetching projects:', error.message);
});
