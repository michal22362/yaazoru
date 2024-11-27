import { createSchema } from "./schema"

createSchema();
(async()=>{
    try {
        console.log('build schema---------------------');
        
        await createSchema();
        console.log("Schema creation completed. Starting app...");
    } catch (err) {
        console.error("Error during schema creation", err);
    }
})();

