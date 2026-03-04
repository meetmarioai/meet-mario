'use client'
import dynamic from 'next/dynamic'
const MeetMario = dynamic(() => import('./MeetMario'), { ssr: false })
export default function Dashboard() {
  return <MeetMario />
}