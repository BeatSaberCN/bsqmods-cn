import { globSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ModItem } from "./mod_types.ts";

interface ModTranslateItem{
    id:string,
    names?:Record<string,string>
    descriptions?:Record<string,string>
    translates?:Record<string,string>,
}

function MergeJson(src:ModTranslateItem, dst:ModTranslateItem){
    if(src.names){
        if(!dst.names) dst.names = {}
        for(const k in src.names){
            dst.names[k] = src.names[k]
        }
    }
    if(src.descriptions){
        if(!dst.descriptions) dst.descriptions = {}
        for(const k in src.descriptions){
            dst.descriptions[k] = src.descriptions[k]
        }
    }
    if(src.translates){
        if(!dst.translates) dst.translates = {}
        for(const k in src.translates){
            dst.translates[k] = src.translates[k]
        }
    }
}

export class TranslateDB {
    database: Record<string /* mod id */, ModTranslateItem >
    constructor(){
        this.database = JSON.parse("{}")
    }
    load(file:string){
        this.database = JSON.parse(readFileSync(file, {encoding:'utf-8'}))

        for(const mod in this.database){
            for(const k in this.database[mod]){
                if(k != 'id' && k != 'names' && k != 'descriptions')
                    delete this.database[mod][k]
            }
        }
    }
    store(file:string){
        writeFileSync(file, 
            JSON.stringify(this.database, null, 4),
            {encoding:"utf-8"}
        )
    }

    addTranslates(mod:ModItem){
        let dbitem = this.database[mod.id]
        if(dbitem == undefined){
            dbitem = this.database[mod.id] = {
                id:mod.id,
                names:{},
                descriptions:{}
            }
        }

        const name_maybe = dbitem.names[mod.name] || (dbitem.translates && dbitem.translates[mod.name])
        if(name_maybe)
            mod.name_zh = name_maybe
        else
            dbitem.names[mod.name] = null

        const desc_maybe = dbitem.descriptions[mod.description] || (dbitem.translates && dbitem.translates[mod.description])
        if(desc_maybe)
            mod.description_zh = desc_maybe
        else
            dbitem.names[mod.description] = null
    }
}