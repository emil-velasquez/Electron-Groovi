let playlists = [
    {
        id: "123456",
        name: "Test",
        owner: "abcdef",
        videos: [
            "abc"
        ]
    }
]

export function getPlaylist(inputID: string | undefined) {
    return playlists.find(
        (playlist) => playlist.id === inputID
    );
}