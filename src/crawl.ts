import { PlaywrightCrawler, type CheerioAPI } from 'crawlee';


async function getScript(path: string){
    return fetch(new URL(path, 'https://docs.strike.me')).then(resp => {
        if(resp.ok){
            return resp.text()
        }
        throw new Error(`Failed to fetch script ${path}`)
    })
}

async function getScriptFromTag($: CheerioAPI, urlContains: string){
    const urlPath = $(`script[src*="${urlContains}"]`).get(0)?.attribs.src
    if(urlPath === undefined) {
        throw new Error(`Could not find script tag with url containing ${urlContains}`)
    }

    return getScript(urlPath) 
}

const createCrawler = () => new PlaywrightCrawler({
    async requestHandler({ page, pushData, parseWithCheerio, log }) {
        console.log(`crawling ${page.url}...`)

        const $ = await parseWithCheerio()

        const runtimeScript = await getScriptFromTag($, '/runtime~main')

        const moduleIdToUrlSourceCode = runtimeScript.match(/[a-zA-Z]=>"assets\/js\/"\+.+?\+"\.js"/)?.[0]
        if(moduleIdToUrlSourceCode === undefined) {
            throw new Error('No mapper source code found')
        }

        function contentIdToModuleId(contentId: string){
            const moduleId = runtimeScript
                .match(new RegExp(`${contentId}"?:"\\d+"`))
                ?.[0].split(':')
                .at(-1)
                ?.replaceAll(`"`, '')
            
            if(moduleId === undefined) {
                throw new Error(`Could not find module id for content id ${contentId}`)
            }
            log.info(`Found module id ${moduleId} for content id ${contentId}`)
            return moduleId
        }
        
        async function moduleIdToUrl(moduleId: string){
            const url = await page.evaluate<string>(`(${moduleIdToUrlSourceCode})("${moduleId}")`)
            log.info(`Found url ${url} for module id ${moduleId}`)
            return url
        }

        async function loadContent(contentId: string){
            await moduleIdToUrl(contentIdToModuleId(contentId))
                .then(url => getScript(url))
                .then(script => page.evaluate(script))
            
            log.info(`Loaded content ${contentId}`)
        }

        const routes = await page.evaluate(() => {
            return window.webpackChunkstrike_dev_portal
                .flatMap(([_, moduleFac]) => Object.values(moduleFac))
                .map(fac => {
                    const e = { exports: {} as Record<string, { content: string }> };
                
                    try {
                        fac(e);
                    } catch {}
                
                    return e?.exports
                })
                .find(d => Object.keys(d ?? {}).some(k => k.startsWith('/api/')))
        })
        if (routes === undefined) {
            throw new Error('No routes found')
        }

        const apiContentIds = Object.entries(routes)
            .filter(([key, value]) => key.startsWith('/api/') && value.content !== undefined)
            .map(([_, value]) => value.content)
        
        
        await page.evaluate(() => window.webpackChunkstrike_dev_portal = [])

        for(const contentId of apiContentIds){
            await loadContent(contentId)
        }
        
        const specs = await page.evaluate(() => {
            return window.webpackChunkstrike_dev_portal
                .flatMap(([_, moduleFac]) => Object.values(moduleFac))
                .map(fac => {
                    let data: any;
                    const t: any = () => {}
                    t.r = () => {}
                    t.d = (_: any, def: any) => data = def
                
                    try {
                        fac(undefined, undefined, t);
                    } catch {}
                
                    return data?.metadata?.()?.api
                })
                .filter(d => d !== undefined)
        })

        await pushData(specs, 'spec')
        console.log(`Created ${specs.length} datasets`)
    },
    maxRequestsPerCrawl: 1,
    maxRequestRetries: 0,
});

export default async function crawl(mainPageUrl: string){
    return createCrawler().run([mainPageUrl])
}
