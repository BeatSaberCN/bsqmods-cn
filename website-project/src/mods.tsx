/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import cc_icon from "./by-nc-sa.svg"
const mods = await import("./mods.json")
const versions = (await import("./versions.json")).default
const build_info = await import("./build_info.json")
const buildDate = new Date(build_info.buildTimestamp).toLocaleString("zh-CN", { timeZone: "Asia/ShangHai" })
const core_mods = (await import("./core_mods.json")).default as any as Record<string, {
  mods:[{
    id:string
  }]
}>
const contributors = (await import("./contributors.json")).default
import "./mods.css"

const core_mod_ids:Record<string, Set<string> > = {}
for(const version in core_mods){
  core_mod_ids[version] = new Set()
  for(const mod of core_mods[version].mods){
    core_mod_ids[version].add(mod.id)
  }
}
function hasCoreMod(gameVer:string){
  return !!core_mod_ids[gameVer]
}
function isCoreMod(gameVer:string, id:string){
  const set = core_mod_ids[gameVer]
  if(set == undefined)
    return false
  return set.has(id)
}

function isImageSafeLoadable(url:unknown){
  if(url == null || url == undefined)
    return false
  if(typeof(url) == "string"){
    return url.startsWith("http://") || url.startsWith("https://")
  }
  return false
}

createRoot(document.getElementById('root')!).render(
  <App />
)

function App() {
  let default_version = versions[0]
  for(const ver of versions){
    if(hasCoreMod(ver)){
      default_version = ver
      break
    }
  }
  const [show_version, set_show_version] = useState(default_version)
  return <div className="root-container">
    <h1>bsqmods中文源</h1>
    <div style={{marginBottom:"12px"}}><small style={{color:"gray"}}>这是一个节奏光剑Quest一体机模组的中文mod名称/简介源</small></div>
    <p>
    游戏版本：<select style={{display:"inline",width:"fit-content"}} className="form-select form-select-sm" onChange={(x) => {
      set_show_version(x.target.value)
    }}
      defaultValue={default_version}
    >
      {
        versions.map(ver => <option key={ver} value={ver}>{hasCoreMod(ver)?"":"(不可用)"}{ver}</option>)
      }
    </select>&nbsp;
    <span className="badge text-bg-success">最后同步时间：{buildDate}</span></p>
    <div style={{
      display:hasCoreMod(show_version) ? "none" : ""
    }} className="alert alert-warning" role="alert">
      <b>该游戏版本不可用</b><br/>
      此页面上的部分游戏版本号，无法在MBF或QuestPatcher中使用，也不会在上游网站中展示。这是因为那些版本的核心模组还没有准备好。请选择你正在使用、或者能够使用的游戏版本。
    </div>
    <div className="alert alert-primary" role="alert">
      <b>数据源与内容反馈</b><br/>
      中文内容均人工制作，任何问题可以通过<a href="https://github.com/BeatSaberCN/bsqmods-cn/issues">issue</a>联系，会第一时间进行处理。
    </div>

    <hr />
    <ModList gameVersion={show_version} />

    <hr />

    
    <div className="alert alert-warning" role="alert">
    <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans'><img src={cc_icon} width={"60px"}/></a>&nbsp;数据依照CC-BY-NC-SA 4.0国际许可协议授权。贡献者：{contributors.map((e)=><span style={{marginLeft:"8px"}}>{e.author}</span>)}。
    <hr/>
      贡献数据请向<a href="https://github.com/BeatSaberCN/bsqmods-cn/blob/master/database/translates.json">此文件</a>提交Pull Request！
      数据由上游<a href="https://mods.bsquest.xyz">bsqmods</a>同步汉化而来，每日自动更新。
    </div>
    <div style={{color:"gray"}}>项目亦在提供一个中文交流平台，相关站点与bsaber.com无关。</div>
  </div>
}

interface ModItem {
  id:string,
  name:string,
  description:string,
  description_en?:string,
  version:string,
  cover?:string|null,
  _isAddedByCNSource?:boolean,
  isLibrary:boolean,
  author?:string|null,
  authorIcon?:string|null
}
interface ModJson {
  default:Record<string, Array<ModItem>>
}


function ModList({ gameVersion }:{gameVersion:string}) {
  const version_mods = (mods as ModJson).default[gameVersion]
  if (!version_mods) {
    return <>该版本无可展示模组信息</>
  }

  const group_by_ids = new Map<string, Array<ModItem>>()

  for (const mod of version_mods) {
    if (!group_by_ids.has(mod.id))
      group_by_ids.set(mod.id, [])
    group_by_ids.get(mod.id)!.push(mod)
  }

  const group_by_ids_mods_only: Array<Array<ModItem>> = []
  for(const entry of group_by_ids){
    group_by_ids_mods_only.push(entry[1])
  }

  group_by_ids_mods_only.sort((a:Array<ModItem>,b:Array<ModItem>)=>{
    const acore = isCoreMod(gameVersion, a[0].id)
    const bcore = isCoreMod(gameVersion, b[0].id)
    const acn = a[0]._isAddedByCNSource
    const bcn = b[0]._isAddedByCNSource

    if(acore != bcore){
      return acore ? -1 : 1
    }

    if(acn != bcn){
      return acn ? -1 : 1
    }

    return NaN
  })

  const arr = []
  for (const mods of group_by_ids_mods_only) {
    arr.push(<ModWithSameIdCard key={mods[0].id} datas={mods} gameVersion={gameVersion}/>)
  }
  return <><div className="row">{arr}</div></>
}

