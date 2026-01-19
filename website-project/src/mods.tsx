/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

const mods = await import("./mods.json")
const versions = (await import("./versions.json")).default
const build_info = await import("./build_info.json")
const buildDate = new Date(build_info.buildTimestamp).toLocaleString("zh-CN", { timeZone: "Asia/ShangHai" })

import "./mods.css"

function isCoverUrlLoadable(url:unknown){
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
  const [show_version, set_show_version] = useState(versions[0])
  return <div className="root-container" style={{

  }}>
    <h1>bsqmods中文源</h1>
    <div style={{marginBottom:"12px"}}><small style={{color:"gray"}}>这是一个节奏光剑Quest一体机模组的中文mod源</small></div>
    <p>
    游戏版本：<select style={{display:"inline",width:"fit-content"}} className="form-select form-select-sm" onChange={(x) => {
      set_show_version(x.target.value)
    }}>
      {
        versions.map(ver => <option key={ver}>{ver}</option>)
      }
    </select>&nbsp;
    <span className="badge text-bg-success">最后同步时间：{buildDate}</span></p>
    <div className="alert alert-warning" role="alert">
      <b>部分游戏版本不可用</b><br/>
      此页面上的部分游戏版本号，无法在MBF或QuestPatcher中使用，也不会在上游网站中展示。这是因为那些版本的核心模组还没有准备好。请选择你正在使用、或者能够使用的游戏版本。
    </div>

    <div className="alert alert-primary" role="alert">
      <b>数据源与内容反馈</b><br/>
      此中文源数据位于<a href="https://github.com/BeatSaberCN/bsqmods-cn">GitHub</a>，由上游<a href="https://mods.bsquest.xyz">bsqmods</a>汉化而来，每日自动更新。
      中文内容均人工制作，任何问题请通过<a href="https://github.com/BeatSaberCN/bsqmods-cn/issues">issue</a>联系，会第一时间进行处理。同时欢迎提交PR。
    </div>

    <hr />
    <ModList gameVersion={show_version} />
  </div>
}

interface ModItem {
  id:string,
  name:string,
  description:string,
  description_en?:string,
  version:string,
  cover?:string|null
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

  const arr = []
  for (const id of group_by_ids) {
    arr.push(<ModWithSameIdCard key={id[1][0].id} datas={id[1]} />)
  }
  return <><div className="row">{arr}</div></>
}

function ModWithSameIdCard({ datas }:{datas:Array<ModItem>}) {
  const [ver, setver] = useState(datas.length - 1)

  const options = []

  for (let i = 0; i < datas.length; i++) {
    const x = datas[i]
    const _i = i
    options.push(<li><a className="dropdown-item" href="javascript:void" onClick={()=>setver(_i)}>{x.version}</a></li>)
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
      <ModCard key={ver} data={datas[Math.min(ver, datas.length-1)]} version_selector={selector} />
    </div>
    </div></>
}


function ModCard({ data, version_selector }:{data:ModItem, version_selector:any}) {
  const [zh_mode, set_zh_mode] = useState(true)
  if(data == undefined)
    return <>错误，数据为空</>
  let eng_checkbox = null
  if(data.description_en){
    const cbid = `cb-${data.id}-${data.version}`
    eng_checkbox = <>
      <input type="checkbox" className="btn-check" id={cbid} autoComplete="off" onChange={e=>set_zh_mode(!e.target.checked)} />
      <label className="btn btn-sm" style={{color:"var(--bs-link-color)"}} htmlFor={cbid}>原文</label>
    </>


    //  eng_checkbox = <div className="form-check form-switch" style={{display:"inline-block"}}>
    //      <input type="checkbox" className="form-check-input" role="switch"  id={cbid} onChange={e=>{
    //        set_zh_mode(!e.target.checked)
    //      }}></input>
    //      <label className="form-check-label" htmlFor={cbid}>原文</label>
    //  </div>
  }

  let cover_link = null
  if(isCoverUrlLoadable(data.cover)){
    cover_link = <a href={data.cover as string} target="_blank" className="btn btn-link btn-sm">封面</a>
  }

  let image_div = <span style={{
    width:"100%",height:"40px",
    fontSize:"xx-small",display:"inline-block",
    textAlign:"center",verticalAlign:"middle",
    backgroundColor:"#80808033",
    color:"gray"
  }}><span style={{verticalAlign:"middle",display:"inline-block",marginTop:"10px"}}>无封面</span></span>
  
  
  const [showFloat, setShowFloat] = useState(false)
  if(isCoverUrlLoadable(data.cover)){

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
          <div style={{display:"inline-block",width:"20%",verticalAlign:"top"}}>{image_div}</div>
          <div style={{display:"inline-block", width:"79%"}}>
            <div style={{marginLeft:"4px",marginBottom:"-6px"}}><b>{data.name}</b></div>
            <div style={{fontSize:"small",textAlign:"right", transform:"translateX(50%) scale(0.7) translateX(-50%)"}}>
              {eng_checkbox}{cover_link}{version_selector}
            </div>
          </div>
        </div>
        
        <p>{zh_mode ? data.description : data.description_en}</p>
    </div>
  </>
  

    
}
