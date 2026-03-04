'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const T = {
  w:"#F7F4F0",w1:"#F1EDE7",w2:"#E8E2DA",w3:"#D8D0C4",
  w4:"#B8ACA0",w5:"#8A7E72",w6:"#4A4038",w7:"#1C1510",
  rg:"#C4887A",rg2:"#9A6255",rg3:"#DEB0A4",rgBg:"#F8F0EE",
  err:"#B85040",ok:"#6A9060",warn:"#B88040",
}
const fonts = {
  serif:"'Georgia','Times New Roman',serif",
  sans:"-apple-system,'Helvetica Neue','Arial',sans-serif",
  mono:"'SF Mono','Fira Mono','Courier New',monospace",
}

export default function AdminPage() {
  const [patients,setPatients] = useState([])
  const [loading,setLoading] = useState(true)
  const [showAdd,setShowAdd] = useState(false)
  const [form,setForm] = useState({
    email:'',full_name:'',date_of_birth:'',
    sex:'female',lab_id:'',test_date:'',
    candida_level:'',whey_level:'',
  })
  const [addLoading,setAddLoading] = useState(false)
  const [addResult,setAddResult] = useState(null)
  const supabase = createClient()

  useEffect(()=>{loadPatients()},[])

  async function loadPatients(){
    setLoading(true)
    const {data} = await supabase.from('patients').select(`
      id,full_name,date_of_birth,created_at,
      alcat_results(test_date,candida_level,whey_level),
      chat_messages(id)
    `).order('created_at',{ascending:false})
    if(data) setPatients(data)
    setLoading(false)
  }

  async function addPatient(){
    if(!form.email||!form.full_name) return
    setAddLoading(true)
    setAddResult(null)
    try {
      const res = await fetch('/api/admin/add-patient',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(form),
      })
      const result = await res.json()
      if(result.error){
        setAddResult({ok:false,msg:result.error})
      } else {
        setAddResult({ok:true,msg:`${form.full_name} added. Login link sent to ${form.email}.`})
        setForm({email:'',full_name:'',date_of_birth:'',sex:'female',lab_id:'',test_date:'',candida_level:'',whey_level:''})
        setShowAdd(false)
        loadPatients()
      }
    } catch {
      setAddResult({ok:false,msg:'Network error. Try again.'})
    }
    setAddLoading(false)
  }

  const field=(label,key,type='text',placeholder='')=>(
    <div style={{marginBottom:18}}>
      <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4,letterSpacing:'0.20em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
      <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}
        style={{display:'block',width:'100%',padding:'10px 0',border:'none',borderBottom:`1.5px solid ${T.w3}`,background:'transparent',fontSize:13,color:T.w7,outline:'none',fontFamily:fonts.sans}}/>
    </div>
  )

  const sel=(label,key,opts)=>(
    <div style={{marginBottom:18}}>
      <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4,letterSpacing:'0.20em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
      <select value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:'100%',padding:'10px 0',border:'none',borderBottom:`1.5px solid ${T.w3}`,background:'transparent',fontSize:13,color:T.w7,outline:'none',fontFamily:fonts.sans}}>
        {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:T.w,fontFamily:fonts.sans}}>
      <div style={{height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 44px',background:'rgba(247,244,240,0.95)',borderBottom:`1px solid ${T.w3}`,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:9,height:9,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`}}/>
          <span style={{fontFamily:fonts.serif,fontSize:18,color:T.w7}}>meet mario</span>
          <span style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,border:`1px solid ${T.rg}30`,borderRadius:4,padding:'2px 8px',letterSpacing:'0.14em',background:T.rgBg}}>CLINIC ADMIN</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontFamily:fonts.mono,fontSize:9,color:T.w4}}>{patients.length} patients</span>
          <button onClick={()=>{setShowAdd(v=>!v);setAddResult(null)}}
            style={{background:showAdd?T.rgBg:T.rg,border:`1px solid ${T.rg}`,borderRadius:8,padding:'7px 18px',cursor:'pointer',fontSize:12,fontFamily:fonts.sans,color:showAdd?T.rg2:'#fff',fontWeight:500}}>
            {showAdd?'Cancel':'+ Add patient'}
          </button>
        </div>
      </div>

      <div style={{padding:'36px 44px',maxWidth:860,margin:'0 auto'}}>
        {showAdd&&(
          <div style={{background:T.w1,border:`1px solid ${T.rg}30`,borderRadius:16,padding:'32px 36px',marginBottom:32,boxShadow:`0 4px 20px rgba(196,136,122,0.10)`}}>
            <div style={{fontFamily:fonts.serif,fontSize:22,color:T.w7,marginBottom:28,fontWeight:400}}>New patient</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 32px'}}>
              {field('Full name','full_name','text','Anna Lindström')}
              {field('Email','email','email','patient@email.com')}
              {field('Date of birth','date_of_birth','date')}
              {field('Lab ID','lab_id','text','539273')}
              {field('Test date','test_date','date')}
              {sel('Sex','sex',[{v:'female',l:'Female'},{v:'male',l:'Male'},{v:'other',l:'Other'}])}
              {sel('Candida marker','candida_level',[{v:'',l:'None'},{v:'mild',l:'Mild'},{v:'moderate',l:'Moderate'},{v:'severe',l:'Severe'}])}
              {sel('Whey marker','whey_level',[{v:'',l:'None'},{v:'mild',l:'Mild'},{v:'moderate',l:'Moderate'},{v:'severe',l:'Severe'}])}
            </div>
            {addResult&&(
              <div style={{marginTop:8,marginBottom:16,padding:'10px 14px',background:addResult.ok?`${T.ok}12`:`${T.err}12`,border:`1px solid ${addResult.ok?T.ok:T.err}35`,borderRadius:8,fontSize:12,color:addResult.ok?T.ok:T.err}}>
                {addResult.msg}
              </div>
            )}
            <button onClick={addPatient} disabled={addLoading||!form.email||!form.full_name}
              style={{marginTop:8,background:addLoading?T.w2:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,border:'none',borderRadius:10,padding:'13px 32px',cursor:addLoading?'not-allowed':'pointer',color:addLoading?T.w4:'#fff',fontSize:13,fontWeight:500,fontFamily:fonts.sans}}>
              {addLoading?'Adding patient…':'Add patient & send login link →'}
            </button>
          </div>
        )}

        <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4,letterSpacing:'0.20em',textTransform:'uppercase',marginBottom:16}}>All patients</div>
        {loading?(
          <div style={{fontSize:13,color:T.w4}}>Loading…</div>
        ):patients.length===0?(
          <div style={{fontSize:13,color:T.w5,padding:'32px 0',textAlign:'center'}}>No patients yet. Add your first patient above.</div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {patients.map(p=>{
              const alcat=p.alcat_results?.[0]
              const chats=p.chat_messages?.length??0
              return(
                <div key={p.id} style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:10,padding:'14px 20px',display:'flex',alignItems:'center',gap:20,boxShadow:'0 1px 3px rgba(100,80,60,0.04)'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:T.w7,fontWeight:500,marginBottom:4}}>{p.full_name}</div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {alcat?.test_date&&<span style={{fontFamily:fonts.mono,fontSize:9,color:T.w4}}>ALCAT {alcat.test_date}</span>}
                      {alcat?.candida_level&&<span style={{fontFamily:fonts.mono,fontSize:9,color:'#906080',border:'1px solid #90608030',borderRadius:3,padding:'1px 6px'}}>Candida {alcat.candida_level}</span>}
                      {alcat?.whey_level&&<span style={{fontFamily:fonts.mono,fontSize:9,color:'#5080A8',border:'1px solid #5080A830',borderRadius:3,padding:'1px 6px'}}>Whey {alcat.whey_level}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:16,alignItems:'center'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:fonts.serif,fontSize:18,color:chats>0?T.rg:T.w4}}>{chats}</div>
                      <div style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,letterSpacing:'0.12em'}}>MESSAGES</div>
                    </div>
                    <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4}}>{new Date(p.created_at).toLocaleDateString('sv-SE')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;}button:hover{opacity:0.88;}`}</style>
    </div>
  )
}