function ModWithSameIdCard({ datas , gameVersion}:{datas:Array<ModItem>, gameVersion:string}) {
  const [ver, setver] = useState(datas.length - 1)

  const options = []

  for (let i = 0; i < datas.length; i++) {
    const x = datas[i]
    const _i = i
    options.push(<li key={_i}><a className="dropdown-item" href="javascript:void" onClick={()=>setver(_i)}>{x.version}</a></li>)
  }

  const selector = <div className="btn-group dropup" style={{display:"inline-block"}}>
    <button className="btn btn-sm btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      {datas[Math.min(datas.length-1, ver)].version}
    </button>
    <ul className="dropdown-menu">
      {options}
    </ul>
  </div>

  return <>
    <div className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
      <div className="card" style={{
      display:"inline-block",
      minHeight:"200px",
      margin:"4px",
      width:"100%"
    }}>
      <ModCard key={ver} data={datas[Math.min(ver, datas.length-1)]} version_selector={selector} gamever={gameVersion} />
    </div>
    </div></>
}


function ModCard({ data, version_selector, gamever }:{data:ModItem, version_selector:any, gamever:string}) {
  const [zh_mode, set_zh_mode] = useState(true)
  const [showFloat, setShowFloat] = useState(false)
  const [largeAuthorIcon, setLargeAuthorIcon] = useState(false)
  if(data == undefined)
    return <>错误，数据为空</>
  let eng_checkbox = null
  if(data.description_en){
    const cbid = `cb-${data.id}-${data.version}`
    eng_checkbox = <>
      <input type="checkbox" className="btn-check" id={cbid} autoComplete="off" onChange={e=>set_zh_mode(!e.target.checked)} />
      <label className="btn btn-sm" style={{color:"var(--bs-link-color)"}} htmlFor={cbid}>原文</label>
    </>
  }

  let cn_source = null
  if(data._isAddedByCNSource){
    cn_source = <span className="badge text-bg-info">中文源</span>
  }
  let core_mod = null
  if(isCoreMod(gamever, data.id)){
    core_mod = <span className="badge text-bg-danger">核心</span>
  }
  let is_library = null
  if(data.isLibrary){
    is_library =  <>&nbsp;<span className="badge text-bg-secondary">库</span></>
  }
  let cover_link = null
  if(isImageSafeLoadable(data.cover)){
    cover_link = <a href={data.cover as string} target="_blank" className="btn btn-link btn-sm">封面</a>
  }

  let author = null
  if(typeof(data.author)=="string"){
    author = <span style={{color:"gray",verticalAlign:"middle",fontSize:"small"}}>{data.author}</span>
    if(isImageSafeLoadable(data.authorIcon)){
      author = <><img src={data.authorIcon || ""} style={{
        width:"16px",
        borderRadius:largeAuthorIcon ? "0" : "20px",
        transform: largeAuthorIcon ? "scale(3)" : "",
        transitionProperty:"all",
        transitionDuration:"200ms",
        transitionTimingFunction:"ease-in",
      }} onMouseEnter={()=>setLargeAuthorIcon(true)} onMouseLeave={()=>setLargeAuthorIcon(false)} />{author}</>
    }
    author = <span style={{
      marginLeft:"16px",
      marginTop:"4px",
      display:"inline-block",
      lineHeight:"normal"
    }}>{author}</span>
  }

  let image_div = <span style={{
    width:"100%",height:"40px",
    fontSize:"xx-small",display:"inline-block",
    textAlign:"center",verticalAlign:"middle",
    backgroundColor:"#80808033",
    color:"gray"
  }}><span style={{verticalAlign:"middle",display:"inline-block",marginTop:"10px", userSelect:"none"}}>无封面</span></span>
  
  if(isImageSafeLoadable(data.cover)){
    image_div = <><span style={{display:"inline-block",width:"0",height:"0",position:"relative",verticalAlign:"top"}}><img src={data.cover as string} style={{
        zIndex:999,
        position:"absolute",
        display:(showFloat ? "" : "none"),
        maxWidth:"300px",
        left:"-8px",
        bottom:"8px",
        border:"4px solid #1ed8f6"
        }} /></span><img src={data.cover as string} onMouseEnter={()=>setShowFloat(true)} onMouseLeave={()=>setShowFloat(false)} style={{width:"100%",backgroundColor:"black"}} />
      
      </>
  }
  return <>
    
    <div className="card-body">
        <div className="card-title">
            <div style={{height:"0"}}><div style={{marginRight:"-10px",marginTop:"-20px", marginBottom:"100px",fontSize:"small",textAlign:"right", marginLeft:"-40px", transform:"translateX(50%) scale(0.7) translateX(-50%)"}}>
              {eng_checkbox}{cover_link}{version_selector}
            </div></div>
            <div style={{height:"0", marginTop:"8px", marginLeft:"-8px", fontSize:"small",transform:"translateX(-50%) scale(0.7) translateX(50%)"}}>
              {core_mod}{is_library}{cn_source}
            </div>
            <div style={{marginTop:"22px"}}></div>

          <div style={{display:"inline-block",width:"20%",verticalAlign:"top"}}>{image_div}</div>
          <div style={{display:"inline-block", width:"79%"}}>
            <div style={{marginLeft:"4px",marginBottom:"-6px"}}><b>{data.name}</b></div>
            <div>{author}</div>
          </div>
        </div>
        
        <p>{zh_mode ? data.description : data.description_en}</p>
    </div>
  </>
  

    
}
