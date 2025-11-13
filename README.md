# float-script
Scripts for fixing float phases issue and managing Float API data.

## Prerequisites

1. Ensure you have Node.js installed on your system
2. Install dependencies by running: `npm install`
3. Create a `config.js` file with your Float API token:
   ```javascript
   module.exports = {
       TOKEN: 'your_float_api_token_here'
   };
   ```

## Available Scripts

### 1. Get All Projects
```bash
node getAllProjects.js
```
**Purpose:** Retrieves and displays all projects from your Float account. Shows project details including name, ID, status, active state, creation date, and tags.

### 2. Get All Projects and Their Phases
```bash
node getAllProjectsThenAllPhases.js
```
**Purpose:** Retrieves all projects from your Float account and fetches all phases for each project.

### 3. Get Phases by Project ID
```bash
node getPhasesByProjectId.js
```
**Purpose:** Retrieves phases for a specific project (currently configured to use `Scrum_Demo_Project_ID` from `projectIds.js`). Edit the `PROJECT_ID` variable or the project IDs in `projectIds.js` to target a different project.

### 4. Edit Project Phases Test
```bash
node editProjectPhasesTest.js
```
**Purpose:** A specialized script for testing phase fixes on a specific project (configured to use `Scrum_Demo_Project_ID` from `projectIds.js`). This script:
- Finds the target project from the specified page of projects
- Fetches all phases for that project
- Temporarily updates each phase's end date to a past date (2023-12-31)
- Restores the original end date for each phase
- Provides detailed logging for each operation including success/failure status
- Includes rate limiting to avoid API throttling
- Displays comprehensive summary and final phase states after all updates

### 5. Edit All Projects and Phases
```bash
node editAllProjectsPhases.js
```
**Purpose:** A comprehensive script that processes all projects in your Float account and fixes phase issues across all of them. This script:
- Retrieves all projects from your Float account (up to 1000 projects)
- For each project, fetches all associated phases
- Temporarily updates each phase's end date to a past date (2023-12-31)
- Restores the original end date for each phase
- Provides detailed logging and error handling for each operation
- Includes rate limiting to avoid API throttling
- Displays a comprehensive summary of all operations performed

### 6. Edit Project Phases by ID
```bash
node editProjectPhasesById.js
```
**Purpose:** A focused script for fixing phase issues on a specific project by directly using its project ID (currently configured to use `Sven_Test_Project_ID` from `projectIds.js`). This script:
- Fetches all phases for the specified project ID directly
- Temporarily updates each phase's end date to a past date (2023-12-31)
- Automatically adjusts start dates if they conflict with the temporary end date
- Restores the original end date and start date for each phase
- Provides detailed logging for each operation including success/failure status
- Includes rate limiting to avoid API throttling
- Displays comprehensive summary and fetches final phase states after all updates
- Ideal for testing phase fixes on individual projects without needing to search through all projects

### 7. Set All Project Phases End Date to End of 2025 (Except Shopware)
```bash
node setAllProjectsPhasesEndDateToEndOf2025ExceptSw.js
```
**Purpose:** A targeted script for updating all project phases to end on December 31, 2025, while excluding specific Shopware projects. This script:
- Retrieves all projects from a specified page (page variable must be changed in the script)
- Excludes predefined Shopware project IDs from processing (FELDHAUS, DIHK, SHOCKMANN, DEISS projects)
- Updates all phase end dates to 2025-12-31 for eligible projects
- Preserves all other phase properties (start date, name, budget, etc.)
- Provides comprehensive logging including skipped projects and reasons
- Includes rate limiting between operations to avoid API throttling
- Displays detailed summary of processed vs skipped projects and phase update statistics
- Fetches and displays updated phase states after all modifications
- Ideal for bulk updating project timelines while protecting critical Shopware infrastructure projects
