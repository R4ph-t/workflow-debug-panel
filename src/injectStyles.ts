let injected = false

export function injectStyles(css: string): void {
  if (injected || typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.setAttribute('data-workflow-debug-panel', '')
  style.textContent = css
  document.head.appendChild(style)
  injected = true
}
