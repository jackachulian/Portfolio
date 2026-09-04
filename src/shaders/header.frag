precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


// --------------------------------------------------
// Utility
// --------------------------------------------------

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float x) {

    float i = floor(x);
    float f = fract(x);

    f = f * f * (3.0 - 2.0 * f);

    return mix(
        hash(i),
        hash(i + 1.0),
        f
    );
}


// --------------------------------------------------
// Sky gradient
// --------------------------------------------------

vec3 skyColor(float y) {

    // vec3 top = vec3(
    //     0.08,
    //     0.015,
    //     0.12
    // );

    vec3 purple = vec3(
        0.30,
        0.015,
        0.30
    );

    vec3 horizon = vec3(
        0.95,
        0.10,
        0.45
    );

    vec3 color;
    color = mix(
        horizon,
        purple,
        smoothstep(0.45, 1.0, y)
    );


    return color;
}


// --------------------------------------------------
// Sun
// --------------------------------------------------

float sun(
    vec2 p,
    vec2 center,
    float radius
) {

    float d = distance(p, center);

    return 1.0 - smoothstep(
        radius,
        radius + 0.002,
        d
    );
}


// --------------------------------------------------
// Mountains
// --------------------------------------------------

float mountainShape(
    float x,
    float offset,
    float scale
) {

    float n = 0.0;

    n += noise(
        x * 2.0 * scale + offset
    ) * 0.5;

    n += noise(
        x * 5.0 * scale + offset * 2.0
    ) * 0.25;

    n += noise(
        x * 12.0 * scale + offset * 3.0
    ) * 0.12;

    return n;
}


// --------------------------------------------------
// Perspective grid
// --------------------------------------------------

float perspectiveGrid(
    vec2 uv
) {

    // Horizon
    float horizon = 0.0;

    if (uv.y < horizon)
        return 0.0;

    // Convert distance from horizon into
    // perspective space.
    float depth =
        (uv.y - horizon) /
        (1.0 - horizon);

    // Exaggerate perspective toward horizon.
    float perspective =
        pow(depth, 2.0);

    // Horizontal lines
    float horizontalScale = 18.0;

    float horizontal =
        abs(
            fract(
                perspective *
                horizontalScale
            ) - 0.5
        );

    float horizontalLine =
        1.0 - smoothstep(
            0.46,
            0.5,
            horizontal
        );

    // Vertical lines converge toward
    // the center horizon.
    float x = uv.x - 0.5;

    float verticalScale = 18.0;

    float vertical =
        abs(
            fract(
                x *
                (verticalScale / max(
                    depth,
                    0.05
                )) +
                0.5
            ) - 0.5
        );

    float verticalLine =
        1.0 - smoothstep(
            0.46,
            0.5,
            vertical
        );

    return max(
        horizontalLine,
        verticalLine
    );
}


// --------------------------------------------------
// Main
// --------------------------------------------------

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        u_resolution.xy;

    // Correct for aspect ratio
    vec2 aspect = vec2(
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
    // Background
    // ==================================================

    vec3 color =
        skyColor(uv.y);


    // ==================================================
    // Sun
    // ==================================================

    vec2 sunPosition =
        vec2(
            0.0,
            0.05
        );

    float sunMask =
        sun(
            p,
            sunPosition,
            0.3
        );

    // Horizontal strips drift upward and become thinner near the top.
    float sunY =
        p.y - sunPosition.y;

    float sunHeight =
        clamp(
            (sunY + 0.15) / 0.3,
            0.0,
            1.0
        );

    // float sunLineDistance =
    //     abs(
    //         fract(
    //             sunY * 35.0 - u_time * 0.8
    //         ) - 0.5
    //     );

    // float sunLineWidth =
    //     mix(
    //         0.2,
    //         0.4,
    //         sunHeight
    //     );

    // float sunLines =
    //     1.0 - smoothstep(
    //         sunLineWidth,
    //         sunLineWidth + 0.015,
    //         sunLineDistance
    //     );

    // sunMask *= sunLines;

    vec3 sunColor =
        vec3(
            1.0,
            0.35,
            0.20
        );

    color =
        mix(
            color,
            sunColor,
            sunMask
        );


    // ==================================================
    // Mountains
    // ==================================================

    float horizon = 0.1;

    float mountainX =
        uv.x * 3.0;

    float mountain =
        mountainShape(
            mountainX + u_time * 0.025,
            2.0,
            1.0
        );

    float mountainHeight =
        0.125 +
        mountain * 0.2;

    float mountainTop =
        horizon +
        mountainHeight;

    float mountainMask =
        1.0 - smoothstep(
            mountainTop - 0.005,
            mountainTop + 0.005,
            uv.y
        );

    vec3 mountainColor =
        vec3(
            0.015,
            0.03,
            0.18
        );

    color =
        mix(
            color,
            mountainColor,
            mountainMask
        );


    // Second mountain layer
    float mountain2 =
        mountainShape(
            mountainX * 1.5 + u_time * 0.05,
            8.0,
            1.0
        );

    float mountainHeight2 =
        0.06 +
        mountain2 * 0.12;

    float mountainTop2 =
        horizon +
        mountainHeight2;

    float mountainMask2 =
        1.0 - smoothstep(
            mountainTop2 - 0.005,
            mountainTop2 + 0.005,
            uv.y
        );

    color =
        mix(
            color,
            vec3(
                0.03,
                0.12,
                0.3
            ),
            mountainMask2
        );


    // ==================================================
    // Horizon glow
    // ==================================================

    float horizonGlow =
        exp(
            -abs(uv.y - horizon) *
            35.0
        );

    color +=
        vec3(
            0.0,
            0.55,
            0.70
        ) *
        horizonGlow *
        0.45;


    // ==================================================
    // Mouse distortion
    // ==================================================

    float dist =
        distance(p, mouse);

    float radius =
        0.35;

    float t =
        clamp(
            dist / radius,
            0.0,
            1.0
        );

    // Smooth dome
    float dome =
        1.0 - smoothstep(
            0.0,
            1.0,
            t
        );

    dome *= dome;

    // Important:
    // displacement goes to ZERO at center,
    // avoiding the singularity from normalize().
    p +=
        (p - mouse) *
        dome *
        0.08;


    // // ==================================================
    // // Grid
    // // ==================================================

    // // Reconstruct UV after distortion
    // vec2 distortedUV =
    //     p / aspect + 0.5;

    // float grid =
    //     perspectiveGrid(
    //         distortedUV
    //     );


    // // Mouse brightness
    // float mouseGlow =
    //     dome;

    // vec3 gridColor =
    //     vec3(
    //         0.10,
    //         0.75,
    //         0.90
    //     );

    // float brightness =
    //     0.65 +
    //     mouseGlow * 1.2;

    // color +=
    //     gridColor *
    //     grid *
    //     brightness;


    // ==================================================
    // Subtle scanline effect
    // ==================================================

    float scanline =
        sin(
            uv.y *
            u_resolution.y *
            0.5
        ) * 0.015;

    color += scanline;

    float alpha =
        smoothstep(
            horizon - 0.1,
            horizon,
            uv.y
        );

    gl_FragColor =
        vec4(color*alpha, alpha);
}