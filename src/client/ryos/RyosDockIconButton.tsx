/* Adapted from ryOS src/components/layout/dock/DockIconButton.tsx.
 * Copyright (C) 2025 Ryo Lu. AGPL-3.0-only. Pinned e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35.
 * Modified 2026-11-24: bottom Aqua dock only; typed game icon/callback replaces
 * ThemedIcon, i18n, app-prefetch, native haptics and app-store dependencies.
 * Original pointer-distance motion values, spring parameters, layout transitions,
 * tooltip reveal and launch bounce are retained. See THIRD_PARTY_NOTICES.md. */
import {memo,useEffect,useRef,useState,type ReactNode} from 'react';
import {AnimatePresence,motion,useIsPresent,useMotionValue,useReducedMotion,useSpring,useTransform,type MotionValue} from 'motion/react';
const DOCK_MAX_SCALE=2.3;
const DOCK_MAGNIFY_DISTANCE=140;
export type RyosDockIconButtonProps={id:string;label:string;icon:ReactNode;showIndicator:boolean;active:boolean;onClick:()=>void;mouseX:MotionValue<number>;magnifyEnabled:boolean;baseSize:number};
export const RyosDockIconButton=memo(function RyosDockIconButton({id,label,icon,showIndicator,active,onClick,mouseX,magnifyEnabled,baseSize}:RyosDockIconButtonProps){
 const wrapperRef=useRef<HTMLDivElement|null>(null);
 const isPresent=useIsPresent();
 const reduced=useReducedMotion();
 const [hovered,setHovered]=useState(false),[launching,setLaunching]=useState(false);
 const baseButtonSize=baseSize;
 const maxButtonSize=Math.round(baseButtonSize*DOCK_MAX_SCALE);
 const targetSize=useMotionValue(baseButtonSize);
 useEffect(()=>{if(!magnifyEnabled||reduced)targetSize.set(baseButtonSize);},[baseButtonSize,magnifyEnabled,reduced,targetSize]);
 const distanceCalc=useTransform(mouseX,val=>{const bounds=wrapperRef.current?.getBoundingClientRect();if(!bounds||!Number.isFinite(val))return Infinity;return val-(bounds.left+bounds.width/2);});
 useEffect(()=>{
  if(!magnifyEnabled||reduced)return;
  return distanceCalc.on('change',dist=>{if(!Number.isFinite(dist)){targetSize.set(baseButtonSize);return;}const absDist=Math.abs(dist);if(absDist>DOCK_MAGNIFY_DISTANCE)targetSize.set(baseButtonSize);else{const t=1-absDist/DOCK_MAGNIFY_DISTANCE;targetSize.set(baseButtonSize+t*(maxButtonSize-baseButtonSize));}});
 },[magnifyEnabled,reduced,baseButtonSize,maxButtonSize,distanceCalc,targetSize]);
 const sizeSpring=useSpring(targetSize,{mass:.15,stiffness:160,damping:18});
 useEffect(()=>{if(!launching)return;const timer=setTimeout(()=>setLaunching(false),420);return()=>clearTimeout(timer);},[launching]);
 return <motion.div ref={wrapperRef} layout={!reduced} layoutId={`dock-icon-${id}`} data-dock-icon={id} initial={false} animate={{scale:1,opacity:1}} exit={{scale:0,opacity:0}} transition={{type:'spring',stiffness:500,damping:36,mass:.7,layout:{type:'spring',stiffness:400,damping:30}}} style={{transformOrigin:'bottom center',willChange:'width,height,transform',width:isPresent?sizeSpring:0,height:isPresent?sizeSpring:0,marginLeft:isPresent?4:0,marginRight:isPresent?4:0,overflow:'visible',position:'relative',flexShrink:0}}>
  <AnimatePresence>{hovered&&<motion.div className="ryos-original-dock-tooltip" initial={reduced?false:{opacity:0,y:10,x:'-50%'}} animate={{opacity:1,y:0,x:'-50%',transition:{duration:.05}}} exit={{opacity:0,y:5,x:'-50%',transition:{duration:reduced?0:.15}}}>{label}<i/></motion.div>}</AnimatePresence>
  <button className={`ryos-dock-item ${active?'active':''}`} type="button" aria-label={label} onClick={()=>{if(!showIndicator&&!reduced)setLaunching(true);onClick();}} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setHovered(true)} onBlur={()=>setHovered(false)}>
   <motion.div className="ryos-dock-icon-art" animate={launching?{y:[0,-20,0]}:{y:0}} transition={launching?{duration:.4,ease:'easeInOut'}:{type:'spring',stiffness:200,damping:20}}>{icon}</motion.div>
   {showIndicator&&<span className="ryos-original-running" aria-hidden="true"/>}
  </button>
 </motion.div>;
});
