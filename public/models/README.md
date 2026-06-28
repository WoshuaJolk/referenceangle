# 3D models

## headmodel.obj

Human head mesh rendered by the Three.js viewer (`public/javascripts/3dcode.js`).

- **Source:** "Head (Sculpting) - Realistic by Dan Ulrich (CC0)" on Wikimedia Commons,
  derived from the Blender Studio **Human Base Meshes** demo bundle.
  - File page: https://commons.wikimedia.org/wiki/File:Head_(Sculpting)_-_Realistic_by_Dan_Ulrich_(CC0).stl
  - Original bundle: https://www.blender.org/download/demo/asset-bundles/human-base-meshes/
- **Authors:** Dan Ulrich, Paul Kotelevets, Tonatiuh de San Julian, Julien Kaspar / Blender Studio.
- **License:** CC0 1.0 Universal (Public Domain Dedication) -
  https://creativecommons.org/publicdomain/zero/1.0/
  No attribution is legally required; this credit is provided as a courtesy.

### Processing applied

The original Commons file is an 84 MB STL. For shipping in this repo it was:

1. Decimated from ~1.69M faces to 40,000 faces (20,002 vertices).
2. Reoriented from the source's Blender axes (up +Z, face +Y) to standard
   viewer axes (up +Y, face +Z) so the face points at the camera, upright.
3. Recentered on the origin and exported as a Wavefront OBJ (with vertex
   normals, no external .mtl) so `THREE.OBJLoader` lights it without a material file.

Resulting file: ~2.5 MB, ~0.37 m tall in model units (scaled up at runtime).
