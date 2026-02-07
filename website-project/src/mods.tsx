/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import cc_icon from "./by-nc-sa.svg"
import { Masonry } from 'masonic'
import { motion } from "motion/react"

const mods = await import("./mods.json")
const versions = (await import("./versions.json")).default
const build_info = await import("./build_info.json")
const buildDate = new Date(build_info.buildTimestamp).toLocaleString("zh-CN", { timeZone: "Asia/ShangHai" })
const core_mods = (await import("./core_mods.json")).default as any as Record<string, {
  mods: [{
    id: string
  }]
}>
const contributors = (await import("./contributors.json")).default as any as {
  author: string,
  count: number
}[]
import "./mods.css"

const core_mod_ids: Record<string, Set<string>> = {}
for (const version in core_mods) {
  core_mod_ids[version] = new Set()
  for (const mod of core_mods[version].mods) {
    core_mod_ids[version].add(mod.id)
  }
}
function hasCoreMod(gameVer: string) {
  return !!core_mod_ids[gameVer]
}
function isCoreMod(gameVer: string, id: string) {
  const set = core_mod_ids[gameVer]
  if (set == undefined)
    return false
  return set.has(id)
}

function isImageSafeLoadable(url: unknown) {
  if (url == null || url == undefined)
    return false
  if (typeof (url) == "string") {
    return url.startsWith("http://") || url.startsWith("https://")
  }
  return false
}

createRoot(document.getElementById('root')!).render(
  <App />
)

function App() {
  return <>
    <Head />
    <Body />
  </>
}

function Head(){
  return <div className='my-container'>
      <div className='p-5 bg-body-tertiary rounded-3'>
        <div className='container-fluid py-5'>
          <h1 className='display-5 fw-bold' >
            <span>bs</span> <span>qmods</span>中文源
          </h1>
          <div className='col-md-8 fs-4'>节奏光剑Quest一体机模组的中文源</div>
        </div>
      </div>

    </div>
}



