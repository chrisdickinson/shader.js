# shader.js

Browserify-compatible webgl shader objects.

````javascript

var shader = require('shader.js')
  , canvas = document.createElement('canvas')
  , gl = canvas.getContext('experimental-webgl')
  , Shader = shader(gl)

Shader.fromURLs('vertex.vs', 'fragment.fs', function(err, shader) {
  gl.useProgram(shader.handle())

  shader.attribute('position', myGLVBO)
  shader.uniform('clock', Date.now())

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6)
})

````

## API

### require('shader.js') -> function shader(gl){}

Returns a function that accepts a WebGL context and returns the
`Shader` constructor function.

### shader(gl) -> Shader

Returns the `Shader` constructor when provided a gl context.

### Shader.fromURLs(vertexURL, fragmentURL, ready) -> undefined

Creates a `Shader` instance with the vertex and fragment shaders provided
by the two URL arguments. `ready` is a standard node-style callback:
`function(err, shader) { }`.

### Shader.fromIds(vertexID, fragmentID, ready) -> undefined

Creates a `Shader` instance with the vertex and fragment shaders provided
by the two DOM elements represented by `vertexID` and `fragmentID`. 
`ready` is a standard node-style callback: `function(err, shader) { }`.

### new Shader(vertexSRC, fragmentSRC) -> Shader instance

Create a new WebGL shader provided the source of the vertex and fragment
shaders.

### Shader#handle() -> WebGL program handle

Returns a handle suitable for passing to `gl.useProgram`.

````javascript
// e.g.,
gl.useProgram(shader.handle())
````

### Shader#uniform(uniformName, value) -> undefined

Provides a uniform value to the GPU; relies on introspection
of shader source code. Maps the following types to the following calls:

* `vec2`: `gl.uniform2fv`
* `vec3`: `gl.uniform3fv`
* `vec4`: `gl.uniform4fv`
* `mat4`: `gl.uniformMatrix4fv`
* `float`: `gl.uniform1f`
* `int`: `gl.uniform1i`
* `sampler2D`: `gl.uniform1i`

> Usage with [texture.js](https://github.com/chrisdickinson/texture.js):
> ````javascript
>   // sets `texture` to point at gl.TEXTURE1 with the contents of `myTexture`
>   shader.uniform('texture', myTexture.enable(1))
> ````

### Shader#attribute(attributeName[, type, normalized, stride, offset]) -> undefined

Describes attributes of the vertex stream to the shader.

Automatically detects desired width of incoming data based on source introspection.

Does not bind the buffer for you automatically -- you have to do that yourself ahead of time.

Roughly equivalent to:

````javascript
  var attribLocation = gl.getAttribLocation(programID, 'ATTRIBUTE')
    , WIDTH = 4 // vec2 -> 2, vec3 -> 3, vec4 -> 4

  gl.enableVertexAttribArray(attribLocation)
  gl.vertexAttribPointer(attribLocation, width, type || gl.FLOAT, normalized || false, stride || 0, offset || 0)
  gl.bindAttribLocation(programID, attribLocation, 'ATTRIBUTE')

```` 

### Shader#vertex() -> vertex shader source

Returns the program's vertex shader source.

### Shader#vertex(src) -> src

Sets the program's vertex shader source.

> ### NB:
> This recompiles the shader: you will have to
> call `gl.useProgram(shader.handle())` again
> after calling this method.

### Shader#fragment() -> fragment shader source

Returns the program's fragment shader source.

### Shader#vertex(src) -> src

Sets the program's fragment shader source.

> ### NB:
> This recompiles the shader: you will have to
> call `gl.useProgram(shader.handle())` again
> after calling this method.


