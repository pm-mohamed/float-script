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

### 1. Get All Projects and Their Phases
```bash
node getAllProjectsThenAllPhases.js
```
**Purpose:** Retrieves all projects from your Float account and fetches all phases for each project.

### 2. Get Phases by Project ID
```bash
node getPhasesByProjectId.js
```
**Purpose:** Retrieves phases for a specific project (currently hardcoded to project ID 10766714). Edit the `PROJECT_ID` variable in the file to target a different project.

### 3. Edit Sven Test Project
```bash
node editSvenTestProject.js
```
**Purpose:** A specialized script for fixing phases in a specific project (ID: 10766714). This script:
- Finds the target project
- Temporarily updates each phase's end date to a past date
- Restores the original end date
- This process helps resolve certain Float API issues with phase dates

### 4. Edit All Projects and Phases
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