function Body() {
  let default_version = versions[0]
  for (const ver of versions) {
    if (hasCoreMod(ver)) {
      default_version = ver
      break
    }
  }

  if(!localStorage.getItem("grid-render")){
    localStorage.setItem("grid-render", "masonry")
  }

  const [show_version, set_show_version] = useState(default_version)
  const [show_non_core_versions, set_show_non_core_versions] = useState(false)
  const [show_old_versions, set_show_old_versions] = useState(false)
  const [useMasonry, setUseMasonry] = useState(localStorage.getItem("grid-render") == "masonry");

  const [theme, set_theme] = useState(localStorage.getItem("theme") == "dark" ? "dark" : "light")

  function setDarkMode(dark: boolean) {
    document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light")
  }

  // 在html中也要设置一下theme，以防止加载闪烁
  setDarkMode(theme == "dark")

  return <div className="my-container">
    <div className="alert alert-light mt-3" role="alert">
      <b><i className="m-1 bi bi-highlighter"></i>数据源与内容反馈</b><br />
      <p className='m-0' style={{ textIndent: "1.5em" }}>中文内容均人工制作，任何问题或需求可以通过<a href="https://github.com/BeatSaberCN/bsqmods-cn/issues">issue</a>联系，会第一时间进行处理。</p>
    </div>

    <div className='alert alert-light fade show pb-3 pb-sm-2'>
      <b className=''><i className="m-1 bi bi-toggles"></i>设置</b>
      <hr className='mx-1 my-1'/>
      <div className='ms-2 row'>

          <div className="form-check form-switch col col-12 col-sm-6 col-lg-3">
            <motion.input animate={{scale: show_old_versions ? 1.1 : 0.9}} className="form-check-input" type="checkbox" role="switch" id="showOldGameSwitch" onChange={(e) => set_show_old_versions(e.target.checked)} />
            <label className="form-check-label" htmlFor="showOldGameSwitch"><i className="me-1 bi bi-clock-history"></i>显示旧版本</label>
          </div>

          <div className="form-check form-switch col col-12 col-sm-6 col-lg-3">
            <motion.input animate={{scale: show_non_core_versions ? 1.1 : 0.9}}  className="form-check-input" type="checkbox" role="switch" id="showNonCoreGameSwitch" onChange={(e) => set_show_non_core_versions(e.target.checked)} />
            <label className="form-check-label" htmlFor="showNonCoreGameSwitch"><i className="me-1 bi bi-patch-exclamation"></i>显示不可用版本</label>
          </div>

          <div className="form-check form-switch col col-12 col-sm-6 col-lg-3">
            <motion.input animate={{scale: useMasonry ? 1.1 : 0.9}}  className="form-check-input" type="checkbox" role="switch" id="enableMasonary" checked={useMasonry} onChange={(e) => {
              setUseMasonry(e.target.checked)
              localStorage.setItem("grid-render", e.target.checked ? "masonry" : "normal")
              }} />
            <label className="form-check-label" htmlFor="enableMasonary"><i className="me-1 bi bi-columns-gap"></i>瀑布流渲染<span className='ms-2 badge text-bg-warning p-1' style={{fontSize:"10px", verticalAlign:"text-bottom"}}>高开销</span></label>
          </div>

          <div className="form-check form-switch col col-12 col-sm-6 col-lg-3">
            <motion.input initial={false} animate={{scale: theme == "dark" ? 1.1 : 0.9}} className="form-check-input" type="checkbox" role="switch" id="dayNightColorToggle" onChange={(e) => {
              const dark = e.target.checked;
              set_theme(dark ? "dark" : "light")
              localStorage.setItem("theme", dark ? "dark" : "light");
              setDarkMode(dark);
            }} checked={theme == "dark"} />
            <label className="form-check-label" style={{ userSelect: "none" }} htmlFor="dayNightColorToggle"><i className="me-1 bi bi-moon"></i>夜间模式</label>
          </div>

      </div>

      <hr className='mx-1 my-1' />
      <div className='px-2 small d-flex flex-column flex-sm-row justify-content-between'>
        <span  className='text-secondary' style={{verticalAlign:"sub", textWrap:"nowrap"}}>{buildDate} （上次同步时间）</span>
        <a     className='align-self-end' href="https://github.com/BeatSaberCN/bsqmods-cn/actions/workflows/deploy.yml" >
          <img src="https://github.com/BeatSaberCN/bsqmods-cn/actions/workflows/deploy.yml/badge.svg" />
        </a>
      </div> 

    </div>


    <div className="alert alert-light">
        <b className=''><i className="m-1 bi bi-option"></i>
版本选择</b>
      <div className="">
          <hr className='my-1 mx-1'/>
          <div className='m-2'>
            {
              versions.map(ver => <button
                key={ver}
                type="button"
                hidden={
                  (() => {
                    if (!hasCoreMod(ver)) {
                      if (!show_non_core_versions)
                        return true
                    }
                    if (ver == "global" || ver == "undefined" || ver < "1.37.0") {
                      if (!show_old_versions)
                        return true
                    }
                    return false;
                  })()
                }
                className={"btn btn-sm " + (
                  "btn-" + (ver == show_version ? "" : "outline-") + (hasCoreMod(ver) ? "success" : "secondary")
                )}
                style={{
                  borderRadius: "20px",
                  padding: "0 10px",
                  margin: "0 2px"
                }}
                onClick={() => {
                  set_show_version(ver)
                }}
              >{ver.split("_")[0]}</button>
              )
            }
          </div>
          <small className='text-secondary'><p className='mb-1' style={{ textIndent: "1em" }}>尽量安装/降级至<b>最新可用版本</b>，及时更新游戏，以享受<b>模组更新</b>与<b>Bug修复</b>。请放心，模组及歌单数据与游戏独立，删除/更新游戏不会丢失。</p></small>

          <small className='text-secondary'><p className='mt-1 mb-0' style={{ textIndent: "1em" }}>当前详细版本号：{show_version}</p></small>
      </div>
    </div>


    <div style={{
      display: hasCoreMod(show_version) ? "none" : ""
    }} className="alert alert-warning" role="alert">
      <b>版本不可用<i className="m-1 bi bi-exclamation-octagon-fill"></i></b><br />
      {show_version}版本无法在MBF或QuestPatcher中使用，也不会在上游网站中展示。这是因为该版本的核心模组没有就绪。
    </div>

    <ModList useMasonry={useMasonry} gameVersion={show_version} />

    <h3 className='mt-4'>相关软件</h3>
    <hr className='my-1'/>
    <p className='ms-2'>以下软件支持使用此源作为数据来源。</p>

    <div className='mt-2 mb-2 alert alert-info'>
      <b><i className="me-2 bi bi-exclamation-octagon-fill"></i>兼容性提示</b><br/>QuestPatcher与ModsBeforeFriday安装之后互不兼容，请勿同时使用。
      <details>
        QuestPatcher与ModsBeforeFriday无法获取对方已安装的模组数据，因此存在兼容使用问题。请谨慎互换使用。如需切换，建议删除并重新安装游戏后，使用另一个软件打补丁。
      </details>
    </div>

    <div className='row gy-2'>
      <div className='col col-12 col-md-6 col-lg-5 col-xl-4'>
        <div className='card rounded-4 h-100 w-100'>
          <div className='card-body'>
            <div className='card-title tool-title'>
              <h4 className='text-center text-body-emphasis mt-3'>QuestPatcher 中文版</h4>
              <div className='text-center small mt-1 mb-4 text-body-tertiary'>PC联网使用/一键自动降级安装/兼容本地ADB<span className='d-none d-md-inline'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{/* 此span用于对齐横线 */}</span></div>
            </div>
            <hr/>
            <p className="card-text mt-2 mb-1" style={{ textIndent: "1em" }}>这是用于Quest一体机的节奏光剑模组安装工具。由中文社区开发者维护的补丁工具。可以下载安装后使用。</p>
            <p className="card-text mt-2 mb-1" style={{ textIndent: "1em" }}>可选择切换此中文源。</p>
            <div>
              <a href="https://github.com/BeatSaberCN/QuestPatcher/releases/latest/download/QuestPatcher-windows-standalone.zip"
                className="btn btn-link me-1"><i className="me-1 bi bi-file-zip"></i>下载便携版</a>
              <a href="https://github.com/BeatSaberCN/QuestPatcher/releases/latest/download/QuestPatcher-windows.exe"
                className="btn btn-link me-1"><i className="me-1 bi bi-filetype-exe"></i>下载安装器</a>
              <a href="https://github.com/BeatSaberCN/QuestPatcher"
                className="btn btn-link me-1"><i className="me-1 bi bi-github"></i>项目主页</a>
            </div>
          </div>
        </div>
      </div>
      <div className='col col-12 col-md-6 col-lg-5 col-xl-4'>
        <div className='card rounded-4 h-100 w-100'>
          {/* <div className='card-header'>相关软件</div> */}
          <div className='card-body'>
            <div className='card-title tool-title'>
              <h4 className='text-center text-body-emphasis mt-3'>ModsBeforeFriday 中文版</h4>
              <div className='text-center small mt-1 mb-4 text-body-tertiary'>Quest联网使用/一键自动降级安装/支持手机平板/无需下载</div>
            </div>
            <hr/>
            <p className="card-text mt-2 mb-1" style={{ textIndent: "1em" }}>这是用于Quest一体机的节奏光剑模组安装工具。此软件（简称MBF）是英文模组社区BSMG主流推荐的模组工具。</p>
            <p className="card-text mt-2 mb-1" style={{ textIndent: "1em" }}>此为中文分支，使用此中文源。</p>
            <div>
              <a href="https://mbf.bsaber.cn/"
                className="btn btn-link me-1"><i className="me-1 bi bi-hand-index-thumb"></i>打开</a>
              <a href="https://github.com/BeatSaberCN/ModsBeforeFriday"
                className="btn btn-link me-1"><i className="me-1 bi bi-github"></i>项目主页</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr/>
    <div className='text-body-secondary pt-1 pb-0 small'>
        <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans'><img src={cc_icon} width={"60px"} /></a>&nbsp;中文翻译数据依照CC-BY-NC-SA 4.0国际许可协议授权。贡献者：{contributors.map((e) => <span key={e.author} style={{ marginLeft: "8px" }}>{e.author}</span>)}。
        <br/>贡献数据请向<a href="https://github.com/BeatSaberCN/bsqmods-cn/blob/master/database/translates.json">此文件</a>提交Pull Request！
        数据由上游<a href="https://mods.bsquest.xyz">bsqmods</a>同步汉化而来，每日自动更新。

      本站点与bsaber.com无关。
    </div>
    <hr className='my-1 p-0'/>
    <div className='text-body-secondary small'>页面布局bootstrap，超帅气的瀑布流渲染来自masonic。</div>

  </div>
}

