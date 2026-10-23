const esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['browser/word-export.mjs'],bundle:true,platform:'browser',format:'iife',globalName:'WebEditorWord',target:['es2020'],minify:true,legalComments:'linked',outfile:'public/vendor/word-export.bundle.js'});
const fs=require('fs');
const license='public/vendor/word-export.bundle.js.LEGAL.txt';
if(fs.existsSync(license))fs.writeFileSync(license,fs.readFileSync(license,'utf8').split('\n').map(line=>line.trimEnd()).join('\n').trimEnd()+'\n');
