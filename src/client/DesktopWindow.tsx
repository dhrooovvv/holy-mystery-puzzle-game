/* Game window adapter for ryOS WindowFrame geometry and animations.
 * Geometry / motion functions imported below are the pinned upstream source;
 * game-owned persistence and application callbacks replace the ryOS global store.
 * Copyright (C) 2025 Ryo Lu. Adapted 2026-11-24. AGPL-3.0-only.
 * See THIRD_PARTY_NOTICES.md. */
import { RyosWindowControls } from './ryos/RyosWindowControls';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'motion/react';
import type { MotionStyle } from 'motion/react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import {
  clampWindowToContentBounds, desktopContentBounds, maximizedWindowFrame,
  mobileFullWidthFrame, windowDragLimits, windowResizeMaxWidth,
} from './ryos/desktopContentBounds';
import { subscribeWindowViewportConstraints } from './ryos/useWindowViewportConstraints';
import { getAnimateState, getInitialAnimation } from './ryos/windowFrameAnimations';

type Rectangle = { x: number; y: number; width: number; height: number };
type Bounds = { width: number; height: number };
export type DesktopWindowProps = {
  id: string; title: string; icon: ReactNode; active: boolean; zIndex: number;
  initial: Rectangle; minimized: boolean; closed?: boolean;
  onFocus: () => void; onMinimize: () => void; onClose: () => void; children: ReactNode;
};

function constrain(rect: Rectangle, bounds: Bounds): Rectangle {
  const content = desktopContentBounds({ viewportWidth: bounds.width, viewportHeight: bounds.height, insets: { left: 0, right: 0 } });
  const width = Math.min(Math.max(240, rect.width), windowResizeMaxWidth(bounds.width, content));
  const height = Math.min(Math.max(120, rect.height), content.height);
  const fitted = clampWindowToContentBounds({ x: rect.x, width, viewportWidth: bounds.width, bounds: content, mobile: false });
  const limits = windowDragLimits({ windowWidth: fitted.width, viewportWidth: bounds.width, bounds: content });
  // The embedded game also keeps the whole frame inside its usable workspace.
  return { width: fitted.width, height, x: Math.max(content.x, limits.minX, Math.min(fitted.x, limits.maxX, content.right - fitted.width)), y: Math.max(content.y, Math.min(rect.y, content.bottom - height)) };
}

