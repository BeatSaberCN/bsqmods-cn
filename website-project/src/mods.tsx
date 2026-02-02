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
const contributors = (await import("./contributors.json")).default as any as {
  author:string,
  count:number
}[]
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
  const [show_non_core_versions, set_show_non_core_versions] = useState(false)
  const [show_old_versions, set_show_old_versions] = useState(false)
  const [detail_configs, set_detail_configs] = useState(false)

  const [display_related_software, set_display_related_software] = useState(false)
  
  const [theme, set_theme] = useState(localStorage.getItem("theme") == "dark" ? "dark" : "light")

  function setDarkMode(dark:boolean){
    document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light")
  }

  // 在html中也要设置一下theme，以防止加载闪烁
  setDarkMode(theme == "dark")

  return <div className="root-container">
    <h1>bsqmods中文源</h1>
    <div className=''><small style={{color:"gray"}}>这是一个节奏光剑Quest一体机模组的中文mod名称/简介源</small></div>
    <hr className='m-1'/>
    <div className='mb-1'>
      <a style={{
          display:"inline-block",
          minWidth:"165px" // 避免LayoutShift
        }} href="https://github.com/BeatSaberCN/bsqmods-cn/actions/workflows/deploy.yml" >
        <img className='me-1' src="https://github.com/BeatSaberCN/bsqmods-cn/actions/workflows/deploy.yml/badge.svg" />
      </a>
      <span className="badge text-bg-success">最后同步时间：{buildDate}</span>
      <div className="form-check form-switch d-inline-block align-middle m-auto ms-2">
        <input className="form-check-input" type="checkbox" role="switch" id="dayNightColorToggle" onChange={(e)=>{
          const dark = e.target.checked;
          set_theme(dark ? "dark" : "light")
          localStorage.setItem("theme", dark ? "dark" : "light");
          setDarkMode(dark);
        }} checked={theme == "dark"} />
        <label className="form-check-label" style={{userSelect:"none"}} htmlFor="dayNightColorToggle">夜间模式</label>
      </div>
    </div>


    <div className="alert alert-primary" role="alert">
      <b>数据源与内容反馈</b><br/>
      中文内容均人工制作，任何问题或需求可以通过<a href="https://github.com/BeatSaberCN/bsqmods-cn/issues">issue</a>联系，会第一时间进行处理。
    </div>


    <div className="card border-secondary" style={{marginBottom:"8px",width:"fit-content"}}>
      <div className='card-header border-secondary'>
        <div className='d-inline-block align-top'>版本设置</div>
          <div className='d-inline-block ms-2 align-bottom'>
            <div className="form-check form-switch" style={{display:"inline-block", marginRight:"16px"}}>
              <input className="form-check-input" type="checkbox" role="switch" id="showOldGameSwitch" onChange={(e)=>set_show_old_versions(e.target.checked)} />
              <label className="form-check-label" htmlFor="showOldGameSwitch">显示旧版本</label>
            </div>
            <div className="form-check form-switch" style={{display:"inline-block"}}>
              <input className="form-check-input" type="checkbox" role="switch" id="showNonCoreGameSwitch" onChange={(e)=>set_show_non_core_versions(e.target.checked)} />
              <label className="form-check-label" htmlFor="showNonCoreGameSwitch">显示不可用版本</label>
            </div>
          </div>

          <div hidden>
            <button className='btn btn-sm btn-link' hidden={detail_configs} onClick={()=>set_detail_configs(true)}>更多</button>
            <button className='btn btn-sm btn-link' hidden={!detail_configs} onClick={()=>set_detail_configs(false)}>更少</button>
          </div>
          <br/>
      </div>
      <div className="card-body pb-2 pt-0">
        <small className='text-secondary'>选择建议：尽量安装/降级至<b>最新可用版本</b>，及时更新游戏，以享受<b>模组更新</b>与<b>Bug修复</b>。请放心，模组及歌单数据与游戏独立，删除/更新游戏不会丢失。</small>
        <div className="card-text">
          <div className="row g-3 align-items-center pt-2" hidden={!detail_configs}>
            <div className="col-auto">
              <label htmlFor="version_textbox_show" className="col-form-label">游戏版本号</label>
            </div>
            <div className="col-auto">
              <input id="version_textbox_show" readOnly value={show_version} className="form-control form-control-sm" aria-describedby="version_select_below"/>
            </div>
          </div>

          <div hidden={!detail_configs}>
          </div>

          <div className='my-1'>
            {
              versions.map(ver=><button
                key={ver} 
                type="button" 
                hidden={
                  (()=>{
                    if(!hasCoreMod(ver)){
                      if(!show_non_core_versions)
                        return true
                    }
                    if(ver == "global" || ver == "undefined" || ver < "1.37.0"){
                      if(!show_old_versions)
                        return true
                    }
                    return false;
                  })()
                }
                className={"btn btn-sm " + (
                    "btn-" + (ver == show_version ? "" : "outline-") + (hasCoreMod(ver) ? "success" : "warning")
                  )}
                style={{
                  borderRadius:"20px",
                  padding:"0 10px",
                  margin:"0 2px"
                }}
                onClick={()=>{
                  set_show_version(ver)
                }}
                >{ver.split("_")[0]}</button>
              )
            }
          </div>
        </div>
        <small className='text-secondary'>详细版本号：{show_version}</small>
      </div>
    </div>
    
    
    <div style={{
      display:hasCoreMod(show_version) ? "none" : ""
    }} className="alert alert-warning" role="alert">
      <b>该游戏版本不可用</b><br/>
      {show_version}版本无法在MBF或QuestPatcher中使用，也不会在上游网站中展示。这是因为该版本的核心模组没有就绪。
    </div>

    <hr className="m-1"/>
    <ModList gameVersion={show_version} />

    <hr className='m-1'/>

    <div style={{textAlign:"left"}}>
      <div className="card text-center border-dark" style={{margin:"0", maxWidth:"1000px"}}>
        <div className="card-header bg-transparent">
          相关软件
            <button className='btn btn-link btn-sm' onClick={()=>set_display_related_software(true)} hidden={display_related_software}>展开</button>
            <button className='btn btn-link btn-sm' onClick={()=>set_display_related_software(false)} hidden={!display_related_software}>收起</button>
        </div>
        <div className="card-body" hidden={!display_related_software}>

          <div className="card-group">

              <div className="card">
                <div className="card-header">QuestPatcherCN</div>
                <div className="card-body">
                  <p>
                    <span className='badge rounded-pill text-bg-light m-1'>中文</span>
                    <span className='badge rounded-pill text-bg-light m-1'>一键降级安装模组</span>
                    <span className='badge rounded-pill text-bg-light m-1'>本地ADB兼容</span>
                    <span className='badge rounded-pill text-bg-info m-1'>需电脑联网</span>
                  </p>
                  <p className="card-text">由中文社区开发者维护的QuestPatcher。可以下载安装后使用。可选择切换此中文源。</p>
                  <a href="https://github.com/BeatSaberCN/QuestPatcher/releases/latest/download/QuestPatcher-windows-standalone.zip"
                    className="btn btn-secondary btn-sm m-1">下载链接</a>
                  <a href="https://github.com/BeatSaberCN/QuestPatcher"
                    className="btn btn-link btn-sm m-1">项目主页</a>
                </div>
              </div>

              <div className="card">
                  <div className="card-header">ModsBeforeFriday中文分支</div>
                <div className="card-body">
                    <span className='badge rounded-pill text-bg-light m-1'>中文</span>
                    <span className='badge rounded-pill text-bg-light m-1'>一键降级安装模组</span>
                    <span className='badge rounded-pill text-bg-light m-1'>网页即开即用</span>
                    <span className='badge rounded-pill text-bg-light m-1'>支持手机/平板</span>
                    <span className='badge rounded-pill text-bg-info m-1'>需Quest联网</span>

                  <p className="card-text">ModsBeforeFriday是英文模组社区BSMG主流推荐的模组工具。此为中文分支，使用此中文源。</p>
                  <a href="https://mbf.bsaber.cn/" className="btn btn-secondary btn-sm m-1">使用链接</a>
                </div>
              </div>

          </div>
        </div>
      </div>

    </div>

    <div className="alert alert-warning mt-2" role="alert">
    <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans'><img src={cc_icon} width={"60px"}/></a>&nbsp;中文翻译数据依照CC-BY-NC-SA 4.0国际许可协议授权。贡献者：{contributors.map((e)=><span key={e.author} style={{marginLeft:"8px"}}>{e.author}</span>)}。
    <hr className='m-3'/>
      贡献数据请向<a href="https://github.com/BeatSaberCN/bsqmods-cn/blob/master/database/translates.json">此文件</a>提交Pull Request！
      数据由上游<a href="https://mods.bsquest.xyz">bsqmods</a>同步汉化而来，每日自动更新。
    </div>
    <div style={{color:"gray"}}>此站点与bsaber.com无关。</div>
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
  authorIcon?:string|null,
  source?:string,
  download?:string,
  website?:string
}
interface ModJson {
  default:Record<string, Array<ModItem>>
}


