precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


// --------------------------------------------------
// Gradient
// --------------------------------------------------

vec3 backgroundColor(float y) {

    vec3 top =
        vec3(
            0.07,
            0.01,
            0.12
        );

    vec3 middle =
        vec3(
            0.1,
            0.015,
            0.13
        );

    vec3 bottom =
        vec3(
            0.015,
            0.025,
            0.14
        );

    vec3 color =
        mix(
            bottom,
            middle,
            smoothstep(
                0.0,
                0.55,
                y
            )
        );

    color =
        mix(
            color,
            top,
            smoothstep(
                0.55,
                1.0,
                y
            )
        );

    return color;
}


// --------------------------------------------------
// Main
// --------------------------------------------------

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        u_resolution.xy;

    vec2 aspect =
        vec2(
            u_resolution.x /
            u_resolution.y,
            1.0
        );

    vec2 p =
        (uv - 0.5) *
        aspect;

    vec2 mouse =
        (u_mouse - 0.5) *
        aspect;


    // ==================================================
    // Gradient
    // ==================================================

    vec3 color =
        backgroundColor(uv.y);


    // ==================================================
    // Mouse dome
    // ==================================================

    float dist =
        distance(
            p,
            mouse
        );

    float radius =
        0.25;

    float t =
        clamp(
            dist / radius,
            0.0,
            1.0
        );

    float dome =
        1.0 - smoothstep(
            0.0,
            1.0,
            t
        );

    dome *= dome;


    // Smooth radial displacement
    p +=
        (p - mouse) *
        dome *
        0.08;


    // ==================================================
    // Uniform grid
    // ==================================================

    float gridSize =
        0.0625;

    vec2 grid =
        abs(
            fract(
                p / gridSize +
                0.5
            ) - 0.5
        );

    float lineDistance =
        min(
            grid.x,
            grid.y
        );


    // Anti-aliased thin line
    float lineWidth =
        0.025;

    float gridLine =
        1.0 -
        smoothstep(
            0.0,
            lineWidth,
            lineDistance
        );


    // ==================================================
    // Mouse brightness
    // ==================================================

    float brightness =
        0.2 +
        dome * 0.2;

    vec3 gridColor =
        vec3(
            0.08,
            0.70,
            0.90
        );

    color +=
        gridColor *
        gridLine *
        brightness;


    // ==================================================
    // Horizon-ish glow
    // ==================================================

    float glow =
        exp(
            -abs(
                uv.y - 0.5
            ) * 8.0
        );

    color +=
        vec3(
            0.0,
            0.18,
            0.25
        ) *
        glow *
        0.15;


    gl_FragColor =
        vec4(
            color,
            1.0
        );
}