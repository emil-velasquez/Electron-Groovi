export type RectType = {
    startX: number,
    startY: number,
    width: number,
    height: number,
    updatedRect: boolean
}

export type ChapterTag = {
    id: number,
    index: number
}

export type ChapterType = {
    name: string,
    start: number,
    end: number,
    rect: RectType,
    id: number
}