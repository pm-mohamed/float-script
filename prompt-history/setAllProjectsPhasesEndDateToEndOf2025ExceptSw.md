**Purpose:** 
Create A comprehensive script that processes all projects in your Float account and set all phases end date to end of 2025 except for the Shopware project. This script:
- Retrieves all projects from your Float account (up to 100 projects per page)(I will set the page number manually)
- For each project, fetches all associated phases (except for the Shopware projects with the following IDs (Ignore those projects): 
    const FELDHAUS_ID = 9416588; // Page 1 - FELD - Relaunch Shopware 6
    const FEILDHAUS_ONLINE_SHOP_OM_ID = 6257971; // Page 7 - FELD - Onlineshop - OM
    const FEILDHAUS_ONLINE_SHOP_ID = 6223460; // Page 7 - FELD - Onlineshop - Entwicklung


    const DIHK_AHK_ID = 10654825; // Page 1 - DIHK - AHK Netzwerk - Consulting
    const DIHK_RELAUNCH_ID = 9794749; // Page 1 - DIHK Relaunch
    const DIHK_OM_SEA_ID = 6257405; // Page 7 - DIHK - Onlineshop - OM SEA
    const DIHK_ONLINE_SHOP_ID = 6254225; // Page 7 - DIHK - Onlineshop - Entwicklung
    const DIHK_ONLINE_SHOP_OM_ID = 6223463; // Page 7 - DIHK - Onlineshop - OM

    const SHOCKMANN_ID = 6338192; // Page 7 - SCHO - Onlineshop - Entwicklung

    const DEISS_ONLINE_SHOP_ID = 9283805; // Page 1 - DEISS  - Online-Shop
    const DEISS_APP_ID = 6223468; // Page 7 - DEISS - APP - Entwicklung      
)
- you can import the projectIds.js file to get the project IDs to be excluded from the update operation
- set each phase's end date to end of 2025 (2025-12-31)
- if the phases response is empty or null, skip the project
- Provides detailed logging and error handling for each operation
- Includes rate limiting to avoid API throttling
- Displays a comprehensive summary of all operations performed