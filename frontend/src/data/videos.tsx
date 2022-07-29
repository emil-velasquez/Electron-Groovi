let videos = [
    {
        id: "abc",
        videoName: "Love Shot Tutorial",
        choreographer: "123456",
        songName: "Love Shot",
        artistName: "EXO"
    }
]

export function getVideo(inputID: string) {
    return videos.find(
        (video) => video.id === inputID
    );
}