import { useState } from 'react'
import { createRoot } from 'react-dom/client'

const mods = await import("./mods.json")
const versions = (await import("./versions.json")).default
const build_info = await import("./build_info.json")
const buildDate = new Date(build_info.buildTimestamp).toLocaleString("zh-CN", { timeZone: "Asia/ShangHai" })

import "./mods.css"

function App() {
  const [show_version, set_show_version] = useState(versions[0])
  return <div className="root-container" style={{

  }}>
    <h1>bsqmods中文源</h1>
    <p>该镜像源由上游<a href="https://mods.bsquest.xyz">bsqmods</a>汉化而来，每日自动更新。</p>
    <p>最后同步时间为北京时间 {buildDate}。</p>
    <p>并非所有的游戏版本均提供社区模组支持，请以模组软件为准！</p>
    <select className="form-select" onChange={(x) => {
      set_show_version(x.target.value)
    }}>
      {
        versions.map(ver => <option key={ver}>{ver}</option>)
      }
    </select>
    <hr />
    <ModList gameVersion={show_version} />
  </div>
}

function ModCard({ data }:{data:any}) {
  const [zh_mode, set_zh_mode] = useState(true)
  let desc_switch_btns = null
  if(data.description_en){
    let current_is_zh = true
    desc_switch_btns = <button className="btn btn-link btn-small" onClick={()=>{
      current_is_zh = !current_is_zh
      set_zh_mode(current_is_zh)
    }}>中/英</button>
  }
  return <>
        <h5 className="card-title">{data.name}</h5>
      <hr/>{data.version}
      <p>{zh_mode ? data.description : data.description_en}</p>
      {desc_switch_btns}
  </>
    
}

function ModWithSameIdCard({ datas }:{datas:any}) {
  const [ver, setver] = useState(datas.length - 1)

  const options = []

  for (let i = 0; i < datas.length; i++) {
    const x = datas[i]
    options.push(<option key={x.version} value={i}>{x.version}</option>)
  }

  const selector = <select style={{
    display:"inline",
    width:"fit-content"
  }} className="form-select" defaultValue={datas.length - 1} onChange={x => setver(+(x.target.value))}>
    {options}
  </select>

  return <>
    <div className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
      <div className="card" style={{
      display:"inline-block",
      minHeight:"200px",
      margin:"4px",
      width:"100%"
    }}>
        <div className="card-body"> <ModCard key={ver} data={datas[ver]} />
        {selector}

      </div>
    </div>
    </div></>
}

function ModList({ gameVersion }:{gameVersion:string}) {
  const version_mods = (mods as any).default[gameVersion]
  if (!version_mods) {
    return <>该版本无可展示模组信息</>
  }

  const group_by_ids = new Map<string, Array<any>>()

  for (let mod of version_mods) {
    if (!group_by_ids.has(mod.id))
      group_by_ids.set(mod.id, [])
    group_by_ids.get(mod.id)!.push(mod)
  }

  let arr = []
  for (let id of group_by_ids) {
    arr.push(<ModWithSameIdCard key={id[1][0].id} datas={id[1]} />)
  }
  return <><div className="row">{arr}</div></>
}


createRoot(document.getElementById('root')!).render(
  <App />
)
