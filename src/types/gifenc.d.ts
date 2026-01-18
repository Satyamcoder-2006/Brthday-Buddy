declare module 'gifenc' {
    export function GIFEncoder(options?: any): any;
    export function quantize(rgba: Uint8Array, maxColors: number): any;
    export function applyPalette(rgba: Uint8Array, palette: any): any;
}
