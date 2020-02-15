// Rooms must be const, didn't modified, push is enumerating not overriding.
const rooms = []

// Prefer arrow functions for better looking code
// If you don't use req, just _
app.get('/rooms', (_, res) => {
  // Map over rooms,
  const response = rooms.map(room => `<a href="${room}">${room}</a>`)
  res.send(response)
})

app.get('/room/:name', (req, res) => {
  const { name } = req.params
  rooms.push(name)
  res.send(name)
})
