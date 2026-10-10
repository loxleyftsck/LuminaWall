const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadEngine}=require('../scripts/load-engine.cjs');
const {resolveSiteURL}=loadEngine('lib/site.ts');
test('public origin is normalized consistently',()=>{assert.equal(resolveSiteURL('https://wallpapers.company.com/'), 'https://wallpapers.company.com');assert.equal(resolveSiteURL('http://localhost:3000'),'http://localhost:3000');});
test('origin refuses unsupported protocol and misleading URL parts',()=>{for(const value of ['garbage','file:///tmp','ftp://company.com','https://user:secret@company.com','https://company.com/studio','https://company.com?q=x','https://company.com#x'])assert.throws(()=>resolveSiteURL(value));});
test('production refuses local, insecure and placeholder domains',()=>{for(const value of ['http://company.com','https://localhost','https://127.0.0.1','https://192.168.1.2','https://[::1]','https://intranet','https://your-domain.example','https://example.com','https://ci.luminawall.test','https://demo.example.org'])assert.throws(()=>resolveSiteURL(value,{requirePublicOrigin:true}));assert.equal(resolveSiteURL('https://wallpapers.company.com',{requirePublicOrigin:true}),'https://wallpapers.company.com');});
