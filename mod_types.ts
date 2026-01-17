import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface ModItem {
      name: string,
      name_zh?: string | null,

      id:string,
      version:string,

      description: string,
      description_zh?: string | null

}

export type ModList = Array<ModItem>;
export type ModJson = Record<string, ModList>;

// deno-lint-ignore no-explicit-any
type ClonedMod = any

function path_safe(path:string){
    if(path.indexOf("/") == -1 && path.indexOf("\\") == -1)
        return true
    return false
}

export class ManagedModJson{
    json:ModJson
    constructor(json:ModJson){
        this.json = json
    }
    versions():string[]{
        return Object.keys(this.json)
    }

    hasVersion(version:string){
        return this.json[version] != undefined
    }
    getMods(version:string):ManagedVersionMods{
        const mods = this.json[version]
        if(mods == undefined)
            throw new Error(`Version ${version} not found in mod list.`)
        return new ManagedVersionMods(version, mods, true)
    }

    applyTranslateFromDisk(folder:string){
        for(const version in this.json){
            for(const mod of this.json[version]){
                const json_file_name = `${mod.id}-${mod.version}.json`
                if(!path_safe(json_file_name))
                    continue
                const json_full_path = join(folder, version, json_file_name)
                if(existsSync(json_full_path)){
                    const old_mod:ModItem = JSON.parse(readFileSync(json_full_path, {encoding:'utf-8'}))
                    if(old_mod.description == mod.description && mod.description_zh == undefined){
                        mod.description_zh = old_mod.description_zh
                    }
                    if(old_mod.name == mod.name && mod.name_zh == undefined){
                        mod.name_zh = old_mod.name_zh
                    }
                }
            }
        }
    }

    applyTranslateFromOldVersion(){
        const translateDictionary = new Map<string,Map<string,string>>()

        // get translates
        for(const version in this.json){
            if(!path_safe(version)) // wtf...
                continue
            for(const mod of this.json[version]){
                if(!translateDictionary.has(mod.id))
                    translateDictionary.set(mod.id, new Map())

                const dictForThisMod = translateDictionary.get(mod.id)

                if(mod.name_zh && mod.name_zh != null)
                    dictForThisMod!.set(mod.name, mod.name_zh)
                if(mod.description_zh && mod.description_zh != null)
                    dictForThisMod!.set(mod.description, mod.description_zh)
            }
        }

        // apply translates
        for(const version in this.json){
            for(const mod of this.json[version]){
                const dictForThisMod = translateDictionary.get(mod.id)
                if(dictForThisMod == undefined)
                    continue

                if(mod.name_zh == undefined || mod.name_zh == null)
                    mod.name_zh = dictForThisMod.get(mod.name)
                if(mod.description_zh == undefined || mod.description_zh == null)
                    mod.description_zh = dictForThisMod.get(mod.description)
                if(!mod.name_zh)
                    mod.name_zh = null
                if(!mod.description_zh)
                    mod.description_zh = null
            }
        }

    }

    saveTranslateToDisk(folder:string){
        if(!existsSync(folder))
            mkdirSync(folder)
        for(const version in this.json){
            if(!path_safe(version))
                continue
            const folderForVersion = join(folder, version)
            if(!existsSync(folderForVersion))
                mkdirSync(folderForVersion, { recursive: true })
            for(const mod of this.json[version]){
                const mod_json_name = `${mod.id}-${mod.version}.json`
                if(!path_safe(mod_json_name))
                {
                    console.error(`warning: can't store mod json file ${mod_json_name} because path is dangerous`)
                    continue
                }
                const json_text = JSON.stringify(mod, null, 2)
                writeFileSync(join(folderForVersion, mod_json_name), json_text, {encoding:"utf-8"})
            }
        }
    }


    saveRenderedJsonsToDisk(folder:string){
        const versions:Array<string> = []
        for(const version of Object.getOwnPropertyNames(this.json)){
            versions.push(version)
        }
        versions.sort()
        versions.reverse()
        if(!existsSync(folder))
            mkdirSync(folder)
        writeFileSync(join(folder, "versions.json"), JSON.stringify(versions))

        const cloned_mods_json:Record<string, Array<ClonedMod>> = {}

        for(const version in this.json){
            if(!path_safe(version))
                continue
            // deno-lint-ignore no-explicit-any
            const version_mods : Record<string /* mod id */ , Record<string /* mod version */, any> > = { }

            const cloned_mod_version:Array<ClonedMod> = []
            cloned_mods_json[version] = cloned_mod_version

            for(const mod of this.json[version]){
                const mod_json_name = `${mod.id}-${mod.version}.json`
                if(!path_safe(mod_json_name))
                {
                    console.error(`warning: can't store mod json file ${mod_json_name} because path is dangerous`)
                    continue
                }

                const cloned_mod:ClonedMod = {}
                for(const key in mod){
                    cloned_mod[key] = (mod as ClonedMod)[key]
                }

                const fix_property = (prop:string, keep_english: boolean)=>{
                    const translated_prop = prop + "_zh"
                    if(cloned_mod[translated_prop] && cloned_mod[translated_prop] != null){
                        cloned_mod[prop + "_en"] = cloned_mod[prop]
                        if(keep_english){
                            cloned_mod[prop] += " / " + cloned_mod[translated_prop]
                        }else{
                            cloned_mod[prop] = cloned_mod[translated_prop]
                        }
                    }
                    delete cloned_mod[translated_prop]
                }

                fix_property("name", true)
                fix_property("description", false)

                if(!version_mods[mod.id])
                    version_mods[mod.id] = {}
                version_mods[mod.id][mod.version] = cloned_mod

                cloned_mod_version.push(cloned_mod)
            }

            const version_mods_json = JSON.stringify(version_mods, null, 2)
            writeFileSync(join(folder, version + ".json"), version_mods_json, { encoding:"utf-8" })
        }
        writeFileSync(join(folder, "mods.json"), JSON.stringify(cloned_mods_json), {encoding:"utf-8"})
    }
}

export class ManagedVersionMods{
    version:string
    mods:ModList

    modListIsManaged:boolean

    constructor(version:string,mods:ModList, modListIsManaged:boolean){
        this.version = version
        this.mods = mods
        this.modListIsManaged = modListIsManaged
    }

    getModIds(): Set<string>{
        const ret = new Set<string>()
        for(const mod of this.mods){
            ret.add(mod.id)
        }
        return ret
    }

    getModListForModId(mod_id:string): ManagedVersionMods{
        const ret:Array<ModItem> = []
        for(const mod of this.mods){
            if(mod.id == mod_id)
                ret.push(mod)
        }
        return new ManagedVersionMods(this.version, ret, false)
    }
}

export class ManagedMod{
    mod:ModItem
    constructor(mod:ModItem){
        this.mod = mod
    }
}