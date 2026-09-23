import { describe, it, expect } from "vitest";
import { TextWrapper } from "../../src/2D/controls/textWrapper";

describe("TextWrapper", () => {
    it("reports the text after construction", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "hello world";
        expect(wrapper.text).toBe("hello world");
        expect(wrapper.length).toBe("hello world".length);
    });

    it("inserts characters at the middle via removePart", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "helo";
        wrapper.removePart(2, 2, "l");
        expect(wrapper.text).toBe("hello");
        expect(wrapper.length).toBe(5);
    });

    it("inserts characters at the start", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "world";
        wrapper.removePart(0, 0, "hello ");
        expect(wrapper.text).toBe("hello world");
    });

    it("inserts characters at the end", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "hello";
        wrapper.removePart(5, 5, " world");
        expect(wrapper.text).toBe("hello world");
    });

    it("deletes a range", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "hello world";
        wrapper.removePart(5, 11);
        expect(wrapper.text).toBe("hello");
    });

    it("replaces a range in one call", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "hello world";
        wrapper.removePart(0, 5, "goodbye");
        expect(wrapper.text).toBe("goodbye world");
    });

    it("keeps code points intact when inserting after a surrogate pair", () => {
        const wrapper = new TextWrapper();
        // Array.from splits by code point: "a" + 😀 (surrogate pair) + "b" => length 3
        wrapper.text = "a\ud83d\ude00b";
        expect(wrapper.length).toBe(3);
        wrapper.removePart(3, 3, "c");
        expect(wrapper.text).toBe("a\ud83d\ude00bc");
        // deleting the code-point index removes the whole surrogate pair
        wrapper.removePart(1, 2);
        expect(wrapper.text).toBe("abc");
        expect(wrapper.length).toBe(3);
    });

    it("charAt and substr stay consistent with the underlying text after edits", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "abcdef";
        wrapper.removePart(2, 4, "XY");
        expect(wrapper.text).toBe("abXYef");
        expect(wrapper.charAt(2)).toBe("X");
        expect(wrapper.charAt(3)).toBe("Y");
        expect(wrapper.substr(0, 2)).toBe("ab");
        expect(wrapper.substr(2)).toBe("XYef");
        expect(wrapper.substring(2, 4)).toBe("XY");
    });

    it("isWord classifies word characters after edits", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "ab-cd";
        expect(wrapper.isWord(0)).toBe(true);
        expect(wrapper.isWord(2)).toBe(false);
        wrapper.removePart(2, 3, "_");
        expect(wrapper.text).toBe("ab_cd");
        expect(wrapper.isWord(2)).toBe(true);
    });

    it("handles multiple sequential edits", () => {
        const wrapper = new TextWrapper();
        wrapper.text = "one two three";
        // remove " two" => "one three"
        wrapper.removePart(3, 7);
        expect(wrapper.text).toBe("one three");
        // insert at index 3 => "one four three"
        wrapper.removePart(3, 3, " four");
        expect(wrapper.text).toBe("one four three");
        // remove " three", append " two" => "one four two"
        wrapper.removePart(8, 14);
        wrapper.removePart(12, 12, " two");
        expect(wrapper.text).toBe("one four two");
    });
});
