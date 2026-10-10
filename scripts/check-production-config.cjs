const {loadEnvConfig}=require('@next/env');
const {loadEngine}=require('./load-engine.cjs');
loadEnvConfig(process.cwd(),false);
process.env.REQUIRE_PRODUCTION_URL='true';
const {SITE_URL}=loadEngine('lib/site.ts');
console.log('Production origin validated: '+SITE_URL);