/** The positioned workspace excludes the menu and dock. Puzzle children stay mounted. */
export function DesktopWindow({ id, title, icon, active, zIndex, initial, minimized, closed = false, onFocus, onMinimize, onClose, children }: DesktopWindowProps) {
  const element = useRef<HTMLElement>(null);
  const [bounds, setBounds] = useState<Bounds>(() => ({ width: Math.max(1, window.innerWidth), height: Math.max(1, window.innerHeight - 103) }));
  const [rect, setRect] = useState<Rectangle>(initial);
  const [maximized, setMaximized] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [settledHidden, setSettledHidden] = useState(minimized || closed);
  const reducedMotion = useReducedMotion();
  const hidden = minimized || closed;
  const hiddenRef = useRef(hidden); hiddenRef.current = hidden;
  const initialMount = useRef(true);
  const previousHidden = useRef(hidden);
  const shouldAnimateRestore = previousHidden.current && !hidden;
  const resizing = useRef<{ pointer: number; x: number; y: number; rect: Rectangle } | null>(null);
  const drag = useRef<{ pointer: number; x: number; y: number; rect: Rectangle } | null>(null);

  useEffect(() => {
    initialMount.current = false;
    previousHidden.current = hidden;
    if (reducedMotion) setSettledHidden(hidden);
  }, [hidden, reducedMotion]);
  useEffect(() => {
    const parent = element.current?.parentElement;
    if (!parent) return;
    let frame = 0;
    const measure = () => {
      const next = { width: Math.max(1, parent.clientWidth), height: Math.max(1, parent.clientHeight) };
      setBounds(old => old.width === next.width && old.height === next.height ? old : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); }); };
    measure();
    const observer = new ResizeObserver(schedule); observer.observe(parent);
    const unsubscribe = subscribeWindowViewportConstraints(measure);
    return () => { observer.disconnect(); unsubscribe(); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const fitted = constrain(rect, bounds);
  const content = desktopContentBounds({ viewportWidth: bounds.width, viewportHeight: bounds.height, insets: { left: 0, right: 0 } });
  const phone = bounds.width <= 620;
  const maxFrame = maximizedWindowFrame({ viewportWidth: bounds.width, bounds: content, maxWidthConstraint: null, defaultWidth: initial.width, restoring: false });
  const phoneFrame = mobileFullWidthFrame(bounds.width, content);
  const visible = phone ? { ...phoneFrame, y: 0, height: bounds.height } : maximized ? { ...maxFrame, y: 0, height: bounds.height } : fitted;
  // The same motion values carry direct manipulation and programmatic frame transitions.
  const leftMotion = useMotionValue(visible.x), topMotion = useMotionValue(visible.y);
  const widthMotion = useMotionValue(visible.width), heightMotion = useMotionValue(visible.height);
  function dockOffset() {
    const dock = [...document.querySelectorAll<HTMLElement>('[data-dock-icon]')].find(node => node.dataset.dockIcon === id)?.getBoundingClientRect();
    const parent = element.current?.parentElement?.getBoundingClientRect();
    const centerX = (parent?.left || 0) + visible.x + visible.width / 2;
    const centerY = (parent?.top || 0) + visible.y + visible.height / 2;
    return { x: (dock ? dock.left + dock.width / 2 : window.innerWidth / 2) - centerX, y: (dock ? dock.top + dock.height / 2 : window.innerHeight - 36) - centerY };
  }
  const animation = getAnimateState({ isClosing: closed, keepMountedWhenMinimized: true, isMinimized: minimized, dockIconOffset: dockOffset(), isShaking: false, shouldAnimateRestore, isInitialMount: initialMount.current, launchOriginOffset: null });
  const geometryTransition = { duration: reducedMotion || interacting ? 0 : .15, ease: [.25, .1, .25, 1] as const };
  const style: MotionStyle = {
    left: leftMotion, top: topMotion, width: widthMotion, height: heightMotion,
    position: 'absolute', zIndex, display: hidden && settledHidden ? 'none' : 'flex',
    flexDirection: 'column', minWidth: 0, minHeight: 0, pointerEvents: hidden ? 'none' : undefined,
    transformOrigin: 'center center',
  };
  const toggleMaximize = () => { drag.current = null; resizing.current = null; setInteracting(false); setMaximized(value => !value); };
  function beginDrag(event: PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button') || event.button !== 0 || phone || maximized) return;
    event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, rect: fitted }; setInteracting(true);
  }
  function moveDrag(event: PointerEvent<HTMLElement>) {
    const origin = drag.current; if (!origin || origin.pointer !== event.pointerId) return;
    setRect(constrain({ ...origin.rect, x: origin.rect.x + event.clientX - origin.x, y: origin.rect.y + event.clientY - origin.y }, bounds));
  }
  function endDrag(event: PointerEvent<HTMLElement>) {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null; setInteracting(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function moveByKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || maximized || phone) return;
    const step = event.shiftKey ? 30 : 10;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const change = delta[event.key]; if (!change) return;
    event.preventDefault(); setRect(old => constrain({ ...old, x: old.x + change[0], y: old.y + change[1] }, bounds));
  }
  function endResize(event: PointerEvent<HTMLButtonElement>) {
    resizing.current = null; setInteracting(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <motion.section
    ref={element} id={`window-${id}`}
    className={`desktop-window window ${active ? 'is-active' : 'is-inactive'}${maximized ? ' is-maximized' : ''}`}
    style={style} aria-label={title} aria-hidden={hidden} inert={hidden}
    initial={reducedMotion ? false : getInitialAnimation({ shouldAnimateRestore: false, dockIconOffset: { x: 0, y: 0 }, isInitialMount: true, launchOriginOffset: null })}
    animate={{ ...animation, left: visible.x, top: visible.y, width: visible.width, height: visible.height, transition: { ...animation.transition, ...(reducedMotion ? { duration: 0 } : {}), left: geometryTransition, top: geometryTransition, width: geometryTransition, height: geometryTransition } }}
    onAnimationComplete={() => setSettledHidden(hiddenRef.current)}
    onPointerDown={() => { if (!hidden) onFocus(); }} onFocusCapture={() => { if (!hidden) onFocus(); }}
  >
    <header className="titlebar" tabIndex={0} aria-label={`${title} title bar; arrow keys move window`} style={{ touchAction: 'none', flexShrink: 0 }} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; setInteracting(false); }} onDoubleClick={event => { if (!(event.target as HTMLElement).closest('button')) toggleMaximize(); }} onKeyDown={moveByKeyboard}>
      <RyosWindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={toggleMaximize} />
      <span className="window-title">{icon}<span>{title}</span></span>
    </header>
    {children}
    {!maximized && !phone && <button type="button" className="window-resize" aria-label={`resize ${title}`} onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); event.stopPropagation(); onFocus(); resizing.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, rect: fitted }; setInteracting(true); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { const origin = resizing.current; if (!origin || origin.pointer !== event.pointerId) return; setRect(constrain({ ...origin.rect, width: Math.max(240, origin.rect.width + event.clientX - origin.x), height: Math.max(160, origin.rect.height + event.clientY - origin.y) }, bounds)); }} onPointerUp={endResize} onPointerCancel={endResize} onLostPointerCapture={() => { resizing.current = null; setInteracting(false); }} onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); setRect(old => constrain({ ...old, width: old.width + (event.key === 'ArrowRight' ? 10 : event.key === 'ArrowLeft' ? -10 : 0), height: old.height + (event.key === 'ArrowDown' ? 10 : event.key === 'ArrowUp' ? -10 : 0) }, bounds)); }}><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 9 9 2M5 9l4-4M8 9l1-1" stroke="#888" /></svg></button>}
  </motion.section>;
}
export default DesktopWindow;
