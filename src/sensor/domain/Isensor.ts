
export class ISensor {
    constructor(
        readonly lumen: number,
        readonly temperature: number,
        readonly humidity: number,
    ) {}
}