export function mountGl(canvas) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !canvas) return () => {}
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' })
  if (!gl) return () => {}

  const vs = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}')
  gl.compileShader(vs)
  const fs = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fs, `
    precision mediump float;
    uniform float t;
    uniform vec2 r;
    void main() {
      vec2 u = gl_FragCoord.xy / r;
      float band = sin(u.x * 2.4 + t * 0.12) * 0.5 + 0.5;
      vec3 obsidian = vec3(0.043, 0.047, 0.063);
      vec3 emerald = vec3(0.118, 0.302, 0.231);
      vec3 gold = vec3(0.831, 0.686, 0.216);
      vec3 col = mix(obsidian, emerald, smoothstep(0.15, 0.95, u.y) * 0.38 * band);
      float sheen = pow(1.0 - abs(u.y - 0.22 - 0.04 * sin(t * 0.17 + u.x * 5.0)), 22.0);
      col += gold * sheen * 0.22;
      gl_FragColor = vec4(col, 1.0);
    }
  `)
  gl.compileShader(fs)
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const uT = gl.getUniformLocation(prog, 't')
  const uR = gl.getUniformLocation(prog, 'r')

  let running = true
  let frameId = 0
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.floor(window.innerWidth * dpr)
    canvas.height = Math.floor(window.innerHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  const frame = (now) => {
    if (!running) return
    gl.uniform1f(uT, now * 0.001)
    gl.uniform2f(uR, canvas.width, canvas.height)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    frameId = requestAnimationFrame(frame)
  }
  resize()
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(frameId)
    } else if (!running) {
      running = true
      frameId = requestAnimationFrame(frame)
    }
  })
  frameId = requestAnimationFrame(frame)
  return () => {
    running = false
    cancelAnimationFrame(frameId)
  }
}