interface ModItem {
  id: string,
  name: string,
  description: string,
  description_en?: string,
  version: string,
  cover?: string | null,
  _isAddedByCNSource?: boolean,
  isLibrary: boolean,
  author?: string | null,
  authorIcon?: string | null,
  source?: string,
  download?: string,
  website?: string
}
interface ModJson {
  default: Record<string, Array<ModItem>>
}


function ModList({useMasonry, gameVersion }: { useMasonry:boolean, gameVersion: string }) {

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
  for (const entry of group_by_ids) {
    group_by_ids_mods_only.push(entry[1])
  }

  group_by_ids_mods_only.sort((a: Array<ModItem>, b: Array<ModItem>) => {
    const acore = isCoreMod(gameVersion, a[0].id)
    const bcore = isCoreMod(gameVersion, b[0].id)
    const acn = a[0]._isAddedByCNSource
    const bcn = b[0]._isAddedByCNSource

    if (acore != bcore) {
      return acore ? -1 : 1
    }

    if (acn != bcn) {
      return acn ? -1 : 1
    }

    return NaN
  })

  // const arr = []
  // for (const mods of group_by_ids_mods_only) {
  //   arr.push(<ModWithSameIdCard key={mods[0].id} datas={mods} gameVersion={gameVersion} />)
  // }

  if(useMasonry){
    const MasonryCard = ({data}:{data:ModItem[], width:number})=><>
      <ModWithSameIdCard datas={data} gameVersion={gameVersion} />
    </>

    return <Masonry
      key={gameVersion}
      columnGutter={16}
      columnWidth={350}
      maxColumnWidth={460}
      items={group_by_ids_mods_only}
      render={MasonryCard}
    >
    </Masonry>
  }else{
    return <div className='row row-cols-1 row-cols-sm-2 row-cols-xl-3 row-cols-xxl-4'>
        {group_by_ids_mods_only.map(mods=><div key={mods[0].id} className='col p-2'>
          <ModWithSameIdCard datas={mods} gameVersion={gameVersion} />
        </div>)}
    </div>
  }



}