function ModList({ gameVersion }:{gameVersion:string}) {
  const version_mods = (mods as unknown as ModJson).default[gameVersion]
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
  return <><div className="
    row g-2
    row-cols-1
    row-cols-sm-2
    row-cols-md-2
    row-cols-lg-3
    row-cols-xl-4
    row-cols-xxl-5
    ">
    {arr}
  </div></>
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
    <div className='col'>
      <div className="card h-100 w-100">
        <ModCard key={ver} data={datas[Math.min(ver, datas.length-1)]} version_selector={selector} gamever={gameVersion} />
      </div>
    </div>

    </>
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
      author = <>
        <img
          src={data.authorIcon || ""} 
          className={"author-img " + (largeAuthorIcon ? "author-img-larger" : "")}
          onMouseEnter={()=>setLargeAuthorIcon(true)} onMouseLeave={()=>setLargeAuthorIcon(false)} />{author}</>
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
    image_div = <>
      <span className="cover-float-span">
        <img className='cover-img' src={data.cover as string} hidden={!showFloat} />
      </span>
      <img 
        src={data.cover as string}
        onMouseEnter={()=>setShowFloat(true)}
        onMouseLeave={()=>setShowFloat(false)}
        className='cover-inpage-img'
         />
      </>
  }

  const references = []
  {
    if(data.source && data.source.startsWith("https://")){
      references.push(<a className='btn btn-link btn-tiny pe-2' key="source" href={data.source} target='_blank'>{
        data.source == data.website ? "源码/主页" : "源码"
      }</a>)
    }
    if(data.website && data.website != data.source && data.website.startsWith("https://")){
      references.push(<a className='btn btn-warning btn-tiny me-2' key="website" href={data.website} target='_blank'>主页</a>)
    }
    if(data.download && data.download.startsWith("https://")){
      references.push(<a className='btn btn-success btn-tiny m2-1' key="download" href={data.download} target='_blank'>下载</a>)
    }
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

        {references.length > 0 ? <>
          <div className='text-end'><div className=''
          >{references}</div></div>
        </>:<></>}
    </div>
  </>
  

    
}
