export interface ShaderBackground {
    destroy: () => void;
}

export function createShaderBackground(
    canvas: HTMLCanvasElement,
    fragmentShaderSource: string
): ShaderBackground | null {

    const gl = canvas.getContext("webgl", {
        alpha: true
    });

    if (!gl) {
        console.error("WebGL is not supported.");
        return null;
    }

    const vertexShaderSource = `
        attribute vec2 a_position;

        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    function compileShader(
        type: number,
        source: string
    ): WebGLShader {

        const shader = gl?.createShader(type);

        if (!shader) {
            throw new Error("Failed to create shader.");
        }

        gl?.shaderSource(shader, source);
        gl?.compileShader(shader);

        if (!gl?.getShaderParameter(shader, gl?.COMPILE_STATUS)) {
            const info = gl?.getShaderInfoLog(shader);

            gl?.deleteShader(shader);

            throw new Error(
                `Shader compilation failed:\n${info}`
            );
        }

        return shader;
    }

    const vertexShader = compileShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

    const fragmentShader = compileShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );

    const program = gl.createProgram();

    if (!program) {
        throw new Error("Failed to create WebGL program.");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
            `Program linking failed:\n${gl.getProgramInfoLog(program)}`
        );
    }

    gl.useProgram(program);

    // --------------------------------------------------
    // Full-screen triangle pair
    // --------------------------------------------------

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,

            -1,  1,
             1, -1,
             1,  1
        ]),
        gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(
        program,
        "a_position"
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // --------------------------------------------------
    // Uniforms
    // --------------------------------------------------

    const resolutionLocation =
        gl.getUniformLocation(program, "u_resolution");

    const timeLocation =
        gl.getUniformLocation(program, "u_time");

    const mouseLocation =
        gl.getUniformLocation(program, "u_mouse");

    // --------------------------------------------------
    // Mouse
    // --------------------------------------------------

    let mouseX = 0.5;
    let mouseY = 0.5;

    // let targetMouseX = 0.5;
    // let targetMouseY = 0.5;

    // window.addEventListener("mousemove", (event) => {
    //     targetMouseX =
    //         event.clientX / window.innerWidth;

    //     targetMouseY =
    //         1.0 -
    //         event.clientY / window.innerHeight;
    // });

    const onMouseMove = (event: MouseEvent) => {
        mouseX = event.clientX / window.innerWidth;

        // WebGL coordinates start at bottom
        mouseY = 1.0 - event.clientY / window.innerHeight;
    };

    window.addEventListener(
        "mousemove",
        onMouseMove
    );

    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    function resize() {

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        const width = Math.floor(
            canvas.clientWidth * dpr
        );

        const height = Math.floor(
            canvas.clientHeight * dpr
        );

        if (
            canvas.width !== width ||
            canvas.height !== height
        ) {
            canvas.width = width;
            canvas.height = height;
        }

        gl?.viewport(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    const startTime = performance.now();

    let animationFrame = 0;

    function render() {

        resize();

        gl?.clearColor(0, 0, 0, 0);
        gl?.clear(gl?.COLOR_BUFFER_BIT);

        const time =
            (performance.now() - startTime) / 1000;

        gl?.useProgram(program);

        gl?.uniform2f(
            resolutionLocation,
            canvas.width,
            canvas.height
        );

        gl?.uniform2f(
            mouseLocation,
            mouseX,
            mouseY
        );

        gl?.uniform1f(
            timeLocation,
            time
        );

        gl?.drawArrays(
            gl?.TRIANGLES,
            0,
            6
        );

        animationFrame =
            requestAnimationFrame(render);
    }

    render();

    return {
        destroy() {
            cancelAnimationFrame(animationFrame);

            window.removeEventListener(
                "mousemove",
                onMouseMove
            );

            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
        }
    };
}