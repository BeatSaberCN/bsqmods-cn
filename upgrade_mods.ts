import * as https from "node:https";
import {ManagedModJson, type ModItem, type ModJson} from "./mod_types.ts"
import { globSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildConfig } from "./build_info.ts";

function get_mod_json():Promise<ModJson>{
    return new Promise<ModJson>((resolve,reject)=>{
        https.get("https://mods.bsquest.xyz/mods.json", (resp)=>{
            let data = ""
            resp.on("data", (d)=>data += d)
            resp.on("end",()=>{
                resolve(JSON.parse(data))
            })
            resp.on("error",(err)=>reject(err))
        })
    })
}

function get_versions_json():Promise<string>{
    return new Promise<string>((resolve,reject)=>{
        https.get("https://mods.bsquest.xyz/versions.json", (resp)=>{
            let data = ""
            resp.on("data", (d)=>data += d)
            resp.on("end",()=>{
                resolve(data)      
            })
            resp.on("error",(err)=>reject(err))
        })
    })
}

function add_cn_mods(mod_json:ModJson){
    // 塞入硬编码的中文mod
    {
        for(const version_folder of globSync("cn_mods/*")){
            const game_version = version_folder.substring("cn_mods/".length)

            const mod_json_for_this_version = []
            for(const mod_json_file of globSync(join(version_folder, "*.json"))){
                const mod:ModItem = JSON.parse(readFileSync(mod_json_file, {encoding:"utf-8"}));
                // deno-lint-ignore no-explicit-any
                (mod as any)._isAddedByCNSource = true
                mod_json_for_this_version.push(mod)
            }
            mod_json_for_this_version.sort((a,b)=>{
                const as = a.version.split(".")
                const bs = b.version.split(".")
                for(let i=0;i<as.length && i<bs.length;i++){
                    if(+as[i] < +bs[i]){
                        return -1
                    }
                    if(+as[i] > +bs[i])
                        return 1
                }
                if(as.length < bs.length)
                    return -1
                if(as.length > bs.length)
                    return 1
                return 0
            })

            for(const mod of mod_json_for_this_version)
                mod_json[game_version].push(mod)
        }
    }
}

if(import.meta.main){

    {
        const buildTime = new Date()
        buildConfig.buildTime = buildTime.toString()
        buildConfig.buildTimestamp = buildTime.getTime()
    }

    const versions_json_str = await get_versions_json()
    // download the mods
    const mod_json = await get_mod_json()
    const managed = new ManagedModJson(mod_json)

    // apply translate from database
    managed.applyTranslateFromDisk("database")
    managed.applyTranslateFromOldVersion()

    // save database
    managed.saveTranslateToDisk("database")

    // the reference is kept by managed, so it works
    add_cn_mods(mod_json)

    // render json pages
    managed.saveRenderedJsonsToDisk("dist")

    // we don't use the versions from the databse
    // we download it directly from bsqmods
    writeFileSync("dist/versions.json", versions_json_str, { encoding: "utf-8" })

    writeFileSync("dist/build_info.json", JSON.stringify(buildConfig, null, 2), { encoding: "utf-8"})    
}