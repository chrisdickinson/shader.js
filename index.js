module.exports = GLShader

function GLShader(vertexSRC, fragmentSRC) {
  this._vertexSRC = vertexSRC
  this._fragmentSRC = fragmentSRC

  this._uniforms = 
  this._attributes =
  this._vertexHandle =
  this._fragmentHandle =
  this._handle = null

  this.compile()
}

var cons = GLShader
  , proto = cons.prototype

cons._gl = null

cons.gl = function(_) {
  if(_) {
    this._gl = _
  }
  return this._gl
}

cons.fromURLs = function(vertex_url, fragment_url, ready) {
  var xhr_vertex = new XMLHttpRequest
    , xhr_fragment = new XMLHttpRequest
    , vertexSRC 
    , fragmentSRC

  xhr_vertex.open('GET', vertex_url)
  xhr_fragment.open('GET', fragment_url)

  xhr_fragment.onreadystatechange =
  xhr_vertex.onreadystatechange = check_done

  xhr_vertex.send(null)
  xhr_fragment.send(null)

  function check_done() {
    if(this.readyState === 4) {
      if(this.status > 299 || this.status < 200) {
        return ready(new Error('non-200 response'))
      }

      if(this === xhr_vertex) vertexSRC = this.responseText
      if(this === xhr_fragment) fragmentSRC = this.responseText

      if(vertexSRC && fragmentSRC) {
        return ready(null, new GLShader(vertexSRC, fragmentSRC))
      }      
    }
  }
}

cons.fromIds = function(vertex_id, fragment_id, ready) {
  var vertex_el = document.getElementById(vertex_id)
    , fragment_el = document.getElementById(fragment_id)

  return ready(null, new GLShader(text(vertex_el), text(fragment_el)))

  function text(el) {
    var data = []
    for(var i = 0, len = el.childNodes.length; i < len; ++i) {
      data.push(el.childNodes[i].data)
    }

    return data.join('')
  }
}

proto.vertex = function(_) {
  if(_) {
    if(this._vertexHandle) {
      this.constructor.gl()
          .deleteShader(this._vertexHandle)
      this._vertexHandle = null
    }
    this._vertexSRC = _
    this.compile()
  }
  return this._vertexSRC
}

proto.fragment = function(_) {
  if(_) {
    if(this._fragmentHandle) {
      this.constructor.gl()
          .deleteShader(this._fragmentHandle)
      this._fragmentHandle = null
    }
    this._fragmentSRC = _
    this.compile()
  }
  return this._fragmentSRC
}

proto.handle = function() {
  return this._handle
}

proto.compile = function() {
  var gl = this.constructor.gl()
    , handle = this.handle()
    , attributes = {}
    , uniforms = {}

  if(this._fragmentSRC && !this._fragmentHandle) {
    this._fragmentHandle = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(this._fragmentHandle, this._fragmentSRC)
    gl.compileShader(this._fragmentHandle)
  }

  if(this._vertexSRC && !this._vertexHandle) {
    this._vertexHandle = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(this._vertexHandle, this._vertexSRC)
    gl.compileShader(this._vertexHandle)
  }

  if(handle) {
    gl.deleteProgram(handle)
  }

  handle = gl.createProgram()
  gl.attachShader(handle, this._vertexHandle)
  gl.attachShader(handle, this._fragmentHandle)
  gl.linkProgram(handle)

  this._handle = handle
  this.attachAttributes()
  this.attachUniforms()
}

proto.attachAttributes = function() {
  var gl = this.constructor.gl()
    , rex = /\s*attribute\s*([\w\d]+)\s*([\w\d]+);/g
    , src = this._fragmentSRC + '\n' + this._vertexSRC
    , handle = this._handle
    , map = {}
    , attribs = {}
    , match
    , type
    , name

  map.float = 1
  map.vec2 = 2
  map.vec3 = 3
  map.vec4 = 4

  while(match = rex.exec(src)) {
    type = match[1]
    name = match[2]

    attribs[name] = [map[type], gl.getAttribLocation(handle, name)] 
  }

  this._attributes = attribs
}

proto.attachUniforms = function() {
  var gl = this.constructor.gl()
    , rex = /\s*uniform\s*([\w\d]+)\s*([\w\d]+);/g
    , src = this._fragmentSRC + '\n' + this._vertexSRC
    , handle = this._handle
    , map = {}
    , uniforms = {}
    , match
    , type
    , name

  map.vec2 = 'uniform2fv'
  map.vec3 = 'uniform3fv'
  map.vec4 = 'uniform4fv'
  map.mat4 = 'uniformMatrix4fv'
  map.float = 'uniform1f'
  map.int = 'uniform1i'
  map.sampler2D = 'uniform1i'

  while(match = rex.exec(src)) {
    type = match[1]
    name = match[2]

    uniforms[name] = [map[type], gl.getUniformLocation(handle, name)] 
  }

  this._uniforms = uniforms
}

proto.uniform = function(name, val) {
  var gl = this.constructor.gl()
    , meta = this._uniforms[name]
    , handle = this._handle

  gl[meta[0]](meta[1], val)
}

proto.attribute = function(name, val, normalized) {
  var gl = this.constructor.gl()
    , meta = this._attributes[name]
    , handle = this._handle

  gl.enableVertexAttribArray(meta[1])
  gl.bindBuffer(gl.ARRAY_BUFFER, val)
  gl.vertexAttribPointer(meta[1], meta[0], gl.FLOAT, normalized || false, 0, 0) 
  gl.bindAttribLocation(handle, meta[1], name)
}
