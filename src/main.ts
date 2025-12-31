import assemble from './assemble.ts';
import crawl from './crawl.ts';

const specVersion = process.argv[2]

if(specVersion === undefined){
    console.error('Please specify a version for the spec.')
    process.exit(1)
}

console.log(`setting up spec with version ${specVersion}...`)

await crawl('https://docs.strike.me/api')
await assemble({
    input: import.meta.resolve('../storage/datasets/spec/'),
    output: import.meta.resolve('../strike-openapi.yaml'),
    specVersion
})