function ModWithSameIdCard({ datas, gameVersion }: { datas: Array<ModItem>, gameVersion: string }) {
  const [selectedIndex, setSelectedIndex] = useState(datas.length - 1)
  const safe_index = Math.min(selectedIndex, datas.length - 1);
  return <>
        <div
          className={"card h-100 w-100 shadow" + (isCoreMod(gameVersion, datas[safe_index]?.id ?? "") ? " border-warning-subtle" : "")}>
          <ModCard key={selectedIndex} datas={datas} selectedIndex={safe_index} onSelectModVersion={index=>setSelectedIndex(index)} gamever={gameVersion} />
        </div>
  </>
}

function ModVersionSelector({datas, selectedIndex, onSelect}: {datas:Array<ModItem>, selectedIndex:number, onSelect:(index:number)=>void}){
  const options = []

  for (let i = 0; i < datas.length; i++) {
    const x = datas[i]
    const _i = i
    options.push(<li key={_i}><button className="dropdown-item" onClick={() => onSelect(_i)}>{x.version}</button></li>)
  }

  return <div className='d-inline-block w-auto dropdown'>
      <button className="btn btn-sm btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {datas[Math.min(datas.length - 1, selectedIndex)].version}
      </button>
      <ul  className="dropdown-menu">
        {options}
      </ul>
  </div>
}

function ModCard({datas, selectedIndex, onSelectModVersion, gamever }: { datas:Array<ModItem>, selectedIndex:number, onSelectModVersion:(index:number)=>void, gamever: string }) {
  const [zh_mode, set_zh_mode] = useState(true)

  const data = datas[selectedIndex]
  if (data == undefined)
    return <>错误，数据为空</>

  return <>
    <div className="card-body">
      <div className="mb-2">
        <div className='d-flex justify-content-between'>
          <div className={'d-inline-block' + (isImageSafeLoadable(data.cover) ? " col-9" :"")}>
            <div className='my-0 mx-2 fw-bold'>{data.name}</div>
            <div className='mx-0'><ModAuthor data={data} /></div>
          </div>
          <ModCover data={data} />
        </div>
        <div className='mt-2 d-flex justify-content-between'>
          <small className='ms-2' style={{fontSize:"12px"}}><ModLabels data={data} gamever={gamever}/></small>
        </div>
      </div>

      <motion.div layout>
        <ModDescription data={data} eng={!zh_mode} />
        <div className='d-flex flex-column flex-sm-row justify-content-between'>
          <div className='m-0 p-0'><ModEngButton data={data} onSet={eng=>set_zh_mode(!eng)}/></div>
          <div className='mt-sm-2 align-self-end'><ModVersionSelector datas={datas} selectedIndex={selectedIndex} onSelect={onSelectModVersion}/><ModLinkButtons data={data} /></div>

        </div>

      </motion.div>
    </div>
  </>
}

function ModLabels({data, gamever}:{data:ModItem, gamever:string}){
  let cn_source = null
  if (data._isAddedByCNSource) {
    cn_source = <span className="badge text-bg-info">中文源</span>
  }
  let core_mod = null
  if (isCoreMod(gamever, data.id)) {
    core_mod = <span className="badge text-bg-warning">核心</span>
  }
  let is_library = null
  if (data.isLibrary) {
    is_library = <>&nbsp;<span className="badge text-bg-secondary">库</span></>
  }
  return <>{cn_source}{core_mod}{is_library}</>
}

