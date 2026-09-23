import { type IndicesArray } from "core/types";
import { BitArray } from "core/Misc/bitArray";

/**
 * Sort (in place) the index array so that faces with common indices are close
 * @param indices the array of indices to sort
 */
export function OptimizeIndices(indices: IndicesArray) {
    const faceCount = indices.length / 3;
    const faces: Array<Array<number>> = new Array<Array<number>>(faceCount);

    // Step 1: Break the indices array into faces
    for (let i = 0; i < faceCount; i++) {
        faces[i] = [indices[i * 3], indices[i * 3 + 1], indices[i * 3 + 2]];
    }

    // Step 2: Build a graph connecting faces sharing a vertex
    const vertexToFaceMap = new Map<number, number[]>();
    for (let faceIndex = 0; faceIndex < faces.length; faceIndex++) {
        const face = faces[faceIndex];
        for (let v = 0; v < face.length; v++) {
            const vertex = face[v];
            let faceList = vertexToFaceMap.get(vertex);
            if (!faceList) {
                vertexToFaceMap.set(vertex, (faceList = []));
            }
            faceList.push(faceIndex);
        }
    }

    // Step 3: Traverse faces using DFS to ensure connected faces are close
    const visited = new BitArray(faceCount);
    const sortedFaces: Array<number[]> = [];

    // Using a stack and not a recursive version to avoid call stack overflow
    const deepFirstSearchStack = (startFaceIndex: number) => {
        const stack: Array<number> = [startFaceIndex];

        while (stack.length > 0) {
            const currentFaceIndex = stack.pop()!;

            if (visited.get(currentFaceIndex)) {
                continue;
            }
            visited.set(currentFaceIndex, true);
            sortedFaces.push(faces[currentFaceIndex]);

            // Push unvisited neighbors (faces sharing a vertex) onto the stack
            const currentFace = faces[currentFaceIndex];
            for (let v = 0; v < currentFace.length; v++) {
                const neighbors = vertexToFaceMap.get(currentFace[v]);

                if (!neighbors) {
                    return;
                }

                for (let n = 0; n < neighbors.length; n++) {
                    if (!visited.get(neighbors[n])) {
                        stack.push(neighbors[n]);
                    }
                }
            }
        }
    };

    // Start DFS from the first face
    for (let i = 0; i < faceCount; i++) {
        if (!visited.get(i)) {
            deepFirstSearchStack(i);
        }
    }

    // Step 4: Flatten the sorted faces back into an array
    let index = 0;
    for (let s = 0; s < sortedFaces.length; s++) {
        const face = sortedFaces[s];
        indices[index++] = face[0];
        indices[index++] = face[1];
        indices[index++] = face[2];
    }
}
