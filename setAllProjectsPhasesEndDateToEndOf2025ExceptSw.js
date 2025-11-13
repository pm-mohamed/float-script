// Script: Set all project phases end date to end of 2025 except Shopware projects
// https://developer.float.com/api_reference.html#!/Projects/getProjects

const { TOKEN } = require('./config');
const {
    FELDHAUS_ID,
    FEILDHAUS_ONLINE_SHOP_OM_ID,
    FEILDHAUS_ONLINE_SHOP_ID,
    DIHK_AHK_ID,
    DIHK_RELAUNCH_ID,
    DIHK_OM_SEA_ID,
    DIHK_ONLINE_SHOP_ID,
    DIHK_ONLINE_SHOP_OM_ID,
    SHOCKMANN_ID,
    DEISS_ONLINE_SHOP_ID,
    DEISS_APP_ID
} = require('./projectIds');
const axios = require('axios');
const page = 8; // (1-8 MUST BE CHANGED)

// Excluded project IDs (Shopware projects)
const EXCLUDED_PROJECT_IDS = [
    FELDHAUS_ID,
    FEILDHAUS_ONLINE_SHOP_OM_ID,
    FEILDHAUS_ONLINE_SHOP_ID,
    DIHK_AHK_ID,
    DIHK_RELAUNCH_ID,
    DIHK_OM_SEA_ID,
    DIHK_ONLINE_SHOP_ID,
    DIHK_ONLINE_SHOP_OM_ID,
    SHOCKMANN_ID,
    DEISS_ONLINE_SHOP_ID,
    DEISS_APP_ID
];

