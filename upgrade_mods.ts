import https from "node:https";
import {ManagedModJson, ModJson} from "./mod_types.ts"
import { writeFileSync } from "node:fs";

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

if(import.meta.main){
    const versions_json_str = await get_versions_json()
    // download the mods
    const mod_json = await get_mod_json()
    const managed = new ManagedModJson(mod_json)

    // apply translate from database
    managed.applyTranslateFromDisk("database")
    managed.applyTranslateFromOldVersion()

    // save database
    managed.saveTranslateToDisk("database")

    // render json pages
    managed.saveRenderedJsonsToDisk("dist")

    // we don't use the versions from the databse
    // we download it directly from bsqmods
    writeFileSync("dist/versions.json", versions_json_str, { encoding: "utf-8" })
}