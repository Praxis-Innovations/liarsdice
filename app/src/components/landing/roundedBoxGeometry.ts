/**
 * Local RoundedBoxGeometry — same algorithm as three/examples/jsm/... but takes
 * an already-loaded `three` namespace so we never open a second async import that
 * would force Metro to park `three` in the eagerly loaded `__common` chunk.
 *
 * Adapted from Three.js RoundedBoxGeometry (MIT).
 */
type ThreeNS = typeof import("three");
type Axis = "x" | "y" | "z";

function getUv(
  faceDirVector: InstanceType<ThreeNS["Vector3"]>,
  normal: InstanceType<ThreeNS["Vector3"]>,
  uvAxis: Axis,
  projectionAxis: Axis,
  radius: number,
  sideLength: number,
  tempNormal: InstanceType<ThreeNS["Vector3"]>,
) {
  const totArcLength = ((2 * Math.PI * radius) / 4);
  const centerLength = Math.max(sideLength - 2 * radius, 0);
  const halfArc = Math.PI / 4;

  tempNormal.copy(normal);
  tempNormal[projectionAxis] = 0;
  tempNormal.normalize();

  const arcUvRatio = (0.5 * totArcLength) / (totArcLength + centerLength);
  const arcAngleRatio = 1.0 - tempNormal.angleTo(faceDirVector) / halfArc;

  if (Math.sign(tempNormal[uvAxis]) === 1) {
    return arcAngleRatio * arcUvRatio;
  }
  const lenUv = centerLength / (totArcLength + centerLength);
  return lenUv + arcUvRatio + arcUvRatio * (1.0 - arcAngleRatio);
}

export function createRoundedBoxGeometry(
  THREE: ThreeNS,
  width = 1,
  height = 1,
  depth = 1,
  segments = 2,
  radius = 0.1,
): InstanceType<ThreeNS["BoxGeometry"]> {
  const totalSegments = segments * 2 + 1;
  radius = Math.min(width / 2, height / 2, depth / 2, radius);

  const geometry = new THREE.BoxGeometry(1, 1, 1, totalSegments, totalSegments, totalSegments);
  if (totalSegments === 1) return geometry;

  const geometry2 = geometry.toNonIndexed();
  geometry.index = null;
  geometry.attributes.position = geometry2.attributes.position;
  geometry.attributes.normal = geometry2.attributes.normal;
  geometry.attributes.uv = geometry2.attributes.uv;

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const tempNormal = new THREE.Vector3();
  const faceDirVector = new THREE.Vector3();
  const box = new THREE.Vector3(width, height, depth).divideScalar(2).subScalar(radius);

  const positions = geometry.attributes.position.array as Float32Array;
  const normals = geometry.attributes.normal.array as Float32Array;
  const uvs = geometry.attributes.uv.array as Float32Array;
  const faceTris = positions.length / 6;
  const halfSegmentSize = 0.5 / totalSegments;

  for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
    position.fromArray(positions, i);
    normal.copy(position);
    normal.x -= Math.sign(normal.x) * halfSegmentSize;
    normal.y -= Math.sign(normal.y) * halfSegmentSize;
    normal.z -= Math.sign(normal.z) * halfSegmentSize;
    normal.normalize();

    positions[i + 0] = box.x * Math.sign(position.x) + normal.x * radius;
    positions[i + 1] = box.y * Math.sign(position.y) + normal.y * radius;
    positions[i + 2] = box.z * Math.sign(position.z) + normal.z * radius;

    normals[i + 0] = normal.x;
    normals[i + 1] = normal.y;
    normals[i + 2] = normal.z;

    const side = Math.floor(i / faceTris);
    switch (side) {
      case 0:
        faceDirVector.set(1, 0, 0);
        uvs[j + 0] = getUv(faceDirVector, normal, "z", "y", radius, depth, tempNormal);
        uvs[j + 1] = 1.0 - getUv(faceDirVector, normal, "y", "z", radius, height, tempNormal);
        break;
      case 1:
        faceDirVector.set(-1, 0, 0);
        uvs[j + 0] = 1.0 - getUv(faceDirVector, normal, "z", "y", radius, depth, tempNormal);
        uvs[j + 1] = 1.0 - getUv(faceDirVector, normal, "y", "z", radius, height, tempNormal);
        break;
      case 2:
        faceDirVector.set(0, 1, 0);
        uvs[j + 0] = 1.0 - getUv(faceDirVector, normal, "x", "z", radius, width, tempNormal);
        uvs[j + 1] = getUv(faceDirVector, normal, "z", "x", radius, depth, tempNormal);
        break;
      case 3:
        faceDirVector.set(0, -1, 0);
        uvs[j + 0] = 1.0 - getUv(faceDirVector, normal, "x", "z", radius, width, tempNormal);
        uvs[j + 1] = 1.0 - getUv(faceDirVector, normal, "z", "x", radius, depth, tempNormal);
        break;
      case 4:
        faceDirVector.set(0, 0, 1);
        uvs[j + 0] = 1.0 - getUv(faceDirVector, normal, "x", "y", radius, width, tempNormal);
        uvs[j + 1] = 1.0 - getUv(faceDirVector, normal, "y", "x", radius, height, tempNormal);
        break;
      case 5:
        faceDirVector.set(0, 0, -1);
        uvs[j + 0] = getUv(faceDirVector, normal, "x", "y", radius, width, tempNormal);
        uvs[j + 1] = 1.0 - getUv(faceDirVector, normal, "y", "x", radius, height, tempNormal);
        break;
    }
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
