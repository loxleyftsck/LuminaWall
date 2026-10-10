const {spawnSync}=require('node:child_process');
require('./check-production-config.cjs');
const result=spawnSync(process.execPath,['-r','./windows-readlink-patch.js','node_modules/next/dist/bin/next','build'],{stdio:'inherit',env:process.env});
if(result.error)throw result.error;
process.exitCode=result.status??1;
