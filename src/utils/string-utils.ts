import { DslError } from "../models/error-models/dsl-errors";
import stripAnsi from 'strip-ansi';

export function rejoinFromIndex(array: string[], startIndex: number): string {
    if (startIndex < 0 || startIndex >= array.length) {
        throw new DslError({
            traceLocation: "string-utils.rejoinFromIndex",
            message: "Invalid start index"
        });
    }
    return array.slice(startIndex).join(" ");
}

export function removeANSIEscapeCodes(text: string): string {
    const plainText = stripAnsi(text);
    return plainText;
}