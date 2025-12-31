import { readdir, readFile, writeFile } from 'node:fs/promises';
import YAML from 'yaml'

interface ApiEndpoint {
    tags: string[];
    description: string;
    parameters: Record<string, unknown>[];
    responses: Record<string, unknown>;
    security: unknown[];
    method: string;
    path: string;
    servers: { url: string }[];
    securitySchemes: Record<string, unknown>;
    info: Record<string, unknown>;
    postman: {
        name: string
    };
}

function baseSpec(
    {
        info,
        servers,
        securitySchemes
    }: ApiEndpoint, 
    version: string
){
    return {
        openapi: '3.0.0',
        info: {
            ...info,
            version,
            description: undefined,
        },
        externalDocs: {
            description: 'Official API documentation',
            url: 'https://docs.strike.me/'
        },
        servers,
        components: {
            securitySchemes
        },
        paths: {}
    }
}

interface OADiscriminator {
    propertyName: string
    mapping: Record<string, string>
}

function isOneOfSubtree(subtree: any): subtree is { 
    oneOf: { discriminator: OADiscriminator }[]
    discriminator: OADiscriminator
} {
    return subtree?.oneOf !== undefined
}

function assembleOneOfSchemas(schema: any){
    function rewriteOneOfObject(oneOfObject: any){
        if (!isOneOfSubtree(oneOfObject)){
            if (Array.isArray(oneOfObject)){
                oneOfObject.forEach(rewriteOneOfObject)
            } else if (typeof oneOfObject === 'object') {
                Object.values(oneOfObject).forEach(rewriteOneOfObject)
            }
            return
        }
        
        Object.entries(oneOfObject.oneOf[0].discriminator.mapping).forEach(([_key, refPath], mappingIndex) => {
            const createComponentSchema = (path: string[], subtree: any) => {
                if (path.length > 1){
                    subtree[path[0]] ??= {}
                    createComponentSchema(path.slice(1), subtree[path[0]])
                    return
                }
                
                const { discriminator, ...onOfEntrySchema } = oneOfObject.oneOf[mappingIndex]
                subtree[path[0]] = onOfEntrySchema
            }
            createComponentSchema(refPath.split('/').slice(1), schema)
        })

        oneOfObject.discriminator = oneOfObject.oneOf[0].discriminator
        oneOfObject.oneOf = Object.values(oneOfObject.oneOf[0].discriminator.mapping).map(path => ({ $ref: path })) as any
    }

    rewriteOneOfObject(schema)
    return schema
}

export default async function assemble(props: {
    input: string, 
    output: string, 
    specVersion: string
}) {
    console.log('assembling datasets...')
    await readdir(new URL(props.input))
        .then(paths => Promise.all(paths.map(p => readFile(new URL(p, props.input), { encoding: 'utf-8' }))))
        .then(files => files
            .map<ApiEndpoint>(f => JSON.parse(f))
            .reduce(
                (spec, { path, method, tags, parameters, responses, postman, description, security }) => ({
                    ...spec,
                    paths: {
                        ...spec.paths,
                        [path]: {
                            ...spec.paths[path],
                            [method]: {
                                tags,
                                summary: postman.name,
                                description: description
                                    .replaceAll(/<div><p>Required scopes:<\/p>.*?<\/div>/gs, '')
                                    .trim() || undefined,
                                security,
                                parameters,
                                responses
                            }
                        }
                    }
                }), 
                baseSpec(JSON.parse(files[0]), props.specVersion)
            )
        )
        .then(spec => assembleOneOfSchemas(spec))
        .then(spec => writeFile(new URL(props.output), YAML.stringify(spec)))
    console.log(`Finished, see ${props.output}`)
}