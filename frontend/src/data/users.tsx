let users = [
    {
        id: "abcdef",
        name: "Emil",
        playlists: [
            "123456"
        ]
    },
    {
        id: "123456",
        name: "Lisa Rhee"
    }
]

export function getUser(inputID: string | undefined) {
    return users.find(
        (user) => user.id === inputID
    );
}