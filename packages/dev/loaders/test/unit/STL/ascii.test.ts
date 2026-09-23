import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NullEngine } from "core/Engines/nullEngine";
import { Scene } from "core/scene";
import { STLFileLoader } from "loaders/STL/stlFileLoader.pure";

const TWO_FACET_STL = [
    "solid test",
    "facet normal 0 0 1",
    "  outer loop",
    "    vertex 0 0 0",
    "    vertex 1 0 0",
    "    vertex 0 1 0",
    "  endloop",
    "endfacet",
    "facet normal 1 0 0",
    "  outer loop",
    "    vertex 1 0 0",
    "    vertex 1 1 0",
    "    vertex 1 0 1",
    "  endloop",
    "endfacet",
    "endsolid test",
].join("\n");

describe("STL ASCII parsing", () => {
    let engine: NullEngine;
    let scene: Scene;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    it("parses a valid two-facet solid", () => {
        const meshes: any[] = [];
        const ok = new STLFileLoader().importMesh(null, scene, TWO_FACET_STL, "", meshes);

        expect(ok).toBe(true);
        expect(meshes.length).toBe(1);
        const vertexData = meshes[0].getVerticesData("position");
        expect(vertexData!.length).toBe(18);
        const indices = meshes[0].getIndices();
        expect(indices.length).toBe(6);
        const normals = meshes[0].getVerticesData("normal");
        expect(normals!.length).toBe(18);
    });

    it("produces identical geometry when trailing junk inflates the facet capacity estimate", () => {
        const clean: any[] = [];
        new STLFileLoader().importMesh(null, scene, TWO_FACET_STL, "", clean);
        const cleanPositions = Array.from(clean[0].getVerticesData("position")!);
        const cleanNormals = Array.from(clean[0].getVerticesData("normal")!);
        const cleanIndices = Array.from(clean[0].getIndices());

        // Trailing "endfacet" occurrences inflate the pre-scan capacity estimate;
        // the parser must still truncate to the actually parsed facet count.
        const junky = TWO_FACET_STL + "\njunk endfacet\njunk endfacet\njunk endfacet\njunk endfacet\n";
        const junkyMeshes: any[] = [];
        const ok = new STLFileLoader().importMesh(null, scene, junky, "", junkyMeshes);

        expect(ok).toBe(true);
        expect(junkyMeshes.length).toBe(1);
        expect(Array.from(junkyMeshes[0].getVerticesData("position")!)).toEqual(cleanPositions);
        expect(Array.from(junkyMeshes[0].getVerticesData("normal")!)).toEqual(cleanNormals);
        expect(Array.from(junkyMeshes[0].getIndices())).toEqual(cleanIndices);
    });

    it("reports geometry for each solid in a multi-solid file", () => {
        const multi = TWO_FACET_STL + "\n" + TWO_FACET_STL.replace("solid test", "solid second").replace("endsolid test", "endsolid second");
        const meshes: any[] = [];
        const ok = new STLFileLoader().importMesh(null, scene, multi, "", meshes);

        expect(ok).toBe(true);
        expect(meshes.length).toBe(2);
        expect(meshes[0].name).toBe("test");
        expect(meshes[1].name).toBe("second");
    });
});