// Target end date for all phases (end of 2025)
const TARGET_END_DATE = '2025-12-31';

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
    
    // Create promises to fetch and edit phases for each project
    const projectProcessingPromises = projects.map(async (project) => {
        const projectId = project.project_id || project.id;
        
        // Check if this project should be excluded (Shopware projects)
        if (EXCLUDED_PROJECT_IDS.includes(projectId)) {
            console.log(`\n=== SKIPPING Project: ${project.name} (ID: ${projectId}) - Shopware project excluded ===`);
            return {
                projectId: projectId,
                projectName: project.name,
                skipped: true,
                reason: 'Shopware project excluded',
                phases: null,
                phaseUpdates: []
            };
        }
        
        console.log(`\n=== Processing Project: ${project.name} (ID: ${projectId}) ===`);
        
        try {
            // Fetch phases for this project
            const phaseResponse = await axios.get(`https://api.float.com/v3/phases?project_id=${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'User-Agent': 'Project Fetcher Script (admin@example.com)'
                }
            });
            
            const phases = phaseResponse.data.data || phaseResponse.data;
            
            if (!phases || !Array.isArray(phases) || phases.length === 0) {
                console.log(`No phases found for project ${projectId} - skipping project`);
                return {
                    projectId: projectId,
                    projectName: project.name,
                    phases: null,
                    skipped: true,
                    reason: 'No phases found',
                    phaseUpdates: []
                };
            }

            console.log(`Found ${phases.length} phases for project ${projectId}`);
            
            // Update phases end dates to 2025-12-31
            const phaseUpdates = [];
            
            for (const phase of phases) {
                const phaseId = phase.phase_id || phase.id;
                const originalEndDate = phase.end_date;
                
                console.log(`\nProcessing Phase ID: ${phaseId}`);
                console.log(`Original end date: ${originalEndDate}`);
                
                try {
                    // Update phase end date to TARGET_END_DATE (2025-12-31)
                    console.log(`Updating phase ${phaseId} end date from ${originalEndDate} to ${TARGET_END_DATE}`);
                    
                    const updatePayload = {
                        name: phase.name,
                        project_id: phase.project_id,
                        start_date: phase.start_date,
                        end_date: TARGET_END_DATE,
                        notes: phase.notes || '',
                        color: phase.color,
                        budget_total: phase.budget_total,
                        default_hourly_rate: phase.default_hourly_rate,
                        non_billable: phase.non_billable,
                        tentative: phase.tentative,
                        status: phase.status,
                        active: phase.active
                    };
                    
                    await axios.put(`https://api.float.com/v3/phases/${phaseId}`, updatePayload, {
                        headers: {
                            'Authorization': `Bearer ${TOKEN}`,
                            'User-Agent': 'Project Fetcher Script (admin@example.com)',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log(`✓ Phase ${phaseId} end date updated successfully to ${TARGET_END_DATE}`);
                    
                    phaseUpdates.push({
                        phaseId: phaseId,
                        originalEndDate: originalEndDate,
                        newEndDate: TARGET_END_DATE,
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
                        newEndDate: TARGET_END_DATE,
                        status: 'error',
                        error: error.message
                    });
                }
                
                // Wait between phase processing to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            return {
                projectId: projectId,
                projectName: project.name,
                phases: phases,
                phaseUpdates: phaseUpdates
            };
            
        } catch (phaseError) {
            console.log(`Error fetching phases for project ${projectId}:`, phaseError.message);
            return {
                projectId: projectId,
                projectName: project.name,
                phases: null,
                error: phaseError.message,
                phaseUpdates: []
            };
        }
    });
    
    // Wait for all project processing to complete
    return Promise.all(projectProcessingPromises);
})
.then(async (allProjectResults) => {
    if (allProjectResults) {
        console.log('\n=== ALL PROJECTS PROCESSING COMPLETE ===');
        
        let totalProjectsRetrieved = 0;
        let totalProjectsProcessed = 0;
        let totalProjectsSkipped = 0;
        let totalPhasesProcessed = 0;
        let totalSuccessfulUpdates = 0;
        let totalFailedUpdates = 0;
        let skippedProjects = [];
        
        for (const projectData of allProjectResults) {
            totalProjectsRetrieved++;
            
            console.log(`\n=== Project: ${projectData.projectName} (ID: ${projectData.projectId}) ===`);
            
            // Check if project was skipped
            if (projectData.skipped) {
                totalProjectsSkipped++;
                skippedProjects.push({
                    name: projectData.projectName,
                    id: projectData.projectId,
                    reason: projectData.reason
                });
                console.log(`SKIPPED: ${projectData.reason}`);
                continue;
            }
            
            totalProjectsProcessed++;
            
            if (projectData.phases) {
                totalPhasesProcessed += projectData.phases.length;
                console.log(`Total phases processed: ${projectData.phases.length}`);
                
                if (projectData.phaseUpdates && projectData.phaseUpdates.length > 0) {
                    const successful = projectData.phaseUpdates.filter(update => update.status === 'success');
                    const failed = projectData.phaseUpdates.filter(update => update.status === 'error');
                    
                    totalSuccessfulUpdates += successful.length;
                    totalFailedUpdates += failed.length;
                    
                    console.log(`✓ Successfully updated: ${successful.length} phases`);
                    console.log(`✗ Failed to update: ${failed.length} phases`);
                    
                    if (failed.length > 0) {
                        console.log('Failed updates:');
                        failed.forEach(update => {
                            console.log(`  - Phase ${update.phaseId}: ${update.error}`);
                        });
                    }
                }
                
                // Fetch and log the current state of all phases after updates
                try {
                    console.log('=== FETCHING UPDATED PHASES ===');
                    const updatedPhaseResponse = await axios.get(`https://api.float.com/v3/phases?project_id=${projectData.projectId}`, {
                        headers: {
                            'Authorization': `Bearer ${TOKEN}`,
                            'User-Agent': 'Project Fetcher Script (admin@example.com)'
                        }
                    });
                    
                    const updatedPhases = updatedPhaseResponse.data.data || updatedPhaseResponse.data;
                    
                    if (updatedPhases && Array.isArray(updatedPhases)) {
                        console.log('=== CURRENT PHASE DATA AFTER ALL UPDATES ===');
                        updatedPhases.forEach((phase, index) => {
                            const phaseId = phase.phase_id || phase.id;
                            console.log(`${index + 1}. Phase: ${phase.name} (ID: ${phaseId})`);
                            console.log(`   Start Date: ${phase.start_date}`);
                            console.log(`   End Date: ${phase.end_date}`);
                            console.log(`   Status: ${phase.status}`);
                            console.log(`   Active: ${phase.active}`);
                        });
                    } else {
                        console.log('Unable to fetch updated phases or unexpected response format');
                    }
                } catch (fetchError) {
                    console.log('Error fetching updated phases:', fetchError.message);
                }
            } else {
                console.log('No phases found or error occurred:', projectData.error);
            }
            
            // Wait between projects to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Final summary
        console.log('\n=== FINAL SUMMARY ===');
        console.log(`Total projects retrieved: ${totalProjectsRetrieved}`);
        console.log(`Total projects processed: ${totalProjectsProcessed}`);
        console.log(`Total projects skipped: ${totalProjectsSkipped}`);
        console.log(`Total phases processed: ${totalPhasesProcessed}`);
        console.log(`Total successful phase updates to ${TARGET_END_DATE}: ${totalSuccessfulUpdates}`);
        console.log(`Total failed phase updates: ${totalFailedUpdates}`);
        
        if (skippedProjects.length > 0) {
            console.log('\n=== SKIPPED PROJECTS DETAIL ===');
            skippedProjects.forEach((project, index) => {
                console.log(`${index + 1}. ${project.name} (ID: ${project.id}) - ${project.reason}`);
            });
        }
        
        console.log('\n=== PROCESSING COMPLETE ===');
        console.log(`All eligible project phases have been updated to end on ${TARGET_END_DATE}`);
    }
})
.catch(error => {
    console.log('Error fetching projects:', error.message);
});