function ModCover({data}:{data:ModItem}){
  const [showFloat, setShowFloat] = useState(false)

  let image_div = <></>

  if (isImageSafeLoadable(data.cover)) {
    image_div = <>
      <div className='col-3'><span className="cover-float-span">
        <motion.img className='cover-img' initial={false} src={data.cover as string} animate={{
          opacity: showFloat ? 1 : 0,
          x:showFloat ? 0 : -80,
          scale: showFloat ? 1 : 0
        }}/>
      </span>
      <img
        src={data.cover as string}
        onMouseEnter={() => setShowFloat(true)}
        onMouseLeave={() => setShowFloat(false)}
        className='cover-inpage-img'
      /></div>
    </>
  }
  return image_div
}

function ModAuthor({data}:{data:ModItem}){
  const [largeAuthorIcon, setLargeAuthorIcon] = useState(false)

  let author = <></>
  if (typeof (data.author) == "string") {
    author = <span style={{ color: "gray", verticalAlign: "middle", fontSize: "small" }}>{data.author}</span>
    if (isImageSafeLoadable(data.authorIcon)) {
      author = <>
        <motion.img
          src={data.authorIcon || ""}
          className="author-img"
          initial={false}
          animate={{
            scale: largeAuthorIcon ? 3 : 1,
            borderRadius: largeAuthorIcon ? 0 : 16,
            borderWidth: largeAuthorIcon ? 1 : 0
          }}
          onMouseEnter={() => setLargeAuthorIcon(true)} onMouseLeave={() => setLargeAuthorIcon(false)} />{author}</>
    }
    author = <span style={{
      marginLeft: "16px",
      marginTop: "4px",
      display: "inline-block",
      lineHeight: "normal"
    }}>{author}</span>
  }
  return author
}

function ModLinkButtons({data}:{data:ModItem}){
  const references = []
  {
    const icon = (url:string)=>url.startsWith("https://github.com") ? <i className="me-1 bi bi-github"></i> : <></>;
    if (data.source && data.source.startsWith("https://")) {
      references.push(<a className='btn btn-link btn-tiny pe-2' key="source" href={data.source} target='_blank'>{icon(data.source)}{
        data.source == data.website ? "源码/主页" : "源码"
      }</a>)
    }
    if (data.website && data.website != data.source && data.website.startsWith("https://")) {
      references.push(<a className='btn btn-link btn-tiny me-2' key="website" href={data.website} target='_blank'>{icon(data.website)}主页</a>)
    }
    if (data.download && data.download.startsWith("https://")) {
      references.push(<a className='btn btn-link btn-tiny m2-1' key="download" href={data.download} target='_blank'><i className="me-1 bi bi-download"></i>下载</a>)
    }
  }
  return references
}

function ModDescription({data, eng}:{data:ModItem, eng:boolean}){
    const cn_elem = <>{(data.description || "").split("\n").map((v, i) => (
        <p className='p-0 m-0' style={{ textIndent: data.description_en ? "1em" : "" }} key={i}>{v}</p>
      ))}</>
    const en_elem = <>{data.description_en ?? ""}</>

    return <>
        <div className='shadow-sm bg-body-tertiary px-2 py-1 mb-0' style={{borderRadius:"2px 2px 2px 0"}}>
      
        {eng ? <motion.div key={data.id + "-" + data.version + "-en"} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{en_elem}</motion.div> : 
        <motion.div key={data.id+ "-" + data.version+"-zh"} initial={{opacity:0}} animate={{ opacity:1}} exit={{opacity:0}}>{cn_elem}</motion.div>}
      
    </div></>

}

function ModEngButton({data, onSet}:{data:ModItem, onSet:(eng:boolean)=>void}){
  let eng_checkbox = <></>
  if (data.description_en) {
    const cbid = `cb-${data.id}-${data.version}`
    eng_checkbox = <>
      <input type="checkbox" className="btn-check" id={cbid} autoComplete="off" onChange={e => onSet(e.target.checked)} />
      <label className="btn btn-sm shadow-sm px-1 py-0 mx-0 bg-body-tertiary" style={{ borderRadius:"0 0 4px 4px", verticalAlign:"top", fontSize:"12px", color: "var(--bs-link-color)" }} htmlFor={cbid}><i className="me-1 bi bi-translate"></i>原文</label>
    </>
  }
  return eng_checkbox
}