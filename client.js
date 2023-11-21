const express = require("express")
const app = express()
const port = 5001

app.use(express.static("public"))

app.listen(port, () => {
  console.log(`Client app is listening at http://localhost:${port}`)
})
