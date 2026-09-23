import { getMaterialTextures, type Material, type SceneContext, type Texture2D } from "@babylonjs/lite";

/**
 * Gets the unique materials referenced by a scene's meshes.
 * @param scene The scene to inspect.
 * @returns The referenced materials in mesh order.
 */
export function GetSceneMaterials(scene: SceneContext): readonly Material[] {
    // Single pass with first-occurrence order: identical result to the previous
    // [...new Set(scene.meshes.map((mesh) => mesh.material))], without the intermediate arrays.
    const materials: Material[] = [];
    const seen = new Set<Material>();
    for (const mesh of scene.meshes) {
        const material = mesh.material;
        if (!seen.has(material)) {
            seen.add(material);
            materials.push(material);
        }
    }
    return materials;
}

/**
 * Gets the unique textures referenced by a scene's materials.
 * @param scene The scene to inspect.
 * @returns The referenced textures in material order.
 */
export function GetSceneTextures(scene: SceneContext): readonly Texture2D[] {
    // Single pass with first-occurrence order: identical result to the previous
    // [...new Set(materials.flatMap(...))], without the intermediate arrays.
    const textures: Texture2D[] = [];
    const seen = new Set<Texture2D>();
    for (const material of GetSceneMaterials(scene)) {
        for (const texture of getMaterialTextures(material)) {
            if (!seen.has(texture)) {
                seen.add(texture);
                textures.push(texture);
            }
        }
    }
    return textures;
}
